// src/config/api.ts
import axios from 'axios';
import { Api } from './api.types';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api: Api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export default api;