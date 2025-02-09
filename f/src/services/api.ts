import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite прокси будет перенаправлять на backend
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Важно для работы с авторизацией
});

// Перехватчик для добавления токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;