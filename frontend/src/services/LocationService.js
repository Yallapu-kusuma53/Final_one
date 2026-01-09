// frontend/src/services/LocationService.js
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

const LocationService = {
  // Get all locations
  getAllLocations: async () => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch locations' };
    }
  },

  // Get location by ID
  getLocationById: async (locationId) => {
    try {
      const response = await api.get(`/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch location' };
    }
  },

  // Get available slots for a location
  getLocationSlots: async (locationId) => {
    try {
      const response = await api.get(`/locations/${locationId}/slots`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch slots' };
    }
  },

  // Create new location (Admin)
  createLocation: async (locationData) => {
    try {
      const response = await api.post('/locations', locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create location' };
    }
  }
};

export default LocationService;