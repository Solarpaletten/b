// Файл: src/routes/routes.tsx
import { createBrowserRouter, Outlet } from 'react-router-dom';
import LoginForm from '../components/auth/loginForm';
import RegisterForm from '../components/auth/registerForm';
import ErrorBoundary from '../components/errorBoundary';
import Layout from '../components/layout/layout';
import ProtectedRoute from '../components/protectedRoute';
import Clients from '../pages/Clients/clients';
import Dashboard from '../pages/Dashboard/dashboard';

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    children: [
      {
        element: <Layout>
          <Outlet />
        </Layout>,
        children: [
          { 
            index: true,
            element: <Dashboard /> 
          },
          { 
            path: 'clients', 
            element: <Clients /> 
          },
        ],
      },
    ],
  },
  { 
    path: 'login',
    element: <LoginForm /> 
  },
  { 
    path: 'register',
    element: <RegisterForm /> 
  },
]);
