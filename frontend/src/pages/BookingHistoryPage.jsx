// frontend/src/pages/BookingHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingService from '../services/BookingService';

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">📋 Booking History</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/booking')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                New Booking
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active ({bookings.filter(b => b.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Completed ({bookings.filter(b => b.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-6xl mb-4 block">📋</span>
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <div 
                  key={booking._id}
                  className={`border-l-4 rounded-lg p-4 ${
                    booking.status === 'active'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-400 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🎫</span>
                        <span className="font-bold text-lg">{booking.bookingId}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          booking.status === 'active'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-300 text-gray-800'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Vehicle:</span>
                          <span className="ml-2 font-semibold">{booking.vehicleNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Slot:</span>
                          <span className="ml-2 font-semibold">{booking.slotId}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Entry:</span>
                          <span className="ml-2 font-semibold">{formatDateTime(booking.entryTime)}</span>
                        </div>
                        
                        {booking.exitTime && (
                          <>
                            <div>
                              <span className="text-gray-600">Exit:</span>
                              <span className="ml-2 font-semibold">{formatDateTime(booking.exitTime)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <span className="ml-2 font-semibold">
                                {booking.duration.hours}h {booking.duration.minutes}m {booking.duration.seconds}s
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment:</span>
                              <span className="ml-2 font-bold text-green-600">
                                ₹{booking.payment.totalAmount}
                              </span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                booking.payment.paymentStatus === 'paid'
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-yellow-200 text-yellow-800'
                              }`}>
                                {booking.payment.paymentStatus.toUpperCase()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryPage;