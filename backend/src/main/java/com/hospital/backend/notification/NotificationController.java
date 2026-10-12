
package com.hospital.backend.notification;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private Long getAccountId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                notificationService.getNotifications(
                        getAccountId(jwt)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        boolean updated = notificationService.markAsRead(
                id, getAccountId(jwt));

        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Notification not found");
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Integer> markAllAsRead(
            @AuthenticationPrincipal Jwt jwt) {

        int updatedCount = notificationService.markAllAsRead(
                getAccountId(jwt));

        return ResponseEntity.ok(updatedCount);
    }

    // Permanently clear notifications belonging to the logged-in account.
    @DeleteMapping
    public ResponseEntity<Integer> clearNotifications(
            @AuthenticationPrincipal Jwt jwt) {

        long deletedCount = notificationService.clearNotifications(
                getAccountId(jwt));

        return ResponseEntity.ok(
                Math.toIntExact(deletedCount));
    }
}
