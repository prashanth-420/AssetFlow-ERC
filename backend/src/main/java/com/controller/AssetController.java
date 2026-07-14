package com.controller;

import com.entity.Asset;
import com.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<List<Asset>> getAssets(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(assetService.searchAssets(q, category, status, deptId, location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PostMapping
    public ResponseEntity<Asset> registerAsset(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        Number categoryId = (Number) body.get("categoryId");
        String serialNumber = (String) body.get("serialNumber");
        
        String purchaseDateStr = (String) body.get("purchaseDate");
        LocalDate purchaseDate = purchaseDateStr != null && !purchaseDateStr.isEmpty() ? LocalDate.parse(purchaseDateStr) : LocalDate.now();
        
        Object costObj = body.get("purchaseCost");
        BigDecimal cost = costObj != null && !costObj.toString().isEmpty() ? new BigDecimal(costObj.toString()) : BigDecimal.ZERO;
        
        String condition = (String) body.get("condition");
        String location = (String) body.get("location");
        Boolean isBookable = (Boolean) body.get("isBookable");
        Number creatorId = (Number) body.get("creatorId");

        Asset asset = assetService.registerAsset(
                name,
                categoryId != null ? categoryId.longValue() : null,
                serialNumber,
                purchaseDate,
                cost,
                condition,
                location,
                isBookable,
                creatorId != null ? creatorId.longValue() : null
        );
        return ResponseEntity.ok(asset);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<Map<String, Object>> getAssetHistory(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetHistory(id));
    }
}
