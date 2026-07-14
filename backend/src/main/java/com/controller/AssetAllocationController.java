package com.controller;

import com.entity.AssetAllocation;
import com.service.AssetAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AssetAllocationController {

    private final AssetAllocationService assetAllocationService;

    @GetMapping
    public ResponseEntity<List<AssetAllocation>> getActiveAllocations() {
        return ResponseEntity.ok(assetAllocationService.getActiveAllocations());
    }

    @PostMapping
    public ResponseEntity<?> allocateAsset(@RequestBody Map<String, Object> body) {
        try {
            Number assetId = (Number) body.get("assetId");
            Number employeeId = (Number) body.get("employeeId");
            Number departmentId = (Number) body.get("departmentId");
            Number allocatedById = (Number) body.get("allocatedById");
            
            String expectedReturnDateStr = (String) body.get("expectedReturnDate");
            LocalDate expectedReturnDate = expectedReturnDateStr != null && !expectedReturnDateStr.isEmpty() ? LocalDate.parse(expectedReturnDateStr) : null;

            AssetAllocation allocation = assetAllocationService.allocateAsset(
                    assetId != null ? assetId.longValue() : null,
                    employeeId != null ? employeeId.longValue() : null,
                    departmentId != null ? departmentId.longValue() : null,
                    allocatedById != null ? allocatedById.longValue() : null,
                    expectedReturnDate
            );
            return ResponseEntity.ok(allocation);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage(), "conflict", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/return")
    public ResponseEntity<?> returnAsset(@RequestBody Map<String, Object> body) {
        try {
            Number assetId = (Number) body.get("assetId");
            String notes = (String) body.get("notes");
            AssetAllocation allocation = assetAllocationService.returnAsset(
                    assetId != null ? assetId.longValue() : null,
                    notes
            );
            return ResponseEntity.ok(allocation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
