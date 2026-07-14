package com.entity;

import com.enums.AssetStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long id;

    @Column(name = "asset_tag", nullable = false, unique = true)
    private String assetTag;

    @Column(name = "asset_name", nullable = false)
    private String assetName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private AssetCategory category;

    @Column(name = "serial_number", unique = true)
    private String serialNumber;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost")
    private BigDecimal purchaseCost;

    @Column(name = "asset_condition")
    private String condition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status;

    private String location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    private String vendor;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "is_bookable", nullable = false)
    private Boolean isBookable = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Employee createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
