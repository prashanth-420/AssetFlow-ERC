package com.repository;

import com.entity.MaintenanceRequest;
import com.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByAssetIdOrderByCreatedAtDesc(Long assetId);
    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);
    List<MaintenanceRequest> findByRaisedById(Long employeeId);

    @Query("SELECT COUNT(m) FROM MaintenanceRequest m WHERE m.status != 'RESOLVED' AND m.status != 'REJECTED'")
    long countActiveRequests();
}
