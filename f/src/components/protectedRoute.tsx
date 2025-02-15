// Файл: src/components/protectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Проверяем наличие токена
  const token = localStorage.getItem('token');

  // Если токена нет, перенаправляем на страницу логина
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Если токен есть, отображаем защищенный контент
  return <>{children}</>;
};

export default ProtectedRoute;
