import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserStoresPage } from './pages/user/UserStoresPage';
import { StoreOwnerDashboardPage } from './pages/owner/StoreOwnerDashboardPage';
import { ChangePasswordPage } from './pages/shared/ChangePasswordPage';

const RootRedirect: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) return null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Normal User Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['NORMAL_USER', 'ADMIN']} />}>
            <Route path="/stores" element={<UserStoresPage />} />
          </Route>

          {/* Store Owner Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
            <Route path="/owner" element={<StoreOwnerDashboardPage />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Root & Fallback Redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
