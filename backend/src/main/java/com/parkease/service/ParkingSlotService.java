package com.parkease.service;

import com.parkease.dto.ParkingSlotRequest;
import com.parkease.dto.ParkingSlotResponse;
import com.parkease.model.ParkingLocation;
import com.parkease.model.ParkingSlot;
import com.parkease.repository.ParkingLocationRepository;
import com.parkease.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingSlotService {
    
    @Autowired
    private ParkingSlotRepository slotRepository;
    
    @Autowired
    private ParkingLocationRepository locationRepository;
    
    public List<ParkingSlotResponse> getAllSlots() {
        return slotRepository.findAll().stream()
            .map(ParkingSlotResponse::fromSlot)
            .collect(Collectors.toList());
    }
    
    public List<ParkingSlotResponse> getSlotsByLocation(Long locationId) {
        return slotRepository.findByLocationId(locationId).stream()
            .map(ParkingSlotResponse::fromSlot)
            .collect(Collectors.toList());
    }
    
    public ParkingSlotResponse getSlotById(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        return ParkingSlotResponse.fromSlot(slot);
    }
    
    public ParkingSlotResponse createSlot(ParkingSlotRequest request) {
        ParkingLocation location = locationRepository.findById(request.getLocationId())
            .orElseThrow(() -> new RuntimeException("Location not found"));
        
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(request.getSlotNumber());
        slot.setLocation(location);
        slot.setStatus(request.getStatus());
        slot.setFloor(request.getFloor());
        slot.setType(request.getType());
        
        slot = slotRepository.save(slot);
        
        // Update available slots count
        updateAvailableSlotsCount(location.getId());
        
        return ParkingSlotResponse.fromSlot(slot);
    }
    
    public ParkingSlotResponse updateSlot(Long id, ParkingSlotRequest request) {
        ParkingSlot slot = slotRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        
        slot.setSlotNumber(request.getSlotNumber());
        slot.setStatus(request.getStatus());
        slot.setFloor(request.getFloor());
        slot.setType(request.getType());
        
        if (!slot.getLocation().getId().equals(request.getLocationId())) {
            ParkingLocation location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));
            slot.setLocation(location);
        }
        
        slot = slotRepository.save(slot);
        
        // Update available slots count
        updateAvailableSlotsCount(slot.getLocation().getId());
        
        return ParkingSlotResponse.fromSlot(slot);
    }
    
    public void deleteSlot(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        
        Long locationId = slot.getLocation().getId();
        slotRepository.deleteById(id);
        
        // Update available slots count
        updateAvailableSlotsCount(locationId);
    }
    
    private void updateAvailableSlotsCount(Long locationId) {
        ParkingLocation location = locationRepository.findById(locationId)
            .orElseThrow(() -> new RuntimeException("Location not found"));
        
        long availableCount = slotRepository.findByLocationIdAndStatus(
            locationId, ParkingSlot.SlotStatus.AVAILABLE).size();
        
        location.setAvailableSlots((int) availableCount);
        locationRepository.save(location);
    }
}
