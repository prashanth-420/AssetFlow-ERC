package com.controller;

import com.entity.MaintenanceRequest;
import com.service.MaintenanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class MaintenanceController {

    private final MaintenanceRequestService maintenanceRequestService;

    @GetMapping
    public ResponseEntity<List<MaintenanceRequest>> getAllRequests() {
        return ResponseEntity.ok(maintenanceRequestService.getAllRequests());
    }

    @PostMapping
    public ResponseEntity<?> raiseRequest(@RequestBody Map<String, Object> body) {
        try {
            Number assetId = (Number) body.get("assetId");
            Number raisedById = (Number) body.get("raisedById");
            String issue = (String) body.get("issueDescription");
            String priority = (String) body.get("priority");
            String photoUrl = (String) body.get("photoUrl");

            MaintenanceRequest request = maintenanceRequestService.raiseRequest(
                    assetId != null ? assetId.longValue() : null,
                    raisedById != null ? raisedById.longValue() : null,
                    issue,
                    priority,
                    photoUrl
            );
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String status = (String) body.get("status");
            Number actorEmployeeId = (Number) body.get("actorEmployeeId");
            String technicianName = (String) body.get("technicianName");
            String remarks = (String) body.get("remarks");

            MaintenanceRequest request = maintenanceRequestService.updateStatus(
                    id,
                    status,
                    actorEmployeeId != null ? actorEmployeeId.longValue() : null,
                    technicianName,
                    remarks
            );
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
