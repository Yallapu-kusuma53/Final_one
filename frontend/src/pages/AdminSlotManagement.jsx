// frontend/src/pages/AdminSlotManagement.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const AdminSlotManagement = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newSlotCodes, setNewSlotCodes] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check authentication and admin role
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      alert('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }

    fetchLocationAndSlots();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLocationAndSlots();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [locationId, navigate]);

  const fetchLocationAndSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch location details
      try {
        const locResponse = await fetch(`${API_URL}/admin/locations/${locationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (locResponse.ok) {
          const locData = await locResponse.json();
          if (locData.success) {
            setLocation(locData.location);
          }
        } else {
          console.error('Failed to load location:', locResponse.status);
        }
      } catch (locError) {
        console.error('Location fetch error:', locError);
        setMessage({ type: 'error', text: 'Failed to load location details' });
      }
      
      // Fetch slots for this location
      try {
        const slotsResponse = await fetch(`${API_URL}/locations/${locationId}/slots`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (slotsResponse.ok) {
          const slotsData = await slotsResponse.json();
          if (slotsData.success) {
            setSlots(slotsData.slots || []);
            console.log('All slots:', slotsData.slots);
            
            // Now fetch bookings after we have slots
            try {
              const bookingsResponse = await fetch(`${API_URL}/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json();
                if (bookingsData.success && bookingsData.data) {
                  // Filter for active bookings at this location
                  const active = bookingsData.data.filter(b => 
                    b.status === 'active' && 
                    (b.locationId === locationId || b.locationId === parseInt(locationId))
                  );
                  console.log('Active bookings for location:', active);
                  setActiveBookings(active);
                }
              } else {
                console.error('Failed to fetch bookings:', bookingsResponse.status);
              }
            } catch (bookingError) {
              console.error('Error fetching bookings:', bookingError);
              // Continue even if bookings fail - just won't show occupied status
              setActiveBookings([]);
            }
          }
        } else {
          console.error('Failed to load slots:', slotsResponse.status);
          setMessage({ type: 'error', text: 'Failed to load slots' });
        }
      } catch (slotsError) {
        console.error('Slots fetch error:', slotsError);
        setMessage({ type: 'error', text: 'Failed to load slots' });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
      setLoading(false);
    }
  };

  const handleAddSlots = async () => {
    if (!newSlotCodes.trim()) {
      setMessage({ type: 'error', text: 'Please enter slot codes' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const slotCodesArray = newSlotCodes
        .split(',')
        .map(code => code.trim().toUpperCase())
        .filter(code => code.length > 0);

      if (slotCodesArray.length === 0) {
        setMessage({ type: 'error', text: 'No valid slot codes entered' });
        return;
      }

      const response = await fetch(`${API_URL}/admin/slots/${locationId}/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slotCodes: slotCodesArray })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `Added ${slotCodesArray.length} slot(s) successfully!` });
        setNewSlotCodes('');
        fetchLocationAndSlots();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add slots' });
      }
    } catch (error) {
      console.error('Add slots error:', error);
      setMessage({ type: 'error', text: 'Failed to add slots' });
    }
  };

  const handleToggleSlot = async (slotId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !currentStatus;
      
      const response = await fetch(`${API_URL}/admin/slots/${locationId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          slotId: slotId,
          isActive: newStatus 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Slot ${newStatus ? 'enabled' : 'set to maintenance'} successfully!` 
        });
        fetchLocationAndSlots();
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update slot' });
      }
    } catch (error) {
      console.error('Toggle slot error:', error);
      setMessage({ type: 'error', text: 'Failed to update slot status' });
    }
  };

  const handleDeleteSlot = async (slotId, slotNumber) => {
    if (!window.confirm(`Delete slot ${slotNumber}? This cannot be undone.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/slots/${locationId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slotId: slotId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `Slot ${slotNumber} deleted successfully!` });
        fetchLocationAndSlots();
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete slot' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  // Get slot status (maintenance, occupied, or available)
  const getSlotStatus = (slot) => {
    // FIRST check if slot is occupied (has active booking) - this takes priority
    // Try matching with both full slotId and just the slot number
    const isOccupied = activeBookings.some(booking => {
      const bookingSlotId = booking.slotId || '';
      const slotId = slot.slotId || '';
      const slotNumber = slot.slotNumber || '';
      
      // Match either exact slotId or slot number
      return bookingSlotId === slotId || 
             bookingSlotId === slotNumber ||
             bookingSlotId.endsWith(`-${slotNumber}`) ||
             slotId.endsWith(`-${bookingSlotId}`);
    });
    
    if (isOccupied) {
      return 'occupied';
    }
    
    // THEN check if slot is under maintenance
    if (!slot.isAvailable) {
      return 'maintenance';
    }
    
    return 'available';
  };

  // Get booking info for a slot
  const getSlotBooking = (slotId) => {
    return activeBookings.find(booking => {
      const bookingSlotId = booking.slotId || '';
      const targetSlotId = slotId || '';
      
      // Try different matching strategies
      return bookingSlotId === targetSlotId || 
             bookingSlotId.includes(targetSlotId) ||
             targetSlotId.includes(bookingSlotId);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const activeSlots = slots.filter(s => getSlotStatus(s) === 'available');
  const maintenanceSlots = slots.filter(s => getSlotStatus(s) === 'maintenance');
  const occupiedSlots = slots.filter(s => getSlotStatus(s) === 'occupied');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-purple-700 text-white z-10">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          
          <nav className="space-y-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-600"
            >
              Dashboard
            </button>
            <button
              className="w-full text-left px-4 py-3 rounded-lg bg-white text-purple-700 font-medium"
            >
              Areas
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-600"
            >
              Bookings
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-purple-600 hover:text-purple-800 mb-4 flex items-center font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-purple-700">Slot Management</h1>
          {location && (
            <div className="mt-2">
              <p className="text-gray-600">
                Managing slots for: <span className="font-semibold text-gray-800">{location.name}</span>
              </p>
              <p className="text-sm text-gray-500">{location.address}, {location.city}</p>
            </div>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add Slots Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Slots</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter slot codes (A1, A2, A3)"
              value={newSlotCodes}
              onChange={(e) => setNewSlotCodes(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSlots()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleAddSlots}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Add Slots
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Separate multiple slot codes with commas (e.g., A1, A2, B1, B2, C1, C2)
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Slots</div>
            <div className="text-2xl font-bold text-gray-900">{slots.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Available</div>
            <div className="text-2xl font-bold text-green-600">
              {activeSlots.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Occupied</div>
            <div className="text-2xl font-bold text-blue-600">
              {occupiedSlots.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Maintenance</div>
            <div className="text-2xl font-bold text-orange-600">
              {maintenanceSlots.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Occupancy Rate</div>
            <div className="text-2xl font-bold text-purple-600">
              {slots.length > 0 ? Math.round((occupiedSlots.length / slots.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Slots Grid View */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Slot Overview</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                <span className="text-gray-600">Available ({activeSlots.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                <span className="text-gray-600">Occupied ({occupiedSlots.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
                <span className="text-gray-600">Maintenance ({maintenanceSlots.length})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {slots.map((slot) => {
              const status = getSlotStatus(slot);
              const booking = getSlotBooking(slot.slotId);
              
              return (
                <div
                  key={slot.slotId}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    status === 'available'
                      ? 'bg-green-50 border-green-500 hover:shadow-lg'
                      : status === 'occupied'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-orange-50 border-orange-500'
                  }`}
                >
                  {/* Status Badge */}
                  {status === 'maintenance' && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      MAINTENANCE
                    </div>
                  )}
                  
                  {status === 'occupied' && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      🚗 OCCUPIED
                    </div>
                  )}

                  {/* Slot Number */}
                  <div className="text-center mb-4">
                    <div className={`text-3xl font-bold ${
                      status === 'available' ? 'text-green-700' : 
                      status === 'occupied' ? 'text-blue-700' : 
                      'text-orange-700'
                    }`}>
                      {slot.slotNumber}
                    </div>
                    <div className={`text-xs mt-1 font-medium ${
                      status === 'available' ? 'text-green-600' : 
                      status === 'occupied' ? 'text-blue-600' : 
                      'text-orange-600'
                    }`}>
                      {status === 'available' ? 'AVAILABLE' : 
                       status === 'occupied' ? 'OCCUPIED' : 
                       'MAINTENANCE'}
                    </div>
                  </div>

                  {/* Booking Info for Occupied Slots */}
                  {status === 'occupied' && booking && (
                    <div className="mb-3 p-2 bg-white rounded text-xs">
                      <div className="font-semibold text-gray-700 truncate">
                        {booking.vehicleNumber}
                      </div>
                      <div className="text-gray-500">
                        {booking.vehicleType}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {status !== 'occupied' && (
                      <button
                        onClick={() => handleToggleSlot(slot.slotId, slot.isAvailable)}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          status === 'available'
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {status === 'available' ? '🔧 Maintenance' : '✅ Activate'}
                      </button>
                    )}
                    
                    {status === 'occupied' && (
                      <div className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium text-center">
                        🚗 In Use
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleDeleteSlot(slot.slotId, slot.slotNumber)}
                      disabled={status === 'occupied'}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        status === 'occupied'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {slots.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No slots created yet. Add some slots to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSlotManagement;