package com.parkease.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    @NotNull(message = "Slot ID is required")
    private Long slotId;
    
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    @NotNull(message = "Location ID is required")
    private Long locationId;
    
    private LocalDateTime startTime;
}
