package com.parkease.service;

import com.parkease.dto.BookingRequest;
import com.parkease.dto.BookingResponse;
import com.parkease.model.Booking;
import com.parkease.model.ParkingLocation;
import com.parkease.model.ParkingSlot;
import com.parkease.model.User;
import com.parkease.model.Vehicle;
import com.parkease.repository.BookingRepository;
import com.parkease.repository.ParkingLocationRepository;
import com.parkease.repository.ParkingSlotRepository;
import com.parkease.repository.UserRepository;
import com.parkease.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ParkingSlotRepository slotRepository;
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private ParkingLocationRepository locationRepository;
    
    public List<BookingResponse> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
            .map(BookingResponse::fromBooking)
            .collect(Collectors.toList());
    }
    
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
            .map(BookingResponse::fromBooking)
            .collect(Collectors.toList());
    }
    
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        return BookingResponse.fromBooking(booking);
    }
    
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        ParkingSlot slot = slotRepository.findById(request.getSlotId())
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        
        if (slot.getStatus() != ParkingSlot.SlotStatus.AVAILABLE) {
            throw new RuntimeException("Slot is not available");
        }
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        if (!vehicle.getUser().getId().equals(userId)) {
            throw new RuntimeException("Vehicle does not belong to user");
        }
        
        ParkingLocation location = locationRepository.findById(request.getLocationId())
            .orElseThrow(() -> new RuntimeException("Location not found"));
        
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSlot(slot);
        booking.setVehicle(vehicle);
        booking.setLocation(location);
        booking.setStartTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        
        booking = bookingRepository.save(booking);
        
        // Update slot status
        slot.setStatus(ParkingSlot.SlotStatus.BOOKED);
        slotRepository.save(slot);
        
        return BookingResponse.fromBooking(booking);
    }
    
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (request.getSlotId() != null && !booking.getSlot().getId().equals(request.getSlotId())) {
            ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));
            booking.setSlot(slot);
        }
        
        if (request.getVehicleId() != null && !booking.getVehicle().getId().equals(request.getVehicleId())) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            booking.setVehicle(vehicle);
        }
        
        booking = bookingRepository.save(booking);
        return BookingResponse.fromBooking(booking);
    }
    
    public BookingResponse completeBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active");
        }
        
        booking.setEndTime(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        
        // Calculate total amount
        Duration duration = Duration.between(booking.getStartTime(), booking.getEndTime());
        long hours = duration.toHours() + (duration.toMinutes() % 60 > 0 ? 1 : 0);
        double totalAmount = hours * booking.getLocation().getPricePerHour();
        booking.setTotalAmount(totalAmount);
        
        // Mark as paid
        booking.setPaid(true);
        
        booking = bookingRepository.save(booking);
        
        // Update slot status
        ParkingSlot slot = booking.getSlot();
        slot.setStatus(ParkingSlot.SlotStatus.AVAILABLE);
        slotRepository.save(slot);
        
        return BookingResponse.fromBooking(booking);
    }
    
    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        
        // Update slot status
        ParkingSlot slot = booking.getSlot();
        slot.setStatus(ParkingSlot.SlotStatus.AVAILABLE);
        slotRepository.save(slot);
        
        return BookingResponse.fromBooking(booking);
    }
    
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }
}
