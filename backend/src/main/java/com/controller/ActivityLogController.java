package com.controller;

import com.entity.ActivityLog;
import com.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllLogs() {
        return ResponseEntity.ok(activityLogService.getAllLogs());
    }

    @PostMapping
    public ResponseEntity<ActivityLog> logAction(@RequestBody Map<String, Object> body) {
        Number employeeId = (Number) body.get("employeeId");
        String module = (String) body.get("module");
        String action = (String) body.get("action");
        String referenceId = (String) body.get("referenceId");
        String description = (String) body.get("description");
        String ipAddress = (String) body.get("ipAddress");

        ActivityLog log = activityLogService.logAction(
                employeeId != null ? employeeId.longValue() : null,
                module,
                action,
                referenceId,
                description,
                ipAddress
        );
        return ResponseEntity.ok(log);
    }
}
