package com.repository;

import com.entity.ResourceBooking;
import com.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ResourceBookingRepository extends JpaRepository<ResourceBooking, Long> {
    List<ResourceBooking> findByResourceIdAndStatusNot(Long resourceId, BookingStatus status);
    List<ResourceBooking> findByEmployeeId(Long employeeId);

    @Query("SELECT b FROM ResourceBooking b WHERE b.resource.id = :resourceId " +
           "AND b.status != :status " +
           "AND b.startDatetime < :end " +
           "AND b.endDatetime > :start")
    List<ResourceBooking> findOverlappingBookings(@Param("resourceId") Long resourceId,
                                                  @Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end,
                                                  @Param("status") BookingStatus status);

    @Query("SELECT COUNT(b) FROM ResourceBooking b WHERE b.status = 'ONGOING' OR b.status = 'UPCOMING'")
    long countActiveBookings();
}
