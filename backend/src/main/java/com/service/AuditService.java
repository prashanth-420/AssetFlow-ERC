package com.service;

import com.entity.*;
import com.enums.AssetStatus;
import com.enums.AuditStatus;
import com.enums.VerificationStatus;
import com.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditCycleRepository auditCycleRepository;
    private final AuditEntryRepository auditEntryRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public List<AuditCycle> getAllCycles() {
        return auditCycleRepository.findAll();
    }

    public List<AuditEntry> getEntriesByCycle(Long cycleId) {
        return auditEntryRepository.findByAuditId(cycleId);
    }

    @Transactional
    public AuditCycle createCycle(String name, Long departmentId, String location, LocalDate startDate, LocalDate endDate, Long creatorId) {
        Department department = null;
        if (departmentId != null && departmentId > 0) {
            department = departmentRepository.findById(departmentId).orElse(null);
        }

        Employee creator = null;
        if (creatorId != null) {
            creator = employeeRepository.findById(creatorId).orElse(null);
        }

        AuditCycle cycle = AuditCycle.builder()
                .auditName(name)
                .department(department)
                .location(location)
                .startDate(startDate)
                .endDate(endDate)
                .status(AuditStatus.IN_PROGRESS)
                .createdBy(creator)
                .build();
        cycle = auditCycleRepository.save(cycle);

        // Find assets matching the scope to pre-populate entries
        List<Asset> assets;
        if (department != null && location != null && !location.isEmpty()) {
            assets = assetRepository.searchAssets(null, null, null, department.getId(), location);
        } else if (department != null) {
            assets = assetRepository.searchAssets(null, null, null, department.getId(), null);
        } else if (location != null && !location.isEmpty()) {
            assets = assetRepository.searchAssets(null, null, null, null, location);
        } else {
            assets = assetRepository.findAll();
        }

        for (Asset asset : assets) {
            AuditEntry entry = AuditEntry.builder()
                    .audit(cycle)
                    .asset(asset)
                    .verificationStatus(VerificationStatus.MISSING)
                    .remarks("Pending verification")
                    .build();
            auditEntryRepository.save(entry);
        }

        return cycle;
    }

    @Transactional
    public AuditEntry verifyAsset(Long cycleId, Long assetId, String verificationStatusStr, String remarks, Long auditorId) {
        AuditCycle cycle = auditCycleRepository.findById(cycleId)
                .orElseThrow(() -> new IllegalArgumentException("Audit cycle not found."));

        if (cycle.getStatus() == AuditStatus.CLOSED) {
            throw new IllegalStateException("Audit cycle is closed and locked.");
        }

        Employee auditor = employeeRepository.findById(auditorId)
                .orElseThrow(() -> new IllegalArgumentException("Auditor employee not found."));

        VerificationStatus status = VerificationStatus.valueOf(verificationStatusStr.toUpperCase());

        AuditEntry entry = auditEntryRepository.findByAuditIdAndAssetId(cycleId, assetId)
                .orElseGet(() -> AuditEntry.builder()
                        .audit(cycle)
                        .asset(assetRepository.findById(assetId)
                                .orElseThrow(() -> new IllegalArgumentException("Asset not found.")))
                        .build());

        entry.setAuditor(auditor);
        entry.setVerificationStatus(status);
        entry.setRemarks(remarks);
        entry.setVerifiedAt(LocalDateTime.now());

        return auditEntryRepository.save(entry);
    }

    @Transactional
    public AuditCycle closeCycle(Long cycleId) {
        AuditCycle cycle = auditCycleRepository.findById(cycleId)
                .orElseThrow(() -> new IllegalArgumentException("Audit cycle not found."));

        if (cycle.getStatus() == AuditStatus.CLOSED) {
            return cycle;
        }

        cycle.setStatus(AuditStatus.CLOSED);
        cycle.setEndDate(LocalDate.now());
        auditCycleRepository.save(cycle);

        // Lock and update assets
        List<AuditEntry> entries = auditEntryRepository.findByAuditId(cycleId);
        for (AuditEntry entry : entries) {
            Asset asset = entry.getAsset();
            if (entry.getVerificationStatus() == VerificationStatus.MISSING) {
                asset.setStatus(AssetStatus.LOST);
                assetRepository.save(asset);
            } else if (entry.getVerificationStatus() == VerificationStatus.DAMAGED) {
                asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
                assetRepository.save(asset);
            }
        }

        return cycle;
    }
}
