package com.hospital.backend.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    // Appointments assigned to a doctor (matched by the doctor's account name).
    List<Appointment> findByDoctorNameIgnoreCase(String doctorName);

    // A patient's own appointments. Older rows without a patientId are
    // matched by the email that was used when booking.
    @Query("select a from Appointment a where a.patientId = :patientId "
            + "or (a.patientId is null and lower(a.email) = lower(:email))")
    List<Appointment> findOwnedBy(
            @Param("patientId") Long patientId,
            @Param("email") String email);

    // Is this doctor/date/time already taken by a non-cancelled appointment?
    boolean existsByDoctorNameAndAppointmentDateAndAppointmentTimeAndStatusNot(
            String doctorName,
            String appointmentDate,
            String appointmentTime,
            String status);

    // Same check, ignoring the appointment being rescheduled.
    boolean existsByDoctorNameAndAppointmentDateAndAppointmentTimeAndStatusNotAndIdNot(
            String doctorName,
            String appointmentDate,
            String appointmentTime,
            String status,
            Long id);
}
