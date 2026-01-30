package com.parkease.repository;

import com.parkease.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
