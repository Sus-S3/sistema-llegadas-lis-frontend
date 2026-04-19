import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { User, UserFormData, UserUpdateData } from '../types';

const USERS_KEY = ['users'];

export function useUsers() {
  return useQuery<User[]>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const { data } = await api.get('/usuarios');
      return data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation<User, Error, UserFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/usuarios', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation<User, Error, UserUpdateData>({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/usuarios/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/usuarios/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUser(id: number) {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get(`/usuarios/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}
