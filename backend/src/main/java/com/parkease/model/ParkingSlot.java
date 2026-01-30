package com.parkease.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parking_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "slot_number", nullable = false)
    private String slotNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private ParkingLocation location;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status = SlotStatus.AVAILABLE;
    
    @Column(nullable = false)
    private Integer floor;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotType type = SlotType.REGULAR;
    
    public enum SlotStatus {
        AVAILABLE, BOOKED, MAINTENANCE
    }
    
    public enum SlotType {
        REGULAR, HANDICAP, EV
    }
}
