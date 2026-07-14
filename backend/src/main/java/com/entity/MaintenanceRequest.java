package com.entity;

import com.enums.MaintenanceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_employee_id", nullable = false)
    private Employee raisedBy;

    @Column(name = "issue_description", columnDefinition = "TEXT", nullable = false)
    private String issueDescription;

    private String priority; // High, Medium, Low

    @Column(name = "photo_url")
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_employee_id")
    private Employee approvedBy;

    @Column(name = "technician_name")
    private String technicianName;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "resolved_date")
    private LocalDateTime resolvedDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
