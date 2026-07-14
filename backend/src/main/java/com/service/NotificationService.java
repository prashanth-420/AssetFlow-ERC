package com.service;

import com.entity.Employee;
import com.entity.Notification;
import com.repository.EmployeeRepository;
import com.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    public List<Notification> getNotificationsForEmployee(Long employeeId) {
        return notificationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    @Transactional
    public Notification createNotification(Long employeeId, String title, String message, String type) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for notification."));

        Notification notification = Notification.builder()
                .employee(employee)
                .title(title)
                .message(message)
                .notificationType(type)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
}
