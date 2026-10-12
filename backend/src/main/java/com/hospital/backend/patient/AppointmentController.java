
package com.hospital.backend.patient;

import com.hospital.backend.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private static final String CANCELLED = "Cancelled";

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Appointment> getAppointments(
            @AuthenticationPrincipal Jwt jwt) {
        String role = claim(jwt, "role");

        if ("ADMIN".equals(role)) {
            return appointmentRepository.findAll();
        }
        if ("DOCTOR".equals(role)) {
            return appointmentRepository.findByDoctorNameIgnoreCase(
                    claim(jwt, "name"));
        }
        if ("PATIENT".equals(role)) {
            return appointmentRepository.findOwnedBy(
                    accountId(jwt), claim(jwt, "email"));
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Not allowed");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment createAppointment(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Appointment appointment) {

        if (!"PATIENT".equals(claim(jwt, "role"))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only patient accounts can book appointments");
        }

        requireText(appointment.getPatientName(), "Patient name");
        requireText(appointment.getDoctorName(), "Doctor");
        requireValidFutureDate(appointment.getAppointmentDate());
        requireText(appointment.getAppointmentTime(), "Appointment time");

        if (appointmentRepository
                .existsByDoctorNameAndAppointmentDateAndAppointmentTimeAndStatusNot(
                        appointment.getDoctorName(),
                        appointment.getAppointmentDate(),
                        appointment.getAppointmentTime(),
                        CANCELLED)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "That time slot is already booked");
        }

        if (appointment.getEmail() == null
                || appointment.getEmail().isBlank()) {
            appointment.setEmail(claim(jwt, "email"));
        }

        appointment.setId(null);
        appointment.setPatientId(accountId(jwt));
        appointment.setStatus("Booked");

        Appointment saved =
                appointmentRepository.save(appointment);

        notifyPatient(
                saved,
                "APPOINTMENT_BOOKED",
                "Appointment booked",
                "Your appointment with Dr. "
                        + saved.getDoctorName()
                        + " is booked for "
                        + saved.getAppointmentDate()
                        + " at " + saved.getAppointmentTime() + ".");

        return saved;
    }

    @PutMapping("/{id}/cancel")
    public Appointment cancelAppointment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {

        Appointment appointment = findManageable(jwt, id);

        if (CANCELLED.equalsIgnoreCase(appointment.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Appointment is already cancelled");
        }

        appointment.setStatus(CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);

        notifyPatient(
                saved,
                "APPOINTMENT_CANCELLED",
                "Appointment cancelled",
                "Your appointment with Dr. "
                        + saved.getDoctorName()
                        + " on " + saved.getAppointmentDate()
                        + " at " + saved.getAppointmentTime()
                        + " has been cancelled.");

        return saved;
    }

    @PutMapping("/{id}/reschedule")
    public Appointment rescheduleAppointment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody Appointment updatedAppointment) {

        Appointment appointment = findManageable(jwt, id);

        if (CANCELLED.equalsIgnoreCase(appointment.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cancelled appointments cannot be rescheduled");
        }

        requireValidFutureDate(
                updatedAppointment.getAppointmentDate());
        requireText(
                updatedAppointment.getAppointmentTime(),
                "Appointment time");

        if (appointmentRepository
                .existsByDoctorNameAndAppointmentDateAndAppointmentTimeAndStatusNotAndIdNot(
                        appointment.getDoctorName(),
                        updatedAppointment.getAppointmentDate(),
                        updatedAppointment.getAppointmentTime(),
                        CANCELLED,
                        id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "That time slot is already booked");
        }

        appointment.setAppointmentDate(
                updatedAppointment.getAppointmentDate());
        appointment.setAppointmentTime(
                updatedAppointment.getAppointmentTime());
        appointment.setStatus("Rescheduled");

        Appointment saved =
                appointmentRepository.save(appointment);

        notifyPatient(
                saved,
                "APPOINTMENT_RESCHEDULED",
                "Appointment rescheduled",
                "Your appointment with Dr. "
                        + saved.getDoctorName()
                        + " has been rescheduled to "
                        + saved.getAppointmentDate()
                        + " at " + saved.getAppointmentTime() + ".");

        return saved;
    }

    

    private void notifyPatient(
            Appointment appointment,
            String type,
            String title,
            String message) {

        notificationService.notifyAppointment(
                appointment,
                type,
                title,
                message);
    }


    private Appointment findManageable(Jwt jwt, Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Appointment not found"));

        if (!canManage(jwt, appointment)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Appointment not found");
        }

        return appointment;
    }

    private boolean canManage(Jwt jwt, Appointment appointment) {
        String role = claim(jwt, "role");

        if ("ADMIN".equals(role)) {
            return true;
        }

        if ("DOCTOR".equals(role)) {
            return appointment.getDoctorName() != null
                    && appointment.getDoctorName().trim()
                            .equalsIgnoreCase(claim(jwt, "name"));
        }

        if ("PATIENT".equals(role)) {
            if (appointment.getPatientId() != null) {
                return appointment.getPatientId().equals(accountId(jwt));
            }

            return appointment.getEmail() != null
                    && appointment.getEmail().trim()
                            .equalsIgnoreCase(claim(jwt, "email"));
        }

        return false;
    }

    private String claim(Jwt jwt, String name) {
        String value = jwt.getClaimAsString(name);
        return value == null ? "" : value.trim();
    }

    private Long accountId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    private void requireText(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, label + " is required");
        }
    }

    private void requireValidFutureDate(String value) {
        requireText(value, "Appointment date");

        try {
            LocalDate date = LocalDate.parse(value.trim());

            if (date.isBefore(LocalDate.now())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Appointment date cannot be in the past");
            }
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment date must be in YYYY-MM-DD format");
        }
    }
}
