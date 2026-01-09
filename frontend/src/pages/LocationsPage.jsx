// frontend/src/pages/LocationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationService from '../services/LocationService';

const LocationsPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await LocationService.getAllLocations();
      setLocations(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError(error.message || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationId) => {
    navigate(`/booking/${locationId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">🚗 Smart Parking</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/booking-history')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                History
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Parking Location</h2>
          <p className="text-gray-600">Choose a location to view available slots and book your parking</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-6xl mb-4 block">📍</span>
            <p>No locations available at the moment.</p>
          </div>
        ) : (
          /* Locations Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div
                key={location.locationId}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => handleLocationSelect(location.locationId)}
              >
                {/* Location Image */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-7xl">🏢</span>
                </div>

                {/* Location Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{location.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-2">📍</span>
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-2">🏙️</span>
                      <span>{location.city}</span>
                    </div>
                    {location.contactNumber && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="mr-2">📞</span>
                        <span>{location.contactNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Availability Info */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Available Slots</p>
                      <p className={`text-2xl font-bold ${
                        location.availableSlots > 5 ? 'text-green-600' : 
                        location.availableSlots > 0 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {location.availableSlots}/{location.totalSlots}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${
                      location.availableSlots > 5 ? 'bg-green-100 text-green-800' :
                      location.availableSlots > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {location.availableSlots > 5 ? 'Available' :
                       location.availableSlots > 0 ? 'Limited' :
                       'Full'}
                    </div>
                  </div>

                  {/* Facilities */}
                  {location.facilities && location.facilities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Facilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {location.facilities.slice(0, 3).map((facility, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {location.operatingHours && (
                    <div className="text-xs text-gray-600 mb-4">
                      <span className="mr-1">🕐</span>
                      {location.operatingHours.open} - {location.operatingHours.close}
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationSelect(location.locationId);
                    }}
                    disabled={location.availableSlots === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {location.availableSlots > 0 ? 'Book Parking' : 'No Slots Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPage;