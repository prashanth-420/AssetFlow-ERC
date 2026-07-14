package com.service;

import com.entity.Asset;
import com.entity.Employee;
import com.entity.MaintenanceRequest;
import com.enums.AssetStatus;
import com.enums.MaintenanceStatus;
import com.repository.AssetRepository;
import com.repository.EmployeeRepository;
import com.repository.MaintenanceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;

    public List<MaintenanceRequest> getAllRequests() {
        return maintenanceRequestRepository.findAll();
    }

    @Transactional
    public MaintenanceRequest raiseRequest(Long assetId, Long raisedById, String issue, String priority, String photoUrl) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found."));

        Employee raisedBy = employeeRepository.findById(raisedById)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found."));

        MaintenanceRequest request = MaintenanceRequest.builder()
                .asset(asset)
                .raisedBy(raisedBy)
                .issueDescription(issue)
                .priority(priority != null ? priority : "Medium")
                .photoUrl(photoUrl)
                .status(MaintenanceStatus.PENDING)
                .build();

        return maintenanceRequestRepository.save(request);
    }

    @Transactional
    public MaintenanceRequest updateStatus(Long requestId, String statusStr, Long actorEmployeeId, String technicianName, String remarks) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));

        MaintenanceStatus newStatus = MaintenanceStatus.valueOf(statusStr.toUpperCase().replace(" ", "_"));
        Employee actor = null;
        if (actorEmployeeId != null) {
            actor = employeeRepository.findById(actorEmployeeId).orElse(null);
        }

        request.setStatus(newStatus);
        if (remarks != null) {
            request.setRemarks(remarks);
        }

        Asset asset = request.getAsset();

        switch (newStatus) {
            case APPROVED:
                request.setApprovedBy(actor);
                request.setApprovalDate(LocalDateTime.now());
                asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
                break;
            case REJECTED:
                request.setApprovedBy(actor);
                request.setApprovalDate(LocalDateTime.now());
                break;
            case TECHNICIAN_ASSIGNED:
                if (technicianName != null) {
                    request.setTechnicianName(technicianName);
                }
                asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
                break;
            case IN_PROGRESS:
                asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
                break;
            case RESOLVED:
                request.setResolvedDate(LocalDateTime.now());
                asset.setStatus(AssetStatus.AVAILABLE);
                break;
            default:
                break;
        }

        assetRepository.save(asset);
        return maintenanceRequestRepository.save(request);
    }
}
