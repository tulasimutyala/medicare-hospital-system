package com.hospital.backend.config;

import com.hospital.backend.patient.Patient;
import com.hospital.backend.patient.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        dataInitializer = new DataInitializer(patientRepository, passwordEncoder);
        ReflectionTestUtils.setField(dataInitializer, "doctorEmail", "samuel.okafor@medicare.local");
        ReflectionTestUtils.setField(dataInitializer, "doctorName", "Dr. Samuel Okafor");
    }

    @Test
    void whenPasswordIsMissing_shouldSkipInitialization() {
        ReflectionTestUtils.setField(dataInitializer, "doctorPassword", "");

        dataInitializer.run();

        verify(patientRepository, never()).existsByEmail(anyString());
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void whenPasswordIsNull_shouldSkipInitialization() {
        ReflectionTestUtils.setField(dataInitializer, "doctorPassword", null);

        dataInitializer.run();

        verify(patientRepository, never()).existsByEmail(anyString());
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void whenAccountAlreadyExists_shouldNotDuplicate() {
        ReflectionTestUtils.setField(dataInitializer, "doctorPassword", "securePassword123");
        when(patientRepository.existsByEmail("samuel.okafor@medicare.local")).thenReturn(true);

        dataInitializer.run();

        verify(patientRepository).existsByEmail("samuel.okafor@medicare.local");
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void whenPasswordProvidedAndAccountDoesNotExist_shouldCreateDoctor() {
        ReflectionTestUtils.setField(dataInitializer, "doctorPassword", "securePassword123");
        when(patientRepository.existsByEmail("samuel.okafor@medicare.local")).thenReturn(false);
        when(passwordEncoder.encode("securePassword123")).thenReturn("$2a$10$encodedHash");

        dataInitializer.run();

        ArgumentCaptor<Patient> captor = ArgumentCaptor.forClass(Patient.class);
        verify(patientRepository).save(captor.capture());

        Patient saved = captor.getValue();
        assertEquals("Dr. Samuel Okafor", saved.getName());
        assertEquals("samuel.okafor@medicare.local", saved.getEmail());
        assertEquals("$2a$10$encodedHash", saved.getPassword());
        assertEquals("DOCTOR", saved.getRole());
    }
}
