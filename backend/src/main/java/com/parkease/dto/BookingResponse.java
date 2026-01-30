package com.parkease.dto;

import com.parkease.model.Booking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private Long slotId;
    private Long vehicleId;
    private Long locationId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Booking.BookingStatus status;
    private Double totalAmount;
    private Boolean isPaid;
    
    public static BookingResponse fromBooking(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getUser().getId(),
            booking.getSlot().getId(),
            booking.getVehicle().getId(),
            booking.getLocation().getId(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getStatus(),
            booking.getTotalAmount(),
            booking.getIsPaid()
        );
    }
}
