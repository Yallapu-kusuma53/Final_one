// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [locations, setLocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', address: '', city: '', totalSlots: '', 
    pricePerHour: '', status: 'active', contactNumber: '', facilities: ''
  });
  
  const [locationStats, setLocationStats] = useState([]);
  const [slotStats, setSlotStats] = useState([]);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role !== 'admin') {
      alert('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchLocations(), fetchBookings(), fetchStatistics()]);
    setLoading(false);
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) setLocations(data.locations);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.bookings);
          calculateEnhancedStats(data.bookings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const calculateEnhancedStats = (bookingsData) => {
    const locationMap = {};
    const slotMap = {};
    
    bookingsData.forEach(booking => {
      const locKey = booking.locationId || booking.locationName;
      if (!locationMap[locKey]) {
        locationMap[locKey] = {
          locationId: booking.locationId,
          locationName: booking.locationName,
          bookingCount: 0,
          totalRevenue: 0,
          activeBookings: 0
        };
      }
      locationMap[locKey].bookingCount++;
      locationMap[locKey].totalRevenue += booking.payment?.totalAmount || 0;
      if (booking.status === 'active') {
        locationMap[locKey].activeBookings++;
      }
      
      const slotKey = `${locKey}-${booking.slotId}`;
      if (!slotMap[slotKey]) {
        slotMap[slotKey] = {
          locationName: booking.locationName,
          slotId: booking.slotId,
          bookingCount: 0,
          totalRevenue: 0
        };
      }
      slotMap[slotKey].bookingCount++;
      slotMap[slotKey].totalRevenue += booking.payment?.totalAmount || 0;
    });
    
    const locationStatsArray = Object.values(locationMap).sort((a, b) => b.bookingCount - a.bookingCount);
    const slotStatsArray = Object.values(slotMap).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 10);
    
    setLocationStats(locationStatsArray);
    setSlotStats(slotStatsArray);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.totalSlots) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editing ? `${API_URL}/admin/slots/${editing._id}` : `${API_URL}/admin/slots`;
      
      const submitData = {
        name: form.name,
        address: form.address,
        city: form.city || 'Not Specified',
        totalSlots: parseInt(form.totalSlots),
        pricePerHour: parseFloat(form.pricePerHour) || 20,
        status: form.status,
        contactNumber: form.contactNumber,
        facilities: form.facilities ? form.facilities.split(',').map(f => f.trim()) : []
      };

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: editing ? 'Location updated!' : 'Location added!' });
        setShowModal(false);
        setEditing(null);
        setForm({
          name: '', address: '', city: '', totalSlots: '', 
          pricePerHour: '', status: 'active', contactNumber: '', facilities: ''
        });
        fetchData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ type: 'error', text: 'Operation failed' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location? This cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/slots/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Location deleted!' });
        fetchData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔧 Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Locations</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.locations.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Slots</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.slots.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Occupancy Rate</div>
              <div className="text-2xl font-bold text-purple-600">{statistics.slots.occupancyRate}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">₹{statistics.revenue.total}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === 'overview'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📊 Statistics Overview
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === 'slots'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🅿️ Location Management
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === 'bookings'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📋 Booking Overview
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="flex-1 px-6 py-4 font-medium text-gray-600 hover:bg-gray-50"
            >
              📈 Reports & Export
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🏆 Top Performing Locations
              </h3>
              <div className="space-y-3">
                {locationStats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No booking data available yet</p>
                ) : (
                  locationStats.map((loc, index) => (
                    <div 
                      key={loc.locationId || index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800">{loc.locationName}</div>
                          <div className="text-sm text-gray-600">
                            {loc.bookingCount} bookings • {loc.activeBookings} currently active
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">₹{loc.totalRevenue}</div>
                        <div className="text-xs text-gray-500">Total Revenue</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🎯 Most Popular Slots
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slotStats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 col-span-2">No slot usage data available yet</p>
                ) : (
                  slotStats.map((slot, index) => (
                    <div 
                      key={`${slot.locationName}-${slot.slotId}`}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Slot {slot.slotId}</div>
                          <div className="text-sm text-gray-600">{slot.locationName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {slot.bookingCount} bookings
                        </div>
                        <div className="text-sm text-green-600">₹{slot.totalRevenue}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">💰 Revenue by Location</h3>
                <div className="space-y-3">
                  {locationStats.slice(0, 5).map((loc, index) => {
                    const totalRevenue = locationStats.reduce((sum, l) => sum + l.totalRevenue, 0);
                    const percentage = totalRevenue > 0 ? (loc.totalRevenue / totalRevenue * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{loc.locationName}</span>
                          <span className="text-gray-600">₹{loc.totalRevenue} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">📈 Booking Trends</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Bookings</div>
                    <div className="text-3xl font-bold text-blue-600">{bookings.length}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">Active Now</div>
                    <div className="text-3xl font-bold text-green-600">
                      {bookings.filter(b => b.status === 'active').length}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600">Avg. Revenue/Booking</div>
                    <div className="text-3xl font-bold text-purple-600">
                      ₹{bookings.length > 0 ? Math.round(
                        bookings.reduce((sum, b) => sum + (b.payment?.totalAmount || 0), 0) / bookings.length
                      ) : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Parking Locations</h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({
                    name: '', address: '', city: '', totalSlots: '', 
                    pricePerHour: '20', status: 'active', contactNumber: '', facilities: ''
                  });
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                ➕ Add Location
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slots</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No locations. Add one to start!
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc) => (
                      <tr key={loc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{loc.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{loc.address}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{loc.city}</td>
                        <td className="px-6 py-4">{loc.totalSlots}</td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${loc.availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {loc.availableSlots}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loc.isActive ? 'active' : 'inactive')}`}>
                            {loc.isActive ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <button
                            onClick={() => navigate(`/admin/slots/${loc.locationId}`)}
                            className="text-purple-600 hover:text-purple-900 font-bold text-lg"
                            title="Manage Slots"
                          >
                            🎛️
                          </button>
                          <button
                            onClick={() => {
                              setEditing(loc);
                              setForm({
                                name: loc.name,
                                address: loc.address,
                                city: loc.city,
                                totalSlots: loc.totalSlots.toString(),
                                pricePerHour: (loc.priceMultiplier * 20).toString(),
                                status: loc.isActive ? 'active' : 'inactive',
                                contactNumber: loc.contactNumber || '',
                                facilities: loc.facilities?.join(', ') || ''
                              });
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(loc._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">All Bookings</h2>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'active').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold text-blue-600">
                  {bookings.filter(b => b.status === 'completed').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Revenue</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{bookings.reduce((sum, b) => sum + (b.payment?.totalAmount || 0), 0)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold">Recent Bookings</h3>
                <button
                  onClick={fetchBookings}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  🔄 Refresh
                </button>
              </div>
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No bookings yet.</td>
                    </tr>
                  ) : (
                    bookings.slice(0, 20).map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-sm">{booking.bookingId}</td>
                        <td className="px-6 py-4 text-sm">{booking.locationName}</td>
                        <td className="px-6 py-4 text-sm">{booking.slotId}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{booking.vehicleNumber}</div>
                          <div className="text-xs text-gray-500">{booking.vehicleType}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{formatDate(booking.entryTime)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {booking.payment?.totalAmount ? (
                            <div>
                              <div className="text-sm font-medium">₹{booking.payment.totalAmount}</div>
                              <div className="text-xs text-gray-500">{booking.payment.paymentStatus}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editing ? 'Edit Location' : 'Add New Location'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., City Center Mall"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Hyderabad"
                    value={form.city}
                    onChange={(e) => setForm({...form, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123 Main Street"
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Slots *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 12"
                    value={form.totalSlots}
                    onChange={(e) => setForm({...form, totalSlots: e.target.value})}
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price/Hour (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 20"
                    value={form.pricePerHour}
                    onChange={(e) => setForm({...form, pricePerHour: e.target.value})}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +91 9876543210"
                  value={form.contactNumber}
                  onChange={(e) => setForm({...form, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facilities (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., CCTV, 24/7 Security, Covered Parking"
                  value={form.facilities}
                  onChange={(e) => setForm({...form, facilities: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editing ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                  }}
                  className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;