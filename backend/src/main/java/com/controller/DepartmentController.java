package com.controller;

import com.entity.Department;
import com.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        Number headId = (Number) body.get("headId");
        Number parentId = (Number) body.get("parentId");
        Boolean status = (Boolean) body.get("status");

        Department dept = departmentService.createDepartment(
                name,
                headId != null ? headId.longValue() : null,
                parentId != null ? parentId.longValue() : null,
                status
        );
        return ResponseEntity.ok(dept);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        Number headId = (Number) body.get("headId");
        Number parentId = (Number) body.get("parentId");
        Boolean status = (Boolean) body.get("status");

        Department dept = departmentService.updateDepartment(
                id,
                name,
                headId != null ? headId.longValue() : null,
                parentId != null ? parentId.longValue() : null,
                status
        );
        return ResponseEntity.ok(dept);
    }
}
