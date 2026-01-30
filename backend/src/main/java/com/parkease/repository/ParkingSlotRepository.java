package com.parkease.repository;

import com.parkease.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByLocationId(Long locationId);
    List<ParkingSlot> findByLocationIdAndStatus(Long locationId, ParkingSlot.SlotStatus status);
}
