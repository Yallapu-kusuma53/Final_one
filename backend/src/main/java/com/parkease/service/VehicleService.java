package com.parkease.service;

import com.parkease.dto.VehicleRequest;
import com.parkease.dto.VehicleResponse;
import com.parkease.model.User;
import com.parkease.model.Vehicle;
import com.parkease.repository.UserRepository;
import com.parkease.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<VehicleResponse> getVehiclesByUser(Long userId) {
        return vehicleRepository.findByUserId(userId).stream()
            .map(VehicleResponse::fromVehicle)
            .collect(Collectors.toList());
    }
    
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        return VehicleResponse.fromVehicle(vehicle);
    }
    
    public VehicleResponse createVehicle(Long userId, VehicleRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        
        vehicle = vehicleRepository.save(vehicle);
        return VehicleResponse.fromVehicle(vehicle);
    }
    
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        
        vehicle = vehicleRepository.save(vehicle);
        return VehicleResponse.fromVehicle(vehicle);
    }
    
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found");
        }
        vehicleRepository.deleteById(id);
    }
}
