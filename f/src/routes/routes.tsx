// Файл: src/routes/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import LoginForm from '../components/auth/loginForm';
import RegisterForm from '../components/auth/registerForm';
import Layout from '../components/layout/layout';
import ProtectedRoute from '../components/protectedRoute';
import Dashboard from '../pages/Dashboard/dashboard';
import Clients from '../pages/Clients/clients';
import ErrorBoundary from '../components/errorBoundary';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ErrorBoundary><ProtectedRoute /></ErrorBoundary>,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, // используем index вместо path
            element: <Dashboard />,
          },
          {
            path: '/clients',
            element: <Clients />,
          },
        ],
      },
    ],
  },
  {
    path: 'login', // убрал /api
    element: <LoginForm />,
  },
  {
    path: 'register',
    element: <RegisterForm />,
  },
]);
