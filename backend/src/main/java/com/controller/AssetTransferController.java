package com.controller;

import com.entity.AssetTransferRequest;
import com.service.AssetTransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AssetTransferController {

    private final AssetTransferService assetTransferService;

    @GetMapping
    public ResponseEntity<List<AssetTransferRequest>> getAllTransfers() {
        return ResponseEntity.ok(assetTransferService.getAllTransfers());
    }

    @PostMapping
    public ResponseEntity<?> requestTransfer(@RequestBody Map<String, Object> body) {
        try {
            Number assetId = (Number) body.get("assetId");
            Number toEmployeeId = (Number) body.get("toEmployeeId");
            Number requestedById = (Number) body.get("requestedById");
            String remarks = (String) body.get("remarks");

            AssetTransferRequest transfer = assetTransferService.requestTransfer(
                    assetId != null ? assetId.longValue() : null,
                    toEmployeeId != null ? toEmployeeId.longValue() : null,
                    requestedById != null ? requestedById.longValue() : null,
                    remarks
            );
            return ResponseEntity.ok(transfer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveTransfer(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Number approvedById = (Number) body.get("approvedById");
            AssetTransferRequest transfer = assetTransferService.approveTransfer(id, approvedById != null ? approvedById.longValue() : null);
            return ResponseEntity.ok(transfer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectTransfer(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Number rejectedById = (Number) body.get("rejectedById");
            String remarks = (String) body.get("remarks");
            AssetTransferRequest transfer = assetTransferService.rejectTransfer(id, rejectedById != null ? rejectedById.longValue() : null, remarks);
            return ResponseEntity.ok(transfer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
