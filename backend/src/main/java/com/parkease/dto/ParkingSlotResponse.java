package com.parkease.dto;

import com.parkease.model.ParkingSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSlotResponse {
    private Long id;
    private String slotNumber;
    private Long locationId;
    private ParkingSlot.SlotStatus status;
    private Integer floor;
    private ParkingSlot.SlotType type;
    
    public static ParkingSlotResponse fromSlot(ParkingSlot slot) {
        return new ParkingSlotResponse(
            slot.getId(),
            slot.getSlotNumber(),
            slot.getLocation().getId(),
            slot.getStatus(),
            slot.getFloor(),
            slot.getType()
        );
    }
}
