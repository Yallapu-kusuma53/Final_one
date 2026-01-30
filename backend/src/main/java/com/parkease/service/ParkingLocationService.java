package com.parkease.service;

import com.parkease.dto.ParkingLocationRequest;
import com.parkease.dto.ParkingLocationResponse;
import com.parkease.model.ParkingLocation;
import com.parkease.repository.ParkingLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingLocationService {
    
    @Autowired
    private ParkingLocationRepository locationRepository;
    
    public List<ParkingLocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
            .map(ParkingLocationResponse::fromLocation)
            .collect(Collectors.toList());
    }
    
    public ParkingLocationResponse getLocationById(Long id) {
        ParkingLocation location = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));
        return ParkingLocationResponse.fromLocation(location);
    }
    
    public ParkingLocationResponse createLocation(ParkingLocationRequest request) {
        ParkingLocation location = new ParkingLocation();
        location.setName(request.getName());
        location.setAddress(request.getAddress());
        location.setTotalSlots(request.getTotalSlots());
        location.setAvailableSlots(request.getTotalSlots());
        location.setPricePerHour(request.getPricePerHour());
        location.setImage(request.getImage());
        
        location = locationRepository.save(location);
        return ParkingLocationResponse.fromLocation(location);
    }
    
    public ParkingLocationResponse updateLocation(Long id, ParkingLocationRequest request) {
        ParkingLocation location = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));
        
        location.setName(request.getName());
        location.setAddress(request.getAddress());
        location.setTotalSlots(request.getTotalSlots());
        location.setPricePerHour(request.getPricePerHour());
        if (request.getImage() != null) {
            location.setImage(request.getImage());
        }
        
        location = locationRepository.save(location);
        return ParkingLocationResponse.fromLocation(location);
    }
    
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Location not found");
        }
        locationRepository.deleteById(id);
    }
}
