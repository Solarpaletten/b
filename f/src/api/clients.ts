// /f/src/api/clients.ts
import axios from 'axios';

export const getClients = async () => {
  const response = await axios.get('http://localhost:4000/api/clients', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data;
};
export const createClient = async (clientData: any) => {
  const response = await axios.post(
    'http://localhost:4000/api/clients',
    clientData,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }
  );
  return response.data;
};

export const updateClient = async (id: number, clientData: any) => {
  const response = await axios.put(
    `http://localhost:4000/api/clients/${id}`,
    clientData,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }
  );
  return response.data;
};

export const deleteClient = async (id: number) => {
  const response = await axios.delete(
    `http://localhost:4000/api/clients/${id}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }
  );
  return response.data;
};

export const copyClient = async (id: number) => {
  const response = await axios.post(
    `http://localhost:4000/api/clients/${id}/copy`,
    {},
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }
  );
  return response.data;
};