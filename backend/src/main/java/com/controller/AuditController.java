package com.controller;

import com.entity.AuditCycle;
import com.entity.AuditEntry;
import com.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audits")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditCycle>> getAllCycles() {
        return ResponseEntity.ok(auditService.getAllCycles());
    }

    @GetMapping("/{cycleId}/entries")
    public ResponseEntity<List<AuditEntry>> getEntriesByCycle(@PathVariable Long cycleId) {
        return ResponseEntity.ok(auditService.getEntriesByCycle(cycleId));
    }

    @PostMapping
    public ResponseEntity<?> createCycle(@RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("auditName");
            Number departmentId = (Number) body.get("departmentId");
            String location = (String) body.get("location");
            
            String startStr = (String) body.get("startDate");
            LocalDate startDate = startStr != null && !startStr.isEmpty() ? LocalDate.parse(startStr) : LocalDate.now();
            
            String endStr = (String) body.get("endDate");
            LocalDate endDate = endStr != null && !endStr.isEmpty() ? LocalDate.parse(endStr) : LocalDate.now().plusDays(15);
            
            Number creatorId = (Number) body.get("creatorId");

            AuditCycle cycle = auditService.createCycle(
                    name,
                    departmentId != null ? departmentId.longValue() : null,
                    location,
                    startDate,
                    endDate,
                    creatorId != null ? creatorId.longValue() : null
            );
            return ResponseEntity.ok(cycle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{cycleId}/entries/{assetId}/verify")
    public ResponseEntity<?> verifyAsset(@PathVariable Long cycleId, @PathVariable Long assetId, @RequestBody Map<String, Object> body) {
        try {
            String status = (String) body.get("verificationStatus");
            String remarks = (String) body.get("remarks");
            Number auditorId = (Number) body.get("auditorId");

            AuditEntry entry = auditService.verifyAsset(
                    cycleId,
                    assetId,
                    status,
                    remarks,
                    auditorId != null ? auditorId.longValue() : null
            );
            return ResponseEntity.ok(entry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{cycleId}/close")
    public ResponseEntity<?> closeCycle(@PathVariable Long cycleId) {
        try {
            AuditCycle cycle = auditService.closeCycle(cycleId);
            return ResponseEntity.ok(cycle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
