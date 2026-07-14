package com.repository;

import com.entity.Asset;
import com.enums.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByAssetTagIgnoreCase(String assetTag);
    Optional<Asset> findBySerialNumberIgnoreCase(String serialNumber);
    boolean existsByAssetTagIgnoreCase(String assetTag);
    boolean existsBySerialNumberIgnoreCase(String serialNumber);

    @Query("SELECT a FROM Asset a WHERE " +
           "(:q IS NULL OR :q = '' OR LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(a.assetName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(a.location) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:category IS NULL OR :category = '' OR LOWER(a.category.categoryName) = LOWER(:category)) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:deptId IS NULL OR a.department.id = :deptId) " +
           "AND (:location IS NULL OR :location = '' OR LOWER(a.location) = LOWER(:location))")
    List<Asset> searchAssets(@Param("q") String q,
                             @Param("category") String category,
                             @Param("status") AssetStatus status,
                             @Param("deptId") Long deptId,
                             @Param("location") String location);

    long countByStatus(AssetStatus status);
}
