import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/loginForm';
import Layout from '../components/layout/layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import Dashboard from '../pages/Dashboard/dashboard';

export const router = createBrowserRouter([
      {
        path: "/login",
        element: <LoginForm />,
      },

      {
        path: "/",
        element: <ProtectedRoute><Layout /></ProtectedRoute>,
        children: [
          {
          path: "",
          element: <Navigate to="/dashboard" replace />
        },

        {
          path: "dashboard",
          element: <Dashboard /> 
        },

        ]
      }
]);