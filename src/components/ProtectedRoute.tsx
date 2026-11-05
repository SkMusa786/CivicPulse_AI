import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Checking your session...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) {
    const dashboard = role === 'admin'
      ? '/admin/dashboard'
      : role === 'officer'
        ? '/officer/dashboard'
        : '/citizen/dashboard';
    return <Navigate to={dashboard} replace />;
  }
  return <Outlet />;
};
