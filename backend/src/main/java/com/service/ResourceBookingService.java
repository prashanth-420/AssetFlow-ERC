package com.service;

import com.entity.Employee;
import com.entity.Resource;
import com.entity.ResourceBooking;
import com.enums.BookingStatus;
import com.repository.EmployeeRepository;
import com.repository.ResourceBookingRepository;
import com.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceBookingService {

    private final ResourceBookingRepository resourceBookingRepository;
    private final ResourceRepository resourceRepository;
    private final EmployeeRepository employeeRepository;

    public List<ResourceBooking> getBookingsByResource(Long resourceId) {
        return resourceBookingRepository.findByResourceIdAndStatusNot(resourceId, BookingStatus.CANCELLED);
    }

    public List<ResourceBooking> getAllBookings() {
        return resourceBookingRepository.findAll();
    }

    @Transactional
    public ResourceBooking bookResource(Long resourceId, Long employeeId, String purpose, LocalDateTime start, LocalDateTime end) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found."));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found."));

        // Overlap check
        List<ResourceBooking> overlaps = resourceBookingRepository.findOverlappingBookings(resourceId, start, end, BookingStatus.CANCELLED);
        if (!overlaps.isEmpty()) {
            ResourceBooking clash = overlaps.get(0);
            throw new IllegalStateException("Time slot conflicts with an existing booking: '" + clash.getPurpose() + "' held by " + 
                    clash.getEmployee().getFirstName() + " " + clash.getEmployee().getLastName() + 
                    " (" + clash.getStartDatetime().toLocalTime() + " to " + clash.getEndDatetime().toLocalTime() + ")");
        }

        ResourceBooking booking = ResourceBooking.builder()
                .resource(resource)
                .employee(employee)
                .department(employee.getDepartment())
                .purpose(purpose)
                .startDatetime(start)
                .endDatetime(end)
                .status(BookingStatus.UPCOMING)
                .build();

        return resourceBookingRepository.save(booking);
    }

    @Transactional
    public ResourceBooking cancelBooking(Long bookingId) {
        ResourceBooking booking = resourceBookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        booking.setStatus(BookingStatus.CANCELLED);
        return resourceBookingRepository.save(booking);
    }
}
