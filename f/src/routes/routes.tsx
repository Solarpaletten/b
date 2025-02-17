import { createBrowserRouter } from 'react-router-dom';
import LoginForm from '../components/auth/loginForm';
import Layout from '../components/layout/layout';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <LoginForm />,
      },
      {
        path: "auth/login",
        element: <LoginForm />,
      }
    ]
  }
]);