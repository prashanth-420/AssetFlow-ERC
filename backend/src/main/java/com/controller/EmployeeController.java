package com.controller;

import com.entity.Employee;
import com.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PutMapping("/{id}/promote")
    public ResponseEntity<Employee> promoteEmployee(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(employeeService.promoteEmployee(id, role));
    }
}
