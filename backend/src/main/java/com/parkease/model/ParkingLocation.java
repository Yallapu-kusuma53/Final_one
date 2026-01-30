package com.parkease.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parking_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String address;
    
    @Column(name = "total_slots", nullable = false)
    private Integer totalSlots;
    
    @Column(name = "available_slots", nullable = false)
    private Integer availableSlots;
    
    @Column(name = "price_per_hour", nullable = false)
    private Double pricePerHour;
    
    @Column(name = "image")
    private String image;
    
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParkingSlot> slots = new ArrayList<>();
    
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();
}
