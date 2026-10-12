package com.hospital.backend.config;

import com.hospital.backend.patient.Patient;
import com.hospital.backend.patient.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.doctor.email:${DEMO_DOCTOR_EMAIL:samuel.okafor@medicare.local}}")
    private String doctorEmail;

    @Value("${app.demo.doctor.password:${DEMO_DOCTOR_PASSWORD:}}")
    private String doctorPassword;

    @Value("${app.demo.doctor.name:${DEMO_DOCTOR_NAME:Dr. Samuel Okafor}}")
    private String doctorName;

    public DataInitializer(
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (doctorPassword == null || doctorPassword.trim().isBlank()) {
            logger.warn("DEMO_DOCTOR_PASSWORD is not set or blank. Skipping demo doctor initialization.");
            return;
        }

        if (doctorEmail == null || doctorEmail.trim().isBlank()) {
            logger.warn("DEMO_DOCTOR_EMAIL is not set or blank. Skipping demo doctor initialization.");
            return;
        }

        String email = doctorEmail.trim().toLowerCase();

        if (patientRepository.existsByEmail(email)) {
            logger.info("Doctor account already exists for email: {}. Skipping initialization.", email);
            return;
        }

        Patient doctor = new Patient();
        doctor.setName(doctorName == null || doctorName.trim().isBlank() ? "Dr. Samuel Okafor" : doctorName.trim());
        doctor.setEmail(email);
        doctor.setPassword(passwordEncoder.encode(doctorPassword.trim()));
        doctor.setRole("DOCTOR");
        doctor.setPhone("+91 98765 43210");

        patientRepository.save(doctor);
        logger.info("Demo doctor account successfully created for email: {}", email);
    }
}
