// ============================================
// frontend/src/App.jsx
// ============================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LocationsPage from './pages/LocationsPage';
import BookingPage from './pages/BookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';

// =====================
// Auth Helpers
// =====================
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const getUserRole = () => {
  return localStorage.getItem('role'); // "user" or "admin"
};

// =====================
// Protected Route
// =====================
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// =====================
// Admin Protected Route
// =====================
const AdminRoute = ({ children }) => {
  return isAuthenticated() && getUserRole() === 'admin'
    ? children
    : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ===================== */}
        {/* Public Routes */}
        {/* ===================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ===================== */}
        {/* User Protected Routes */}
        {/* ===================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <LocationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:locationId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-history"
          element={
            <ProtectedRoute>
              <BookingHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* ===================== */}
        {/* Admin Routes */}
        {/* ===================== */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ===================== */}
        {/* Default Route */}
        {/* ===================== */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/locations" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* ===================== */}
        {/* 404 Catch-All */}
        {/* ===================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
