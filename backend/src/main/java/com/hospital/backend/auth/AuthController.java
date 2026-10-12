package com.hospital.backend.auth;

import com.hospital.backend.config.JwtService;
import com.hospital.backend.patient.Patient;
import com.hospital.backend.patient.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Patient patient) {

        if (patient.getName() == null || patient.getName().isBlank()
                || patient.getEmail() == null || patient.getEmail().isBlank()
                || patient.getPassword() == null || patient.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email, and a password of at least 8 characters are required."));
        }

        // BCrypt only uses the first 72 bytes of a password.
        if (patient.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at most 72 characters long."));
        }

        String email = patient.getEmail().trim().toLowerCase();

        if (patientRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This email is already registered."));
        }

        patient.setId(null);
        patient.setEmail(email);
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        patient.setRole("PATIENT"); // self-registration can only create patients

        Patient saved = patientRepository.save(patient);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message", "Registration successful.", "id", saved.getId(),
                       "name", saved.getName(), "email", saved.getEmail(),
                       "role", saved.getRole())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> details) {

        String email = details.get("email");
        String password = details.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email and password are required."));
        }

        Patient patient = patientRepository
                .findByEmail(email.trim().toLowerCase())
                .orElse(null);

        if (patient == null || !passwordEncoder.matches(password, patient.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Login successful.");
        body.put("id", patient.getId());
        body.put("name", patient.getName());
        body.put("email", patient.getEmail());
        body.put("role", patient.getRole());
        body.put("token", jwtService.createToken(patient));

        return ResponseEntity.ok(body);
    }
}
