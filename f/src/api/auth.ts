import { api } from './axios';

export const loginRequest = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};
