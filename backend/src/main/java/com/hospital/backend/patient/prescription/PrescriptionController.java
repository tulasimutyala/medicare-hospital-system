
package com.hospital.backend.patient.prescription;

import com.hospital.backend.patient.Appointment;
import com.hospital.backend.patient.AppointmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class PrescriptionController {

    private final PrescriptionRepository repository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionController(
            PrescriptionRepository repository,
            AppointmentRepository appointmentRepository) {
        this.repository = repository;
        this.appointmentRepository = appointmentRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Prescription savePrescription(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Prescription prescription) {

        if (!"DOCTOR".equals(claim(jwt, "role"))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only doctors can create prescriptions");
        }

        Long appointmentId = prescription.getAppointmentId();

        if (appointmentId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment ID is required");
        }

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Appointment not found"));

        String doctorName = claim(jwt, "name");

        if (appointment.getDoctorName() == null
                || !appointment.getDoctorName().trim()
                        .equalsIgnoreCase(doctorName)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can prescribe only for your own appointments");
        }

        if (appointment.getPatientId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This appointment has no linked patient account");
        }

        if (prescription.getMedicineName() == null
                || prescription.getMedicineName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Medicine name is required");
        }

        prescription.setId(null);
        prescription.setPatientAccountId(appointment.getPatientId());
        prescription.setPatientCode(
                prescription.getPatientCode() == null
                        ? ""
                        : prescription.getPatientCode().trim());
        prescription.setPatientName(appointment.getPatientName());
        prescription.setDoctorName(doctorName);

        return repository.save(prescription);
    }

    @GetMapping
    public List<Prescription> getPrescriptions(
            @AuthenticationPrincipal Jwt jwt) {

        String role = claim(jwt, "role");

        if ("PATIENT".equals(role)) {
            return repository.findByPatientAccountId(accountId(jwt));
        }

        if ("DOCTOR".equals(role)) {
            return repository.findAll().stream()
                    .filter(rx -> rx.getAppointmentId() != null)
                    .filter(rx -> appointmentRepository
                            .findById(rx.getAppointmentId())
                            .map(a -> a.getDoctorName() != null
                                    && a.getDoctorName().trim()
                                            .equalsIgnoreCase(
                                                    claim(jwt, "name")))
                            .orElse(false))
                    .toList();
        }

        if ("ADMIN".equals(role)) {
            return repository.findAll();
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Not allowed to view prescriptions");
    }

    private String claim(Jwt jwt, String name) {
        if (jwt == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required");
        }

        String value = jwt.getClaimAsString(name);
        return value == null ? "" : value.trim();
    }

    private Long accountId(Jwt jwt) {
        try {
            return Long.valueOf(jwt.getSubject());
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid account ID");
        }
    }
}
