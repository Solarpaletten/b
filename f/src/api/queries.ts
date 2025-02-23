import { useQuery } from '@tanstack/react-query';
import { api } from './axios';

export const useTestQuery = () => {
  return useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      const { data } = await api.get('api/test');
      return data;
    },
  });
};
