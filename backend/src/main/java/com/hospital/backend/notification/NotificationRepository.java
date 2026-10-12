
package com.hospital.backend.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientAccountIdOrderByCreatedAtDesc(
            Long recipientAccountId);

    Optional<Notification> findByIdAndRecipientAccountId(
            Long id, Long recipientAccountId);

    // Delete only notifications belonging to the specified account.
    long deleteByRecipientAccountId(Long recipientAccountId);
}
