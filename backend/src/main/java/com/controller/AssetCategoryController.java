package com.controller;

import com.entity.AssetCategory;
import com.service.AssetCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AssetCategoryController {

    private final AssetCategoryService assetCategoryService;

    @GetMapping
    public ResponseEntity<List<AssetCategory>> getAllCategories() {
        return ResponseEntity.ok(assetCategoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<AssetCategory> createCategory(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String description = (String) body.get("description");
        return ResponseEntity.ok(assetCategoryService.createCategory(name, description));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetCategory> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String description = (String) body.get("description");
        return ResponseEntity.ok(assetCategoryService.updateCategory(id, name, description));
    }
}
