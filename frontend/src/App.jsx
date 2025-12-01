import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './LoginPage';
import UserDashboard from './UserDashboard';
import ElectionVote from './ElectionVote';
import AdminDashboard from './AdminDashboard';
import ManageElection from './ManageElection';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* User Routes */}
            <Route element={<ProtectedRoute role="ROLE_USER" />}>
              <Route path="/" element={<UserDashboard />} />
              <Route path="/vote/:id" element={<ElectionVote />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute role="ROLE_ADMIN" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/election/:id" element={<ManageElection />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
