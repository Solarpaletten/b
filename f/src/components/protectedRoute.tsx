// Файл: src/components/protectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Проверка авторизации через наличие токена
  const isAuthenticated = localStorage.getItem('token') !== null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/api/login" />;
};

export default ProtectedRoute;
