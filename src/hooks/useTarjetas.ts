import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Tarjeta, TarjetaFormData } from '../types';

const TARJETAS_KEY = ['tarjetas'];

export function useTarjetas() {
  return useQuery<Tarjeta[]>({
    queryKey: TARJETAS_KEY,
    queryFn: async () => {
      const { data } = await api.get('/tarjetas');
      return data;
    },
  });
}

export function useTarjeta(id: number) {
  return useQuery<Tarjeta>({
    queryKey: ['tarjeta', id],
    queryFn: async () => {
      const { data } = await api.get(`/tarjetas/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateTarjeta() {
  const qc = useQueryClient();
  return useMutation<Tarjeta, Error, TarjetaFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/tarjetas', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TARJETAS_KEY }),
  });
}

export function useUpdateTarjeta(id: number) {
  const qc = useQueryClient();
  return useMutation<Tarjeta, Error, TarjetaFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/tarjetas/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TARJETAS_KEY }),
  });
}

export function useDeleteTarjeta() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/tarjetas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TARJETAS_KEY }),
  });
}
