// src/components/Navbar.jsx

import React from 'react';
import { Car, Calendar, ArrowLeft } from 'lucide-react';

const Navbar = ({ user, onLogout, onNavigate, currentPage }) => {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {currentPage !== 'dashboard' ? (
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Car className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Smart Parking</h1>
              <p className="text-sm text-gray-500">Intelligent Slot Management</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {currentPage === 'dashboard' && (
            <button
              onClick={() => onNavigate('bookings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <Calendar size={18} />
              My Bookings
            </button>
          )}
          <div className="text-right">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="font-bold text-gray-800">{user.fullName}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;