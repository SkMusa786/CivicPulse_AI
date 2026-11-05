import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { DepartmentLayout } from './layouts/DepartmentLayout';

// Public & Auth Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportIssue } from './pages/citizen/ReportIssue';
import { MyComplaints } from './pages/citizen/MyComplaints';
import { TrackComplaint } from './pages/citizen/TrackComplaint';
import { Profile } from './pages/citizen/Profile';
import { SpotGuardPage } from './pages/citizen/SpotGuardPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PendingComplaints } from './pages/admin/PendingComplaints';
import { AllComplaints } from './pages/admin/AllComplaints';
import { Analytics } from './pages/admin/Analytics';
import { UserManagement } from './pages/admin/UserManagement';

// Department Pages
import { DepartmentDashboard } from './pages/department/DepartmentDashboard';
import { AssignedComplaints } from './pages/department/AssignedComplaints';
import { ResolutionProofPage } from './pages/department/ResolutionProofPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Portal */}
            <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
            <Route path="/citizen" element={<CitizenLayout />}>
              <Route index element={<Navigate to="/citizen/dashboard" replace />} />
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="report" element={<ReportIssue />} />
              <Route path="spotguard" element={<SpotGuardPage />} />
              <Route path="my-complaints" element={<MyComplaints />} />
              <Route path="track" element={<TrackComplaint />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Portal */}
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="pending" element={<PendingComplaints />} />
              <Route path="complaints" element={<AllComplaints />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Department Portal */}
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
            <Route path="/officer" element={<DepartmentLayout />}>
              <Route index element={<Navigate to="/officer/dashboard" replace />} />
              <Route path="dashboard" element={<DepartmentDashboard />} />
              <Route path="assigned" element={<AssignedComplaints />} />
              <Route path="proof" element={<ResolutionProofPage />} />
            </Route>
            <Route path="/department" element={<DepartmentLayout />}>
              <Route index element={<Navigate to="/officer/dashboard" replace />} />
              <Route path="dashboard" element={<DepartmentDashboard />} />
              <Route path="assigned" element={<AssignedComplaints />} />
              <Route path="proof" element={<ResolutionProofPage />} />
            </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
