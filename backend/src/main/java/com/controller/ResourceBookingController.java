package com.controller;

import com.entity.ResourceBooking;
import com.service.ResourceBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ResourceBookingController {

    private final ResourceBookingService resourceBookingService;

    @GetMapping
    public ResponseEntity<List<ResourceBooking>> getAllBookings() {
        return ResponseEntity.ok(resourceBookingService.getAllBookings());
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<ResourceBooking>> getBookingsByResource(@PathVariable Long resourceId) {
        return ResponseEntity.ok(resourceBookingService.getBookingsByResource(resourceId));
    }

    @PostMapping
    public ResponseEntity<?> bookResource(@RequestBody Map<String, Object> body) {
        try {
            Number resourceId = (Number) body.get("resourceId");
            Number employeeId = (Number) body.get("employeeId");
            String purpose = (String) body.get("purpose");
            
            String startStr = (String) body.get("startDatetime");
            LocalDateTime start = startStr != null ? LocalDateTime.parse(startStr) : LocalDateTime.now();
            
            String endStr = (String) body.get("endDatetime");
            LocalDateTime end = endStr != null ? LocalDateTime.parse(endStr) : LocalDateTime.now().plusHours(1);

            ResourceBooking booking = resourceBookingService.bookResource(
                    resourceId != null ? resourceId.longValue() : null,
                    employeeId != null ? employeeId.longValue() : null,
                    purpose,
                    start,
                    end
            );
            return ResponseEntity.ok(booking);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage(), "conflict", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            ResourceBooking booking = resourceBookingService.cancelBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
