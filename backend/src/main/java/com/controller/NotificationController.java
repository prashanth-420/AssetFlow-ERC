package com.controller;

import com.entity.Notification;
import com.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Notification>> getNotificationsForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(notificationService.getNotificationsForEmployee(employeeId));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, Object> body) {
        Number employeeId = (Number) body.get("employeeId");
        String title = (String) body.get("title");
        String message = (String) body.get("message");
        String type = (String) body.get("type");

        Notification notification = notificationService.createNotification(
                employeeId != null ? employeeId.longValue() : null,
                title,
                message,
                type
        );
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
}
