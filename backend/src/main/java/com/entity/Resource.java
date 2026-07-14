package com.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long id;

    @Column(name = "resource_name", nullable = false)
    private String resourceName;

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // e.g., Meeting Room, Vehicle, Conference Hall

    private Integer capacity;

    private String location;

    @Column(nullable = false)
    private String status; // Can be simple string (Available, Booked) or Enum

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
