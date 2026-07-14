package com.controller;

import com.entity.Resource;
import com.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String type = (String) body.get("type");
        Number capacity = (Number) body.get("capacity");
        String location = (String) body.get("location");

        Resource r = resourceService.createResource(
                name,
                type,
                capacity != null ? capacity.intValue() : 0,
                location
        );
        return ResponseEntity.ok(r);
    }
}
