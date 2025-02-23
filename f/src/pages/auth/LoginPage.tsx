import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../api/auth';
import { LoginForm } from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (formEmail: string, formPassword: string) => {
    setIsLoading(true);
    try {
      const response = await loginRequest(formEmail, formPassword);
      console.log('Login response:', response);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userEmail', response.user.email);
      navigate('/dashboard');
    } catch (err: any) {
      // Явно указываем тип или используем более конкретный тип, например Error
      console.error('Login failed:', err);
      setError('Login failed: ' + (err.message || 'Unknown error'));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">SOLAR</h1>
        <LoginForm onLogin={handleLogin} isLoading={isLoading} />
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
