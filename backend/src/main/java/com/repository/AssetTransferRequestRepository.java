package com.repository;

import com.entity.AssetTransferRequest;
import com.enums.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetTransferRequestRepository extends JpaRepository<AssetTransferRequest, Long> {
    List<AssetTransferRequest> findByAssetIdOrderByCreatedAtDesc(Long assetId);
    List<AssetTransferRequest> findByStatus(TransferStatus status);
    List<AssetTransferRequest> findByToEmployeeIdOrFromEmployeeId(Long toEmployeeId, Long fromEmployeeId);
}
