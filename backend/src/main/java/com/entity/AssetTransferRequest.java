package com.entity;

import com.enums.TransferStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_transfer_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetTransferRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transfer_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_employee_id")
    private Employee fromEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_employee_id")
    private Employee toEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private Employee requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "requested_date")
    private LocalDateTime requestedDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
