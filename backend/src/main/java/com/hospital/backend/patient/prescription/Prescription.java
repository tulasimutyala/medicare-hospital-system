
package com.hospital.backend.patient.prescription;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long appointmentId;
    private Long patientAccountId;

    private String patientCode;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private String medicineName;
    private String dosage;
    private String frequency;
    private Integer durationDays;

    @Column(length = 2000)
    private String instructions;

    private LocalDateTime createdAt;

    public Prescription() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAppointmentId() { return appointmentId; }
    public Long getPatientAccountId() { return patientAccountId; }
    public String getPatientCode() { return patientCode; }
    public String getPatientName() { return patientName; }
    public String getDoctorName() { return doctorName; }
    public String getDiagnosis() { return diagnosis; }
    public String getMedicineName() { return medicineName; }
    public String getDosage() { return dosage; }
    public String getFrequency() { return frequency; }
    public Integer getDurationDays() { return durationDays; }
    public String getInstructions() { return instructions; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public void setPatientAccountId(Long patientAccountId) {
        this.patientAccountId = patientAccountId;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}
