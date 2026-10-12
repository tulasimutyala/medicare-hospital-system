
package com.hospital.backend.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

    boolean existsByEmail(String email);
    java.util.Optional<Patient> findFirstByRoleIgnoreCaseAndNameIgnoreCase(
        String role, String name);
}
