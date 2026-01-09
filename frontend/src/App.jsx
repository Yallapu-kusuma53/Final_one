// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import Dashboard from './pages/Dashboard';
import LocationsPage from './pages/LocationsPage';
import BookingPage from './pages/BookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';

import AdminDashboard from './pages/AdminDashboard';
import AdminSlotManagement from './pages/AdminSlotManagement';
import ReportsPage from './pages/ReportsPage';

function App() {
  // =====================
  // Auth Helper Functions
  // =====================
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const getUserRole = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return user.role; // 'user' or 'admin'
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  };

  // =====================
  // Protected Routes
  // =====================

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    const role = getUserRole();
    if (role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  const UserRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    const role = getUserRole();
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
  };

  const RootRedirect = () => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    const role = getUserRole();
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* ===================== */}
        {/* Public Routes */}
        {/* ===================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ===================== */}
        {/* User Routes */}
        {/* ===================== */}
        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <Dashboard />
            </UserRoute>
          }
        />

        <Route
          path="/locations"
          element={
            <UserRoute>
              <LocationsPage />
            </UserRoute>
          }
        />

        <Route
          path="/booking/:locationId"
          element={
            <UserRoute>
              <BookingPage />
            </UserRoute>
          }
        />

        <Route
          path="/booking-history"
          element={
            <UserRoute>
              <BookingHistoryPage />
            </UserRoute>
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

        <Route
          path="/admin/slots/:locationId"
          element={
            <AdminRoute>
              <AdminSlotManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <ReportsPage />
            </AdminRoute>
          }
        />

        {/* ===================== */}
        {/* Default Routes */}
        {/* ===================== */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
