package com.service;

import com.entity.Asset;
import com.entity.AssetAllocation;
import com.entity.AssetTransferRequest;
import com.entity.Employee;
import com.enums.AssetStatus;
import com.enums.TransferStatus;
import com.repository.AssetAllocationRepository;
import com.repository.AssetRepository;
import com.repository.AssetTransferRequestRepository;
import com.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetTransferService {

    private final AssetTransferRequestRepository transferRequestRepository;
    private final AssetAllocationRepository allocationRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;

    public List<AssetTransferRequest> getAllTransfers() {
        return transferRequestRepository.findAll();
    }

    @Transactional
    public AssetTransferRequest requestTransfer(Long assetId, Long toEmployeeId, Long requestedById, String remarks) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found."));

        Employee toEmployee = employeeRepository.findById(toEmployeeId)
                .orElseThrow(() -> new IllegalArgumentException("Target employee not found."));

        Employee requestedBy = employeeRepository.findById(requestedById)
                .orElseThrow(() -> new IllegalArgumentException("Requested by employee not found."));

        // Find current holder
        Optional<AssetAllocation> activeAllocationOpt = allocationRepository.findFirstByAssetIdAndStatusIgnoreCase(assetId, "active");
        Employee fromEmployee = null;
        if (activeAllocationOpt.isPresent()) {
            fromEmployee = activeAllocationOpt.get().getEmployee();
        }

        AssetTransferRequest request = AssetTransferRequest.builder()
                .asset(asset)
                .fromEmployee(fromEmployee)
                .toEmployee(toEmployee)
                .requestedBy(requestedBy)
                .status(TransferStatus.REQUESTED)
                .remarks(remarks)
                .requestedDate(LocalDateTime.now())
                .build();

        return transferRequestRepository.save(request);
    }

    @Transactional
    public AssetTransferRequest approveTransfer(Long transferId, Long approvedById) {
        AssetTransferRequest request = transferRequestRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer request not found."));

        if (request.getStatus() != TransferStatus.REQUESTED) {
            throw new IllegalStateException("Transfer request is already resolved.");
        }

        Employee approvedBy = employeeRepository.findById(approvedById)
                .orElseThrow(() -> new IllegalArgumentException("Approver employee not found."));

        Asset asset = request.getAsset();

        // 1. Terminate old active allocation
        Optional<AssetAllocation> activeAllocationOpt = allocationRepository.findFirstByAssetIdAndStatusIgnoreCase(asset.getId(), "active");
        if (activeAllocationOpt.isPresent()) {
            AssetAllocation oldAlloc = activeAllocationOpt.get();
            oldAlloc.setStatus("Returned");
            oldAlloc.setActualReturnDate(LocalDate.now());
            oldAlloc.setConditionNotes("Transferred to " + request.getToEmployee().getFirstName() + " " + request.getToEmployee().getLastName());
            allocationRepository.save(oldAlloc);
        }

        // 2. Create new allocation
        AssetAllocation newAlloc = AssetAllocation.builder()
                .asset(asset)
                .employee(request.getToEmployee())
                .allocatedBy(approvedBy)
                .allocatedDate(LocalDate.now())
                .status("Active")
                .build();
        allocationRepository.save(newAlloc);

        // 3. Update asset details
        asset.setStatus(AssetStatus.ALLOCATED);
        asset.setDepartment(request.getToEmployee().getDepartment());
        assetRepository.save(asset);

        // 4. Update request status
        request.setStatus(TransferStatus.APPROVED);
        request.setApprovedBy(approvedBy);
        request.setApprovedDate(LocalDateTime.now());

        return transferRequestRepository.save(request);
    }

    @Transactional
    public AssetTransferRequest rejectTransfer(Long transferId, Long rejectedById, String remarks) {
        AssetTransferRequest request = transferRequestRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer request not found."));

        if (request.getStatus() != TransferStatus.REQUESTED) {
            throw new IllegalStateException("Transfer request is already resolved.");
        }

        request.setStatus(TransferStatus.REJECTED);
        request.setRemarks(remarks != null ? remarks : "Rejected by management.");
        request.setApprovedDate(LocalDateTime.now());

        return transferRequestRepository.save(request);
    }
}
