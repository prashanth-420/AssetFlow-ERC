package com.repository;

import com.entity.AuditEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuditEntryRepository extends JpaRepository<AuditEntry, Long> {
    List<AuditEntry> findByAuditId(Long auditId);
    Optional<AuditEntry> findByAuditIdAndAssetId(Long auditId, Long assetId);
}
