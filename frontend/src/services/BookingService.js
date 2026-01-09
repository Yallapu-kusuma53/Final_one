// frontend/src/services/BookingService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const BookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create booking' };
    }
  },

  // Get all bookings
  getAllBookings: async (params = {}) => {
    try {
      const response = await api.get('/bookings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  // Get active bookings only
  getActiveBookings: async (params = {}) => {
    try {
      const response = await api.get('/bookings/active', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch active bookings' };
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Booking not found' };
    }
  },

  // Exit booking (calculate duration and payment)
  exitBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/exit`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to exit booking' };
    }
  },

  // Update payment status
  updatePaymentStatus: async (bookingId, paymentStatus) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/payment`, {
        paymentStatus,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update payment status' };
    }
  },

  // Get available slots
  getAvailableSlots: async () => {
    try {
      const response = await api.get('/slots/available');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch slots' };
    }
  },

  // Get booking statistics
  getBookingStats: async () => {
    try {
      const response = await api.get('/bookings/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  },

  // Get pricing information
  getPricingInfo: async () => {
    try {
      const response = await api.get('/pricing');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pricing' };
    }
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete booking' };
    }
  },
};

export default BookingService;