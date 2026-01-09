// frontend/src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0], // Today
    locationId: '',
    slotId: '',
    reportType: 'monthly', // daily, weekly, monthly
    userType: 'all' // all, admin, user
  });

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
    
    fetchLocations();
    generateReport();
  }, [navigate]);

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

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allBookings = data.bookings;
          setBookings(allBookings);
          
          // Filter bookings based on date range
          const filteredBookings = allBookings.filter(booking => {
            const bookingDate = new Date(booking.entryTime);
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            
            let matchesDate = bookingDate >= start && bookingDate <= end;
            let matchesLocation = !filters.locationId || booking.locationId === filters.locationId;
            let matchesSlot = !filters.slotId || booking.slotId === filters.slotId;
            
            return matchesDate && matchesLocation && matchesSlot;
          });
          
          calculateReportMetrics(filteredBookings);
        }
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReportMetrics = (filteredBookings) => {
    // Total bookings
    const totalBookings = filteredBookings.length;
    
    // Revenue
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.payment?.totalAmount || 0), 0);
    
    // Average duration
    const completedBookings = filteredBookings.filter(b => b.status === 'completed' && b.exitTime);
    const totalDuration = completedBookings.reduce((sum, b) => {
      const duration = new Date(b.exitTime) - new Date(b.entryTime);
      return sum + duration;
    }, 0);
    const avgDuration = completedBookings.length > 0 ? totalDuration / completedBookings.length : 0;
    const avgHours = Math.floor(avgDuration / (1000 * 60 * 60));
    const avgMinutes = Math.floor((avgDuration % (1000 * 60 * 60)) / (1000 * 60));
    
    // Peak hours analysis
    const hourCounts = {};
    filteredBookings.forEach(booking => {
      const hour = new Date(booking.entryTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({
        hour: `${hour}:00 - ${parseInt(hour) + 1}:00`,
        count
      }));
    
    // Location-wise breakdown
    const locationStats = {};
    filteredBookings.forEach(booking => {
      const locName = booking.locationName || 'Unknown';
      if (!locationStats[locName]) {
        locationStats[locName] = {
          bookings: 0,
          revenue: 0
        };
      }
      locationStats[locName].bookings++;
      locationStats[locName].revenue += booking.payment?.totalAmount || 0;
    });
    
    // Vehicle type breakdown
    const vehicleStats = {};
    filteredBookings.forEach(booking => {
      const type = booking.vehicleType || 'Unknown';
      vehicleStats[type] = (vehicleStats[type] || 0) + 1;
    });
    
    // Day-wise breakdown
    const dayStats = {};
    filteredBookings.forEach(booking => {
      const date = new Date(booking.entryTime).toISOString().split('T')[0];
      if (!dayStats[date]) {
        dayStats[date] = {
          bookings: 0,
          revenue: 0
        };
      }
      dayStats[date].bookings++;
      dayStats[date].revenue += booking.payment?.totalAmount || 0;
    });
    
    // Slot utilization
    const slotStats = {};
    filteredBookings.forEach(booking => {
      const slot = booking.slotId || 'Unknown';
      if (!slotStats[slot]) {
        slotStats[slot] = {
          location: booking.locationName,
          bookings: 0,
          revenue: 0
        };
      }
      slotStats[slot].bookings++;
      slotStats[slot].revenue += booking.payment?.totalAmount || 0;
    });
    
    setReportData({
      totalBookings,
      totalRevenue,
      avgDuration: { hours: avgHours, minutes: avgMinutes },
      peakHours,
      locationStats,
      vehicleStats,
      dayStats,
      slotStats,
      activeBookings: filteredBookings.filter(b => b.status === 'active').length,
      completedBookings: completedBookings.length,
      cancelledBookings: filteredBookings.filter(b => b.status === 'cancelled').length
    });
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    csvContent += "PARKING MANAGEMENT SYSTEM - USAGE REPORT\n";
    csvContent += `Report Period: ${filters.startDate} to ${filters.endDate}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Summary Section
    csvContent += "SUMMARY METRICS\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Bookings,${reportData.totalBookings}\n`;
    csvContent += `Total Revenue,₹${reportData.totalRevenue}\n`;
    csvContent += `Active Bookings,${reportData.activeBookings}\n`;
    csvContent += `Completed Bookings,${reportData.completedBookings}\n`;
    csvContent += `Cancelled Bookings,${reportData.cancelledBookings}\n`;
    csvContent += `Average Duration,${reportData.avgDuration.hours}h ${reportData.avgDuration.minutes}m\n\n`;
    
    // Peak Hours
    csvContent += "PEAK HOURS\n";
    csvContent += "Time Slot,Bookings\n";
    reportData.peakHours.forEach(ph => {
      csvContent += `${ph.hour},${ph.count}\n`;
    });
    csvContent += "\n";
    
    // Location Stats
    csvContent += "LOCATION-WISE BREAKDOWN\n";
    csvContent += "Location,Bookings,Revenue\n";
    Object.entries(reportData.locationStats).forEach(([location, stats]) => {
      csvContent += `${location},${stats.bookings},₹${stats.revenue}\n`;
    });
    csvContent += "\n";
    
    // Vehicle Type Stats
    csvContent += "VEHICLE TYPE BREAKDOWN\n";
    csvContent += "Vehicle Type,Bookings\n";
    Object.entries(reportData.vehicleStats).forEach(([type, count]) => {
      csvContent += `${type},${count}\n`;
    });
    csvContent += "\n";
    
    // Daily Stats
    csvContent += "DAILY BREAKDOWN\n";
    csvContent += "Date,Bookings,Revenue\n";
    Object.entries(reportData.dayStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, stats]) => {
        csvContent += `${date},${stats.bookings},₹${stats.revenue}\n`;
      });
    csvContent += "\n";
    
    // Slot Utilization
    csvContent += "SLOT UTILIZATION\n";
    csvContent += "Slot ID,Location,Bookings,Revenue\n";
    Object.entries(reportData.slotStats)
      .sort((a, b) => b[1].bookings - a[1].bookings)
      .forEach(([slot, stats]) => {
        csvContent += `${slot},${stats.location},${stats.bookings},₹${stats.revenue}\n`;
      });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `parking_report_${filters.startDate}_to_${filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDetailedBookings = () => {
    // Export detailed booking data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Booking ID,Location,Slot,Vehicle Number,Vehicle Type,Entry Time,Exit Time,Duration,Amount,Payment Status,Status\n";
    
    bookings.forEach(booking => {
      const duration = booking.duration ? 
        `${booking.duration.hours}h ${booking.duration.minutes}m` : 
        'N/A';
      
      csvContent += `${booking.bookingId},`;
      csvContent += `${booking.locationName},`;
      csvContent += `${booking.slotId},`;
      csvContent += `${booking.vehicleNumber},`;
      csvContent += `${booking.vehicleType},`;
      csvContent += `${new Date(booking.entryTime).toLocaleString()},`;
      csvContent += `${booking.exitTime ? new Date(booking.exitTime).toLocaleString() : 'N/A'},`;
      csvContent += `${duration},`;
      csvContent += `₹${booking.payment?.totalAmount || 0},`;
      csvContent += `${booking.payment?.paymentStatus || 'N/A'},`;
      csvContent += `${booking.status}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `detailed_bookings_${filters.startDate}_to_${filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Reports & Analytics</h1>
            <p className="text-sm text-gray-600">Generate and export usage reports</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </button>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Report Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={filters.locationId}
                onChange={(e) => setFilters({...filters, locationId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc.locationId} value={loc.locationId}>{loc.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters({...filters, reportType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : '🔄 Generate Report'}
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={!reportData}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
            >
              📥 Export Summary CSV
            </button>
            
            <button
              onClick={exportDetailedBookings}
              disabled={!bookings.length}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400"
            >
              📋 Export Detailed Bookings
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Generating report...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Bookings</div>
                <div className="text-3xl font-bold text-blue-600">{reportData.totalBookings}</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">₹{reportData.totalRevenue}</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Avg Duration</div>
                <div className="text-3xl font-bold text-purple-600">
                  {reportData.avgDuration.hours}h {reportData.avgDuration.minutes}m
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Active Bookings</div>
                <div className="text-3xl font-bold text-orange-600">{reportData.activeBookings}</div>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">⏰ Peak Hours</h3>
              <div className="space-y-3">
                {reportData.peakHours.map((ph, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold">{ph.hour}</span>
                    <span className="text-blue-600 font-bold">{ph.count} bookings</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">📍 Location-wise Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(reportData.locationStats).map(([location, stats]) => (
                      <tr key={location}>
                        <td className="px-6 py-4 font-medium">{location}</td>
                        <td className="px-6 py-4">{stats.bookings}</td>
                        <td className="px-6 py-4 text-green-600 font-bold">₹{stats.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vehicle Type Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">🚗 Vehicle Type Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.vehicleStats).map(([type, count]) => (
                  <div key={type} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg text-center">
                    <div className="text-2xl mb-2">
                      {type === 'bike' && '🏍️'}
                      {type === 'car' && '🚗'}
                      {type === 'suv' && '🚙'}
                      {type === 'truck' && '🚚'}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{type}</div>
                    <div className="text-2xl font-bold text-purple-600">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Slots */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">🎯 Top Performing Slots</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slot ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(reportData.slotStats)
                      .sort((a, b) => b[1].bookings - a[1].bookings)
                      .slice(0, 10)
                      .map(([slot, stats], index) => (
                        <tr key={slot} className={index < 3 ? 'bg-yellow-50' : ''}>
                          <td className="px-6 py-4">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `#${index + 1}`}
                          </td>
                          <td className="px-6 py-4 font-bold">{slot}</td>
                          <td className="px-6 py-4">{stats.location}</td>
                          <td className="px-6 py-4">{stats.bookings}</td>
                          <td className="px-6 py-4 text-green-600 font-bold">₹{stats.revenue}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Click "Generate Report" to view analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;