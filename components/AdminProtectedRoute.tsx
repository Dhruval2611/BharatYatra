import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';

  if (!isAdminAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;