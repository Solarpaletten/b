import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import LoginForm from './components/auth/loginForm';
import ProtectedRoute from './components/protectedRoute';
import Dashboard from './pages/Dashboard/dashboard';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
        staleTime: 1000 * 60 * 5,  // 5 минут
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Публичный маршрут */}
          <Route path="/api/login" element={<LoginForm />} />

          {/* Защищённый маршрут */}
          <Route element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
