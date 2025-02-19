// src/config/api.ts
import axios from 'axios';
import { Api } from './api.types';

const api: Api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Более детальное логирование запросов
api.interceptors.request.use(request => {
  console.log('Starting Request', {
  url: request.url,
  baseURL: request.baseURL,
  method: request.method,
  headers: request.headers
  });
  return request;
});

// api.interceptors.request.use(request => {
// const token = localStorage.getItem('token');
// if (token) {
//   request.headers['Authorization'] = `Bearer ${token}`;
// }
// return request
// });

// Более информативное логирование ответов
api.interceptors.response.use(
  response => {
    console.log('Response:', { 
    status: response.data,
    data: response.data,
    url: response.config.url
    });
    return response;
  },


  error => {
    console.error('Request Error:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export default api;