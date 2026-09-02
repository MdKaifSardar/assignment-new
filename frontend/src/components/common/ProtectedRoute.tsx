import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading session...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
    return <Navigate to="/stores" replace />;
  }

  return <Outlet />;
};
