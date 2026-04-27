import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Estado } from '../types';

export function useEstados() {
  return useQuery<Estado[]>({
    queryKey: ['estados'],
    queryFn: async () => {
      const { data } = await api.get('/estados');
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
