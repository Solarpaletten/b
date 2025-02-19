// src/components/auth/loginForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api'
import { AxiosError } from 'axios'; 


const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Проверка статуса БД при загрузке формы
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await api.get('/health');
        console.log('Database status', response.data);
        setDbStatus(response.data);
      } catch (err) {
        const error = err as AxiosError;
        console.error('Database error:',{
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
        });
        setDbStatus({ 
          status: 'error',
          error: error.message || 'Failed to connect to database'
      });
    }
  };
    checkDatabase();
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email});
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data); 
      

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;


   
    
    
      console.error('Login error details', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  });
  setError(error.response?.data?.message || 'Login failed. Please try again.');
 } finally {
   setIsLoading(false);
 }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {/* Статус базы данных */}
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-medium text-gray-900">Database Status:</h3>
            {dbStatus ? (
              <div className="mt-2 text-sm text-gray-600">
                <p>Status: {dbStatus.status}</p>
                {dbStatus.timestamp && (
                  <p>Last Check: {new Date(dbStatus.timestamp).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Checking database status...</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;