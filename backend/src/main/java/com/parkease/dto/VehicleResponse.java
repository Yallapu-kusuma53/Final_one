package com.parkease.dto;

import com.parkease.model.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private Long userId;
    private String licensePlate;
    private String make;
    private String model;
    private String color;
    
    public static VehicleResponse fromVehicle(Vehicle vehicle) {
        return new VehicleResponse(
            vehicle.getId(),
            vehicle.getUser().getId(),
            vehicle.getLicensePlate(),
            vehicle.getMake(),
            vehicle.getModel(),
            vehicle.getColor()
        );
    }
}
