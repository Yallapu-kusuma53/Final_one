package com.parkease.controller;

import com.parkease.dto.ParkingSlotRequest;
import com.parkease.dto.ParkingSlotResponse;
import com.parkease.service.ParkingSlotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "http://localhost:8080")
public class ParkingSlotController {
    
    @Autowired
    private ParkingSlotService slotService;
    
    @GetMapping
    public ResponseEntity<List<ParkingSlotResponse>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }
    
    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<ParkingSlotResponse>> getSlotsByLocation(@PathVariable Long locationId) {
        return ResponseEntity.ok(slotService.getSlotsByLocation(locationId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSlotById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(slotService.getSlotById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createSlot(@Valid @RequestBody ParkingSlotRequest request) {
        try {
            ParkingSlotResponse response = slotService.createSlot(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id, 
                                       @Valid @RequestBody ParkingSlotRequest request) {
        try {
            ParkingSlotResponse response = slotService.updateSlot(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        try {
            slotService.deleteSlot(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    private static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
}
