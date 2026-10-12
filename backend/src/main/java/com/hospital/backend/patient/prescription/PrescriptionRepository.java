
package com.hospital.backend.patient.prescription;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientCode(String patientCode);

    List<Prescription> findByPatientAccountId(Long patientAccountId);
}
