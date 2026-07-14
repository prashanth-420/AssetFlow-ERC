package com.service;

import com.entity.ActivityLog;
import com.entity.Employee;
import com.repository.ActivityLogRepository;
import com.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final EmployeeRepository employeeRepository;

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ActivityLog logAction(Long employeeId, String module, String action, String referenceId, String description, String ipAddress) {
        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId).orElse(null);
        }

        ActivityLog log = ActivityLog.builder()
                .employee(employee)
                .module(module)
                .action(action)
                .referenceId(referenceId)
                .description(description)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .build();

        return activityLogRepository.save(log);
    }
}
