import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Role } from '../types';

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await api.get('/roles');
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
