// frontend/src/pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingService from '../services/BookingService';
import LocationService from '../services/LocationService';

const BookingPage = () => {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const [location, setLocation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentBooking, setCurrentBooking] = useState({
    vehicleNumber: '',
    vehicleType: '',
    slotId: ''
  });

  const vehicleTypes = [
    { value: 'bike', label: '🏍️ Bike', rate: '₹10/hr' },
    { value: 'car', label: '🚗 Car', rate: '₹20/hr' },
    { value: 'suv', label: '🚙 SUV', rate: '₹30/hr' },
    { value: 'truck', label: '🚚 Truck', rate: '₹40/hr' }
  ];

  const fetchLocationAndSlots = async () => {
    try {
      console.log('Fetching location and slots for:', locationId);
      
      const locationRes = await LocationService.getLocationById(locationId);
      console.log('Location response:', locationRes);
      setLocation(locationRes.data);
      
      const slotsRes = await LocationService.getLocationSlots(locationId);
      console.log('Slots response:', slotsRes);
      
      if (slotsRes.slots && Array.isArray(slotsRes.slots)) {
        // Slots come with isAvailable flag from backend
        // isAvailable = false means either maintenance or occupied
        setAllSlots(slotsRes.slots);
      } else {
        console.error('Invalid slots data:', slotsRes);
        setError('Failed to load slot information');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setError('Failed to load location details: ' + error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getAllBookings({ locationId });
      const activeBookings = response.data.filter(b => b.status === 'active');
      setBookings(activeBookings);
      setError('');
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (e) => {
    e.preventDefault();
    
    if (!currentBooking.vehicleNumber || !currentBooking.vehicleType || !currentBooking.slotId) {
      setError('Please fill in all fields and select a slot');
      return;
    }

    const selectedSlot = allSlots.find(s => s.slotId === currentBooking.slotId);
    if (!selectedSlot || !selectedSlot.isAvailable) {
      setError('Selected slot is not available');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await BookingService.createBooking({
        locationId: locationId,
        slotId: currentBooking.slotId,
        vehicleNumber: currentBooking.vehicleNumber,
        vehicleType: currentBooking.vehicleType
      });
      
      setSuccessMessage('Booking created successfully!');
      setCurrentBooking({ vehicleNumber: '', vehicleType: '', slotId: '' });
      fetchBookings();
      fetchLocationAndSlots();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const exitBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to exit this vehicle?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await BookingService.exitBooking(bookingId);
      
      const { duration, payment } = response;
      alert(
        `Vehicle Exited!\n\n` +
        `Location: ${location?.name}\n` +
        `Vehicle Type: ${payment.vehicleType.toUpperCase()}\n` +
        `Duration: ${duration.formatted}\n` +
        `Amount: ${payment.formatted}\n` +
        `Status: ${payment.paymentStatus}`
      );
      
      fetchBookings();
      fetchLocationAndSlots();
    } catch (error) {
      console.error('Error exiting booking:', error);
      setError(error.message || 'Failed to exit booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    console.log('Slot clicked:', slot);
    
    // Check if slot is available
    if (!slot.isAvailable) {
      return; // Do nothing if slot is not available
    }
    
    // Check if slot is occupied by checking active bookings
    const isOccupied = bookings.some(b => b.slotId === slot.slotId);
    if (isOccupied) {
      return; // Do nothing if slot is occupied
    }
    
    // Slot is available and not occupied, so select it
    setCurrentBooking({
      ...currentBooking,
      slotId: slot.slotId
    });
    console.log('Selected slot:', slot.slotId);
  };

  const getSlotStatus = (slot) => {
    // Check if slot is occupied by an active booking
    const isOccupied = bookings.some(b => b.slotId === slot.slotId);
    if (isOccupied) {
      return 'occupied';
    }
    
    // Check if slot is under maintenance (isAvailable = false)
    if (!slot.isAvailable) {
      return 'maintenance';
    }
    
    return 'available';
  };

  const getSlotColor = (slot) => {
    const status = getSlotStatus(slot);
    
    if (slot.slotId === currentBooking.slotId) {
      return 'bg-blue-500 text-white border-blue-600 shadow-lg transform scale-105';
    }
    
    if (status === 'occupied') {
      return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed opacity-60';
    }
    
    if (status === 'maintenance') {
      return 'bg-orange-100 text-orange-800 border-orange-300 cursor-not-allowed opacity-60';
    }
    
    return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer hover:shadow-md transition-all';
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getVehicleEmoji = (type) => {
    const emojis = {
      bike: '🏍️',
      car: '🚗',
      suv: '🚙',
      truck: '🚚'
    };
    return emojis[type] || '🚗';
  };

  const [tick, setTick] = useState(0);

  const calculateLiveDuration = (entryTime) => {
    const duration = Date.now() - new Date(entryTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  useEffect(() => {
    if (!locationId) {
      navigate('/locations');
      return;
    }

    fetchLocationAndSlots();
    fetchBookings();
    
    const interval = setInterval(() => {
      fetchBookings();
      fetchLocationAndSlots();
    }, 10000); // Refresh every 10 seconds

    const timerInterval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [locationId]);

  if (!locationId) {
    return null;
  }

  const availableSlots = allSlots.filter(s => getSlotStatus(s) === 'available');
  const occupiedSlots = allSlots.filter(s => getSlotStatus(s) === 'occupied');
  const maintenanceSlots = allSlots.filter(s => getSlotStatus(s) === 'maintenance');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/locations')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Locations
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                🚗 {location?.name || 'Smart Parking'}
              </h1>
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
        {/* Location Info Banner */}
        {location && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{location.name}</h2>
                <p className="text-gray-600 text-sm">📍 {location.address}, {location.city}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Available Slots</p>
                <p className={`text-2xl font-bold ${
                  availableSlots.length > 5 ? 'text-green-600' : 
                  availableSlots.length > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {availableSlots.length}/{location.totalSlots}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 font-bold text-xl"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Entry Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">🚗</span>
              Create New Booking
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={currentBooking.vehicleNumber}
                  onChange={(e) => setCurrentBooking({
                    ...currentBooking, 
                    vehicleNumber: e.target.value.toUpperCase()
                  })}
                  placeholder="e.g., TS09AB1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={currentBooking.vehicleType}
                  onChange={(e) => setCurrentBooking({
                    ...currentBooking, 
                    vehicleType: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Choose vehicle type</option>
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.rate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Slot - Click on available slot below
                </label>
                {currentBooking.slotId && (
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                    ✅ Selected: Slot {currentBooking.slotId.split('-').pop()}
                  </div>
                )}
              </div>

              {/* Slot Grid with Tooltips */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3 text-gray-700 flex items-center justify-between">
                  <span>Select a Slot:</span>
                  <button
                    type="button"
                    onClick={() => {
                      fetchLocationAndSlots();
                      fetchBookings();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    🔄 Refresh
                  </button>
                </h3>
                
                {allSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                    <p>Loading slots...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {allSlots.map(slot => {
                        const status = getSlotStatus(slot);
                        const isSelected = slot.slotId === currentBooking.slotId;
                        const booking = bookings.find(b => b.slotId === slot.slotId);
                        
                        return (
                          <button
                            key={slot.slotId}
                            type="button"
                            onClick={() => handleSlotClick(slot)}
                            disabled={status !== 'available' || loading}
                            className={`relative p-4 rounded-lg border-2 font-bold text-sm transition-all group ${getSlotColor(slot)}`}
                          >
                            {/* Occupied Tooltip */}
                            {status === 'occupied' && (
                              <>
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                                  🚫
                                </div>
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-lg">
                                  🚗 Occupied
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-red-600"></div>
                                </div>
                              </>
                            )}

                            {/* Maintenance Tooltip */}
                            {status === 'maintenance' && (
                              <>
                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                                  🔧
                                </div>
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-lg">
                                  🔧 Maintenance
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-orange-600"></div>
                                </div>
                              </>
                            )}

                            {/* Available Tooltip */}
                            {status === 'available' && !isSelected && (
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-lg">
                                ✅ Available
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-green-600"></div>
                              </div>
                            )}

                            {/* Selected Tooltip */}
                            {isSelected && (
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-lg">
                                ✓ Selected
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-blue-600"></div>
                              </div>
                            )}

                            <div className="text-center">
                              <div className="text-lg">{slot.slotNumber}</div>
                              {status === 'occupied' && (
                                <div className="text-xs mt-1">Occupied</div>
                              )}
                              {status === 'maintenance' && (
                                <div className="text-xs mt-1">Maintenance</div>
                              )}
                              {isSelected && (
                                <div className="text-xs mt-1">✓ Selected</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex gap-4 text-xs border-t pt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                        <span>Available ({availableSlots.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                        <span>Occupied ({occupiedSlots.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
                        <span>Maintenance ({maintenanceSlots.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
                        <span>Selected</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={createBooking}
                disabled={loading || !currentBooking.vehicleNumber || !currentBooking.vehicleType || !currentBooking.slotId || availableSlots.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Booking Entry'}
              </button>
            </div>

            {/* Pricing Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Pricing Rates:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>🏍️ Bike: ₹10 (1st hr) + ₹10/hr</p>
                <p>🚗 Car: ₹20 (1st hr) + ₹15/hr</p>
                <p>🚙 SUV: ₹30 (1st hr) + ₹20/hr</p>
                <p>🚚 Truck: ₹40 (1st hr) + ₹25/hr</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Statistics</h2>
              <button
                onClick={() => {
                  fetchBookings();
                  fetchLocationAndSlots();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <span className="text-xl">🔄</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-3xl font-bold text-blue-600">
                  {bookings.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Available Slots</p>
                <p className="text-3xl font-bold text-green-600">
                  {availableSlots.length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Slots</p>
                <p className="text-3xl font-bold text-purple-600">
                  {location?.totalSlots || 0}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-3xl font-bold text-orange-600">
                  {occupiedSlots.length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg col-span-2">
                <p className="text-sm text-gray-600">Under Maintenance</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {maintenanceSlots.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Bookings List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Bookings at {location?.name}</h2>
          
          {loading && bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-6xl mb-4 block">🚗</span>
              <p>No active bookings at this location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => {
                const duration = calculateLiveDuration(booking.entryTime);
                
                return (
                  <div 
                    key={booking._id}
                    className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🎫</span>
                          <span className="font-bold text-lg">{booking.bookingId}</span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-200 text-green-800">
                            ACTIVE
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{getVehicleEmoji(booking.vehicleType)}</span>
                            <span><strong>Vehicle:</strong> {booking.vehicleNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>🚙</span>
                            <span><strong>Type:</strong> {booking.vehicleType.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>#️⃣</span>
                            <span><strong>Slot:</strong> {booking.slotId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span><strong>Entry:</strong> {formatDateTime(booking.entryTime)}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-blue-700">
                          <span>⏱️</span>
                          <span>
                            Duration: {duration.hours}h {duration.minutes}m {duration.seconds}s
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => exitBooking(booking.bookingId)}
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Exit Vehicle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;