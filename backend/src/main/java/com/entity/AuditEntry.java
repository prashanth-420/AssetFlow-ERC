package com.entity;

import com.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "entry_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    private AuditCycle audit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id")
    private Employee auditor;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
