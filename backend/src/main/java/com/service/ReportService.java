package com.service;

import com.enums.AssetStatus;
import com.enums.TransferStatus;
import com.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AssetRepository assetRepository;
    private final AssetAllocationRepository assetAllocationRepository;
    private final ResourceBookingRepository resourceBookingRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final AssetTransferRequestRepository assetTransferRequestRepository;
    private final DepartmentRepository departmentRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long available = assetRepository.countByStatus(AssetStatus.AVAILABLE);
        long allocated = assetRepository.countByStatus(AssetStatus.ALLOCATED);
        long maintenance = maintenanceRequestRepository.countActiveRequests();
        long activeBookings = resourceBookingRepository.countActiveBookings();
        long pendingTransfers = assetTransferRequestRepository.findByStatus(TransferStatus.REQUESTED).size();
        
        long overdueReturns = assetAllocationRepository.findOverdueAllocations(LocalDate.now()).size();

        stats.put("availableAssets", available);
        stats.put("allocatedAssets", allocated);
        stats.put("maintenanceToday", maintenance);
        stats.put("activeBookings", activeBookings);
        stats.put("pendingTransfers", pendingTransfers);
        stats.put("overdueReturns", overdueReturns);
        stats.put("totalAssets", assetRepository.count());

        return stats;
    }

    public Map<String, Object> getAnalyticsReports() {
        Map<String, Object> reports = new HashMap<>();

        // Department allocation summary
        List<Object[]> deptAllocations = departmentRepository.findAll().stream()
                .map(d -> {
                    long activeAllocations = assetAllocationRepository.findByDepartmentIdAndStatusIgnoreCase(d.getId(), "active").size();
                    return new Object[]{d.getDepartmentName(), activeAllocations};
                })
                .collect(Collectors.toList());
        reports.put("departmentAllocations", deptAllocations);

        // Maintenance frequency by asset
        List<Object[]> maintenanceFreq = assetRepository.findAll().stream()
                .map(a -> {
                    long maintenanceCount = maintenanceRequestRepository.findByAssetIdOrderByCreatedAtDesc(a.getId()).size();
                    return new Object[]{a.getAssetTag() + " - " + a.getAssetName(), maintenanceCount};
                })
                .filter(o -> (Long) o[1] > 0)
                .collect(Collectors.toList());
        reports.put("maintenanceFrequency", maintenanceFreq);

        // Asset utilization
        List<Object[]> utilization = assetRepository.findAll().stream()
                .map(a -> {
                    long allocCount = assetAllocationRepository.findByAssetIdOrderByCreatedAtDesc(a.getId()).size();
                    return new Object[]{a.getAssetTag() + " - " + a.getAssetName(), allocCount};
                })
                .collect(Collectors.toList());
        reports.put("assetUtilization", utilization);

        return reports;
    }
}
