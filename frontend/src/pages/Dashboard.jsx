// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    bookings: { total: 0, active: 0, completed: 0 },
    slots: { total: 0, available: 0, occupied: 0 },
    revenue: { total: 0, paid: 0, pending: 0, formatted: '₹0' },
    vehicleTypes: []
  });
  const [locations, setLocations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedLocationSlots, setSelectedLocationSlots] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const statsResponse = await fetch(`${API_URL}/bookings/stats`, { headers });
      
      if (!statsResponse.ok) {
        throw new Error(`Stats API returned ${statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();
      
      if (statsData.success && statsData.data) {
        setStats(statsData.data);
      }

      const locationsResponse = await fetch(`${API_URL}/locations`, { headers });
      
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        if (locationsData.success && locationsData.data) {
          setLocations(locationsData.data);
        }
      }

      const bookingsResponse = await fetch(`${API_URL}/bookings?limit=20`, { headers });
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        if (bookingsData.success && bookingsData.data) {
          setRecentBookings(bookingsData.data);
        }
      }

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationSlots = async (locationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/locations/${locationId}/slots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.slots) {
          const availableSlots = data.slots.filter(slot => slot.isAvailable);
          setSelectedLocationSlots(prev => ({
            ...prev,
            [locationId]: availableSlots
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  const handleLocationClick = async (location) => {
    if (!selectedLocationSlots[location.locationId]) {
      await fetchLocationSlots(location.locationId);
    }
    handleNavigation(`/booking/${location.locationId}`);
  };

  const handlePayment = async (bookingId) => {
    if (!window.confirm('Mark this booking as paid?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bookings/${bookingId}/payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus: 'paid' })
      });

      if (response.ok) {
        alert('Payment marked as paid successfully!');
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to update payment status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Payment update error:', error);
      alert('Failed to update payment status');
    }
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getVehicleEmoji = (type) => {
    const emojis = { bike: '🏍️', car: '🚗', suv: '🚙', truck: '🚚' };
    return emojis[type?.toLowerCase()] || '🚗';
  };

  const pendingPayments = recentBookings.filter(
    b => b.status === 'completed' && b.payment?.paymentStatus === 'pending'
  );

  const activeBookings = recentBookings.filter(b => b.status === 'active');

  const occupancyRate = stats.slots.total > 0 
    ? ((stats.slots.occupied / stats.slots.total) * 100).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                🚗 Smart Parking Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, <strong>{user?.name || 'User'}</strong>
              </span>
              <button 
                onClick={() => handleNavigation('/locations')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Booking
              </button>
              <button 
                onClick={() => handleNavigation('/booking-history')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {lastUpdated && (
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Last updated: {formatTimeAgo(lastUpdated)}
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span>{loading ? 'Updating...' : 'Refresh Now'}</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !lastUpdated ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {(pendingPayments.length > 0 || stats.slots.available < 5) && (
              <div className="mb-6 space-y-3">
                {pendingPayments.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⚠️</span>
                      <div>
                        <p className="font-semibold text-yellow-800">
                          {pendingPayments.length} Pending Payment{pendingPayments.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-yellow-700">
                          Total amount: ₹{pendingPayments.reduce((sum, b) => sum + (b.payment?.totalAmount || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {stats.slots.available < 5 && stats.slots.total > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🚨</span>
                      <div>
                        <p className="font-semibold text-red-800">Low Parking Availability</p>
                        <p className="text-sm text-red-700">
                          Only {stats.slots.available} slot{stats.slots.available !== 1 ? 's' : ''} remaining across all locations
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Locations</h2>
                  <span className="text-sm text-gray-500">{locations.length} total</span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {locations.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No locations available</p>
                  ) : (
                    locations.map((location) => {
                      const locationSlots = selectedLocationSlots[location.locationId] || [];
                      return (
                        <div
                          key={location.locationId || location._id}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all hover:shadow-md border border-transparent hover:border-blue-300"
                          onClick={() => handleLocationClick(location)}
                          onMouseEnter={() => {
                            if (!selectedLocationSlots[location.locationId]) {
                              fetchLocationSlots(location.locationId);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{location.name}</p>
                              <p className="text-xs text-gray-600">{location.city}</p>
                              
                              {location.availableSlots > 0 ? (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Available Slots:</p>
                                  {locationSlots.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {locationSlots.slice(0, 8).map((slot) => (
                                        <span 
                                          key={slot.slotId}
                                          className="relative px-2 py-1 text-xs font-medium bg-green-100 border border-green-300 rounded cursor-pointer hover:bg-green-200 transition-colors group"
                                          title="Available"
                                        >
                                          {slot.slotNumber}
                                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                            ✅ Available
                                          </span>
                                        </span>
                                      ))}
                                      {locationSlots.length > 8 && (
                                        <span className="px-2 py-1 text-xs font-medium text-gray-500">
                                          +{locationSlots.length - 8} more
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">Loading slots...</span>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-2 text-xs text-red-600 font-medium">
                                  No slots available
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-3">
                              <p className={`text-lg font-bold ${
                                location.availableSlots > 5 ? 'text-green-600' :
                                location.availableSlots > 0 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {location.availableSlots}
                              </p>
                              <p className="text-xs text-gray-500">available</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Status</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Collection Progress</span>
                      <span className="text-lg font-bold text-gray-800">
                        {stats.revenue.total > 0 
                          ? ((stats.revenue.paid / stats.revenue.total) * 100).toFixed(0) 
                          : 0}%
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ 
                          width: `${stats.revenue.total > 0 ? (stats.revenue.paid / stats.revenue.total) * 100 : 0}%` 
                        }}
                      >
                        {stats.revenue.paid > 0 && (
                          <span className="text-xs text-white font-bold">₹{stats.revenue.paid}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Collected</span>
                      <span>Total: ₹{stats.revenue.total}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                      <div className="text-green-600 text-2xl mb-2">✓</div>
                      <p className="text-xs text-gray-600 mb-1">Collected</p>
                      <p className="text-2xl font-bold text-green-700">₹{stats.revenue.paid}</p>
                      <p className="text-xs text-green-600 mt-1">{stats.bookings.completed - pendingPayments.length} payments</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-4">
                      <div className="text-yellow-600 text-2xl mb-2">⏳</div>
                      <p className="text-xs text-gray-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-700">₹{stats.revenue.pending}</p>
                      <p className="text-xs text-yellow-600 mt-1">{pendingPayments.length} payments</p>
                    </div>
                  </div>

                  {stats.bookings.total > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">📊 Today's Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-xs text-gray-600">Active Bookings</span>
                          <span className="font-bold text-blue-600">{stats.bookings.active}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                          <span className="text-xs text-gray-600">Completed Today</span>
                          <span className="font-bold text-purple-600">{stats.bookings.completed}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                          <span className="text-xs text-gray-600">Avg. Revenue/Booking</span>
                          <span className="font-bold text-indigo-600">
                            ₹{stats.bookings.completed > 0 ? Math.round(stats.revenue.total / stats.bookings.completed) : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Active Now</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {activeBookings.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activeBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No active bookings</p>
                      <button 
                        onClick={() => handleNavigation('/locations')}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Create New Booking
                      </button>
                    </div>
                  ) : (
                    activeBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getVehicleEmoji(booking.vehicleType)}</span>
                              <span className="font-bold text-sm">{booking.vehicleNumber}</span>
                            </div>
                            <p className="text-xs text-gray-600">📍 {booking.locationName}</p>
                            <p className="text-xs text-gray-600">🅿️ Slot {booking.slotId}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Parked {formatTimeAgo(booking.entryTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                  <button 
                    onClick={() => handleNavigation('/booking-history')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-sm text-gray-400 mt-2">Your bookings will appear here</p>
                    </div>
                  ) : (
                    recentBookings.slice(0, 6).map((booking) => (
                      <div
                        key={booking._id}
                        className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                          booking.status === 'active'
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getVehicleEmoji(booking.vehicleType)}</span>
                              <span className="font-bold">{booking.vehicleNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                booking.status === 'active'
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-gray-300 text-gray-800'
                              }`}>
                                {booking.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📍 {booking.locationName}</p>
                              <p>🅿️ Slot: {booking.slotId}</p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(booking.entryTime)}
                              </p>
                              {booking.status === 'completed' && booking.payment && (
                                <p className="font-semibold text-purple-600 mt-2">
                                  💰 ₹{booking.payment.totalAmount}
                                  <span className={`ml-2 text-xs ${
                                    booking.payment.paymentStatus === 'paid' 
                                      ? 'text-green-600' 
                                      : 'text-yellow-600'
                                  }`}>
                                    ({booking.payment.paymentStatus})
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  💳 Pending Payments ({pendingPayments.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingPayments.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-5xl">✅</span>
                      <p className="text-gray-500 mt-3">All payments cleared!</p>
                      <p className="text-sm text-gray-400 mt-1">No pending payments at the moment</p>
                    </div>
                  ) : (
                    pendingPayments.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getVehicleEmoji(booking.vehicleType)}</span>
                              <span className="font-bold">{booking.vehicleNumber}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📍 {booking.locationName}</p>
                              {booking.duration && (
                                <p>⏱️ Duration: {booking.duration.hours}h {booking.duration.minutes}m</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Completed {formatTimeAgo(booking.exitTime || booking.entryTime)}
                              </p>
                              {booking.payment && (
                                <p className="font-bold text-xl text-purple-600 mt-2">
                                  ₹{booking.payment.totalAmount}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePayment(booking.bookingId)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm hover:shadow-md"
                        >
                          Mark as Paid
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;