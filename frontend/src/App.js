import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from './store/authStore';
import { initializeSocket } from './services/socketService';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Applications from './pages/Applications';
import JobRecommendations from './pages/JobRecommendations';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { user, token, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Initialize socket connection if user is logged in
    if (token && user) {
      initializeSocket(token);
    }
  }, [token, user]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" />} 
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {user?.role === 'admin' && <AdminDashboard />}
                {user?.role === 'recruiter' && <RecruiterDashboard />}
                {user?.role === 'user' && <UserDashboard />}
              </PrivateRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <PrivateRoute>
                <Applications />
              </PrivateRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <PrivateRoute role="user">
                <JobRecommendations />
              </PrivateRoute>
            }
          />

          <Route
            path="/recruiter/*"
            element={
              <PrivateRoute role="recruiter">
                <RecruiterDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
