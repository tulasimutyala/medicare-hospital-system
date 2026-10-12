
package com.hospital.backend.patient;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private static final List<String> ROLES =
            List.of("PATIENT", "DOCTOR", "ADMIN");

    public record PatientResponse(
            Long id,
            String name,
            int age,
            String gender,
            String phone,
            String email,
            String address,
            String role,
            String dateOfBirth,
            String bloodGroup,
            Double heightCm,
            Double weightKg,
            String allergies,
            String existingConditions,
            String currentMedications,
            String previousSurgeries,
            String emergencyContactName,
            String emergencyContactPhone) {

        static PatientResponse from(Patient p) {
            return new PatientResponse(
                    p.getId(),
                    p.getName(),
                    p.getAge(),
                    p.getGender(),
                    p.getPhone(),
                    p.getEmail(),
                    p.getAddress(),
                    p.getRole(),
                    p.getDateOfBirth(),
                    p.getBloodGroup(),
                    p.getHeightCm(),
                    p.getWeightKg(),
                    p.getAllergies(),
                    p.getExistingConditions(),
                    p.getCurrentMedications(),
                    p.getPreviousSurgeries(),
                    p.getEmergencyContactName(),
                    p.getEmergencyContactPhone()
            );
        }
    }

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientController(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Admin: all patients.
    // Doctor: only patients with appointments assigned to that doctor.
    @GetMapping
    public List<PatientResponse> getPatients(
            @AuthenticationPrincipal Jwt jwt) {

        String role = claim(jwt, "role");
        List<Patient> patients;

        if ("ADMIN".equals(role)) {
            patients = patientRepository.findAll();
        } else if ("DOCTOR".equals(role)) {
            patients = patientsOfDoctor(claim(jwt, "name"));
        } else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only doctors and administrators can list patient records");
        }

        return patients.stream()
                .map(PatientResponse::from)
                .toList();
    }

    // A patient can load their own profile.
    // A doctor can load a patient only if they have an appointment with them.
    @GetMapping("/{id}")
    public PatientResponse getPatientById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(this::notFound);

        if (!canView(jwt, patient)) {
            throw notFound();
        }

        return PatientResponse.from(patient);
    }

    // Admin-only account creation.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse createPatient(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Patient patient) {

        requireAdmin(jwt);

        if (patient.getName() == null || patient.getName().isBlank()
                || patient.getEmail() == null
                || patient.getEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name and email are required");
        }

        if (patient.getPassword() == null
                || patient.getPassword().length() < 8
                || patient.getPassword()
                        .getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be 8 to 72 characters long");
        }

        String email = patient.getEmail().trim().toLowerCase();

        if (patientRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered");
        }

        String role = patient.getRole() == null
                ? "PATIENT"
                : patient.getRole().trim().toUpperCase();

        if (!ROLES.contains(role)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role must be PATIENT, DOCTOR or ADMIN");
        }

        patient.setId(null);
        patient.setEmail(email);
        patient.setRole(role);
        patient.setPassword(
                passwordEncoder.encode(patient.getPassword()));

        return PatientResponse.from(patientRepository.save(patient));
    }

    // Update profile: patient can edit only their own profile.
    // Admin can update another patient's profile.
    // Password and role cannot be changed through this endpoint.
    @PutMapping("/{id}")
    public PatientResponse updatePatient(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody Patient updatedPatient) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(this::notFound);

        boolean isAdmin = "ADMIN".equals(claim(jwt, "role"));
        boolean isSelf =
                String.valueOf(patient.getId()).equals(jwt.getSubject());

        if (!isAdmin && !isSelf) {
            throw notFound();
        }

        if (updatedPatient.getEmail() != null
                && !updatedPatient.getEmail().isBlank()) {

            String email =
                    updatedPatient.getEmail().trim().toLowerCase();

            patientRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Email already registered");
                }
            });

            patient.setEmail(email);
        }

        // Personal information
        if (updatedPatient.getName() != null) {
            patient.setName(updatedPatient.getName().trim());
        }
        if (updatedPatient.getAge() > 0) {
            patient.setAge(updatedPatient.getAge());
        }
        if (updatedPatient.getGender() != null) {
            patient.setGender(updatedPatient.getGender());
        }
        if (updatedPatient.getPhone() != null) {
            patient.setPhone(updatedPatient.getPhone());
        }
        if (updatedPatient.getAddress() != null) {
            patient.setAddress(updatedPatient.getAddress());
        }
        if (updatedPatient.getDateOfBirth() != null) {
            patient.setDateOfBirth(updatedPatient.getDateOfBirth());
        }

        // Health information
        if (updatedPatient.getBloodGroup() != null) {
            patient.setBloodGroup(updatedPatient.getBloodGroup());
        }
        if (updatedPatient.getHeightCm() != null) {
            validatePositive(
                    updatedPatient.getHeightCm(), "Height");
            patient.setHeightCm(updatedPatient.getHeightCm());
        }
        if (updatedPatient.getWeightKg() != null) {
            validatePositive(
                    updatedPatient.getWeightKg(), "Weight");
            patient.setWeightKg(updatedPatient.getWeightKg());
        }
        if (updatedPatient.getAllergies() != null) {
            patient.setAllergies(updatedPatient.getAllergies());
        }
        if (updatedPatient.getExistingConditions() != null) {
            patient.setExistingConditions(
                    updatedPatient.getExistingConditions());
        }
        if (updatedPatient.getCurrentMedications() != null) {
            patient.setCurrentMedications(
                    updatedPatient.getCurrentMedications());
        }
        if (updatedPatient.getPreviousSurgeries() != null) {
            patient.setPreviousSurgeries(
                    updatedPatient.getPreviousSurgeries());
        }
        if (updatedPatient.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(
                    updatedPatient.getEmergencyContactName());
        }
        if (updatedPatient.getEmergencyContactPhone() != null) {
            patient.setEmergencyContactPhone(
                    updatedPatient.getEmergencyContactPhone());
        }

        // Saving this entity persists the profile fields in MySQL.
        Patient saved = patientRepository.save(patient);

        return PatientResponse.from(saved);
    }

    // Admin-only role changes.
    @PutMapping("/{id}/role")
    public PatientResponse changeRole(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        requireAdmin(jwt);

        String role = body.get("role") == null
                ? ""
                : body.get("role").trim().toUpperCase();

        if (!ROLES.contains(role)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role must be PATIENT, DOCTOR or ADMIN");
        }

        if (String.valueOf(id).equals(jwt.getSubject())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You cannot change your own role");
        }

        Patient patient = patientRepository.findById(id)
                .orElseThrow(this::notFound);

        patient.setRole(role);

        return PatientResponse.from(patientRepository.save(patient));
    }

    // Admin-only deletion.
    @DeleteMapping("/{id}")
    public void deletePatient(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {

        requireAdmin(jwt);

        if (String.valueOf(id).equals(jwt.getSubject())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You cannot delete your own account");
        }

        if (!patientRepository.existsById(id)) {
            throw notFound();
        }

        patientRepository.deleteById(id);
    }

    private boolean canView(Jwt jwt, Patient target) {
        String role = claim(jwt, "role");

        if ("ADMIN".equals(role)) {
            return true;
        }

        if ("PATIENT".equals(role)) {
            return String.valueOf(target.getId())
                    .equals(jwt.getSubject());
        }

        if ("DOCTOR".equals(role)) {
            return patientsOfDoctor(claim(jwt, "name")).stream()
                    .anyMatch(p -> p.getId().equals(target.getId()));
        }

        return false;
    }

    private List<Patient> patientsOfDoctor(String doctorName) {
        Map<Long, Patient> found = new LinkedHashMap<>();

        for (Appointment appointment :
                appointmentRepository.findByDoctorNameIgnoreCase(doctorName)) {

            Patient patient = null;

            if (appointment.getPatientId() != null) {
                patient = patientRepository
                        .findById(appointment.getPatientId())
                        .orElse(null);
            } else if (appointment.getEmail() != null) {
                patient = patientRepository
                        .findByEmail(
                                appointment.getEmail().trim().toLowerCase())
                        .orElse(null);
            }

            if (patient != null) {
                found.putIfAbsent(patient.getId(), patient);
            }
        }

        return new ArrayList<>(found.values());
    }

    private void validatePositive(Double value, String label) {
        if (value <= 0 || !Double.isFinite(value)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    label + " must be a positive number");
        }
    }

    private void requireAdmin(Jwt jwt) {
        if (!"ADMIN".equals(claim(jwt, "role"))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrators only");
        }
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Patient not found");
    }

    private String claim(Jwt jwt, String name) {
        String value = jwt.getClaimAsString(name);
        return value == null ? "" : value.trim();
    }
}
