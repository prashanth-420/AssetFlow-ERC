package com.repository;

import com.entity.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {
    List<AssetAllocation> findByAssetIdOrderByCreatedAtDesc(Long assetId);
    List<AssetAllocation> findByEmployeeIdAndStatusIgnoreCase(Long employeeId, String status);
    List<AssetAllocation> findByDepartmentIdAndStatusIgnoreCase(Long departmentId, String status);
    
    Optional<AssetAllocation> findFirstByAssetIdAndStatusIgnoreCase(Long assetId, String status);

    @Query("SELECT a FROM AssetAllocation a WHERE LOWER(a.status) = 'active' AND a.expectedReturnDate IS NOT NULL AND a.expectedReturnDate < :today")
    List<AssetAllocation> findOverdueAllocations(@Param("today") LocalDate today);

    @Query("SELECT COUNT(a) FROM AssetAllocation a WHERE LOWER(a.status) = 'active'")
    long countActiveAllocations();
}
