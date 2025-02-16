// Файл: src/components/protectedRoute.tsx
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем валидность токена при монтировании компонента
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/login', { replace: true });
        return;
      }

      try {
        // Здесь можно добавить проверку токена через API
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          localStorage.removeItem('token');
          navigate('/auth/login', { replace: true });
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/auth/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // Начальная проверка токена
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
