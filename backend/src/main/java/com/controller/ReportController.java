package com.controller;

import com.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalyticsReports() {
        return ResponseEntity.ok(reportService.getAnalyticsReports());
    }
}
