package com.parkease.dto;

import com.parkease.model.ParkingLocation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingLocationResponse {
    private Long id;
    private String name;
    private String address;
    private Integer totalSlots;
    private Integer availableSlots;
    private Double pricePerHour;
    private String image;
    
    public static ParkingLocationResponse fromLocation(ParkingLocation location) {
        return new ParkingLocationResponse(
            location.getId(),
            location.getName(),
            location.getAddress(),
            location.getTotalSlots(),
            location.getAvailableSlots(),
            location.getPricePerHour(),
            location.getImage()
        );
    }
}
