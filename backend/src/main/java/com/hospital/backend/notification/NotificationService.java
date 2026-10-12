
package com.hospital.backend.notification;

import com.hospital.backend.patient.Appointment;
import com.hospital.backend.patient.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final PatientRepository patientRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            PatientRepository patientRepository) {
        this.notificationRepository = notificationRepository;
        this.patientRepository = patientRepository;
    }

    public List<Notification> getNotifications(Long accountId) {
        return notificationRepository
                .findByRecipientAccountIdOrderByCreatedAtDesc(accountId);
    }

    @Transactional
    public Notification createNotification(
            Long recipientAccountId,
            Long appointmentId,
            String type,
            String title,
            String message) {

        if (recipientAccountId == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setRecipientAccountId(recipientAccountId);
        notification.setAppointmentId(appointmentId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAppointment(
            Appointment appointment,
            String type,
            String title,
            String message) {

        // Notify the patient who booked the appointment.
        createNotification(
                appointment.getPatientId(),
                appointment.getId(),
                type,
                title,
                message);

        // Notify the doctor account matching the appointment's doctor name.
        if (appointment.getDoctorName() != null
                && !appointment.getDoctorName().isBlank()) {

            patientRepository
                    .findFirstByRoleIgnoreCaseAndNameIgnoreCase(
                            "DOCTOR",
                            appointment.getDoctorName().trim())
                    .ifPresent(doctor -> createNotification(
                            doctor.getId(),
                            appointment.getId(),
                            type,
                            title,
                            message));
        }
    }

    @Transactional
    public boolean markAsRead(Long id, Long accountId) {
        return notificationRepository
                .findByIdAndRecipientAccountId(id, accountId)
                .map(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public int markAllAsRead(Long accountId) {
        List<Notification> notifications =
                notificationRepository
                        .findByRecipientAccountIdOrderByCreatedAtDesc(
                                accountId);

        int count = 0;

        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
                count++;
            }
        }

        return count;
    }

    // Permanently delete only the current user's notifications.
    @Transactional
    public long clearNotifications(Long accountId) {
        return notificationRepository
                .deleteByRecipientAccountId(accountId);
    }

    // Compatibility methods for existing controllers.
    public void markRead(Long id, Long accountId) {
        if (!markAsRead(id, accountId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "Notification not found");
        }
    }

    public void markAllRead(Long accountId) {
        markAllAsRead(accountId);
    }
}
