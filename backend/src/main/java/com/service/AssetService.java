package com.service;

import com.entity.Asset;
import com.entity.AssetAllocation;
import com.entity.AssetCategory;
import com.entity.Employee;
import com.entity.MaintenanceRequest;
import com.enums.AssetStatus;
import com.repository.AssetAllocationRepository;
import com.repository.AssetCategoryRepository;
import com.repository.AssetRepository;
import com.repository.EmployeeRepository;
import com.repository.MaintenanceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository assetCategoryRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetAllocationRepository assetAllocationRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public List<Asset> searchAssets(String q, String category, String status, Long deptId, String location) {
        AssetStatus assetStatus = null;
        if (status != null && !status.isEmpty() && !"Any Status".equalsIgnoreCase(status)) {
            try {
                assetStatus = AssetStatus.valueOf(status.toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                // Ignore
            }
        }
        return assetRepository.searchAssets(q, category, assetStatus, deptId, location);
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found."));
    }

    @Transactional
    public Asset registerAsset(String name, Long categoryId, String serialNumber, LocalDate purchaseDate,
                               BigDecimal purchaseCost, String condition, String location, Boolean isBookable,
                               Long employeeId) {
        
        AssetCategory category = assetCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found."));

        Employee creator = null;
        if (employeeId != null) {
            creator = employeeRepository.findById(employeeId).orElse(null);
        }

        // Generate Tag
        long count = assetRepository.count();
        String assetTag = "AF-" + String.format("%04d", count + 1);
        while (assetRepository.existsByAssetTagIgnoreCase(assetTag)) {
            count++;
            assetTag = "AF-" + String.format("%04d", count + 1);
        }

        Asset asset = Asset.builder()
                .assetTag(assetTag)
                .assetName(name)
                .category(category)
                .serialNumber(serialNumber)
                .purchaseDate(purchaseDate)
                .purchaseCost(purchaseCost)
                .condition(condition != null ? condition : "New")
                .status(AssetStatus.AVAILABLE)
                .location(location)
                .isBookable(isBookable != null ? isBookable : false)
                .createdBy(creator)
                .build();

        return assetRepository.save(asset);
    }

    public Map<String, Object> getAssetHistory(Long assetId) {
        Asset asset = getAssetById(assetId);
        List<AssetAllocation> allocations = assetAllocationRepository.findByAssetIdOrderByCreatedAtDesc(assetId);
        List<MaintenanceRequest> maintenance = maintenanceRequestRepository.findByAssetIdOrderByCreatedAtDesc(assetId);

        Map<String, Object> history = new HashMap<>();
        history.put("asset", asset);
        history.put("allocations", allocations);
        history.put("maintenance", maintenance);
        return history;
    }
}
