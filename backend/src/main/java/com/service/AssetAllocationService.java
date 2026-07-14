package com.service;

import com.entity.Asset;
import com.entity.AssetAllocation;
import com.entity.Department;
import com.entity.Employee;
import com.enums.AssetStatus;
import com.repository.AssetAllocationRepository;
import com.repository.AssetRepository;
import com.repository.DepartmentRepository;
import com.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetAllocationService {

    private final AssetAllocationRepository assetAllocationRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public List<AssetAllocation> getActiveAllocations() {
        return assetAllocationRepository.findAll();
    }

    @Transactional
    public AssetAllocation allocateAsset(Long assetId, Long employeeId, Long departmentId, Long allocatedById, LocalDate expectedReturnDate) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found."));

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            // Find who holds it
            Optional<AssetAllocation> activeAllocationOpt = assetAllocationRepository.findFirstByAssetIdAndStatusIgnoreCase(assetId, "active");
            String holder = "someone";
            if (activeAllocationOpt.isPresent()) {
                AssetAllocation active = activeAllocationOpt.get();
                if (active.getEmployee() != null) {
                    holder = active.getEmployee().getFirstName() + " " + active.getEmployee().getLastName();
                } else if (active.getDepartment() != null) {
                    holder = "Department: " + active.getDepartment().getDepartmentName();
                }
            }
            throw new IllegalStateException("Asset is already allocated. Currently held by " + holder + ".");
        }

        Employee employee = null;
        if (employeeId != null && employeeId > 0) {
            employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found."));
        }

        Department department = null;
        if (departmentId != null && departmentId > 0) {
            department = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Department not found."));
        }

        if (employee == null && department == null) {
            throw new IllegalArgumentException("Either Employee or Department must be specified for allocation.");
        }

        Employee allocatedBy = null;
        if (allocatedById != null) {
            allocatedBy = employeeRepository.findById(allocatedById).orElse(null);
        }

        AssetAllocation allocation = AssetAllocation.builder()
                .asset(asset)
                .employee(employee)
                .department(department)
                .allocatedBy(allocatedBy)
                .allocatedDate(LocalDate.now())
                .expectedReturnDate(expectedReturnDate)
                .status("Active")
                .build();

        asset.setStatus(AssetStatus.ALLOCATED);
        if (department != null) {
            asset.setDepartment(department);
        } else if (employee != null) {
            asset.setDepartment(employee.getDepartment());
        }
        assetRepository.save(asset);

        return assetAllocationRepository.save(allocation);
    }

    @Transactional
    public AssetAllocation returnAsset(Long assetId, String checkInNotes) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found."));

        AssetAllocation allocation = assetAllocationRepository.findFirstByAssetIdAndStatusIgnoreCase(assetId, "active")
                .orElseThrow(() -> new IllegalArgumentException("No active allocation found for this asset."));

        allocation.setStatus("Returned");
        allocation.setActualReturnDate(LocalDate.now());
        allocation.setConditionNotes(checkInNotes);
        assetAllocationRepository.save(allocation);

        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        return allocation;
    }
}
