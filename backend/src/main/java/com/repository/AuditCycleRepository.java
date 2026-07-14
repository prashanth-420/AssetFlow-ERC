package com.repository;

import com.entity.AuditCycle;
import com.enums.AuditStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditCycleRepository extends JpaRepository<AuditCycle, Long> {
    List<AuditCycle> findByStatus(AuditStatus status);
}
