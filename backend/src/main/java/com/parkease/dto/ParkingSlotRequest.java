package com.parkease.dto;

import com.parkease.model.ParkingSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ParkingSlotRequest {
    @NotBlank(message = "Slot number is required")
    private String slotNumber;
    
    @NotNull(message = "Location ID is required")
    private Long locationId;
    
    private ParkingSlot.SlotStatus status = ParkingSlot.SlotStatus.AVAILABLE;
    
    @NotNull(message = "Floor is required")
    private Integer floor;
    
    @NotNull(message = "Type is required")
    private ParkingSlot.SlotType type = ParkingSlot.SlotType.REGULAR;
}
