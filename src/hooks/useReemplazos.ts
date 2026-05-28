import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Reemplazo, ReemplazoFormData, RevisarReemplazoPayload } from '../types';

const REEMPLAZOS_KEY = ['reemplazos'];

export function useReemplazos() {
  return useQuery<Reemplazo[]>({
    queryKey: REEMPLAZOS_KEY,
    queryFn: async () => {
      const { data } = await api.get('/reemplazos');
      return data;
    },
  });
}

export function useReemplazo(id: number) {
  return useQuery<Reemplazo>({
    queryKey: ['reemplazo', id],
    queryFn: async () => {
      const { data } = await api.get(`/reemplazos/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateReemplazo() {
  const qc = useQueryClient();
  return useMutation<Reemplazo, Error, ReemplazoFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/reemplazos', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: REEMPLAZOS_KEY }),
  });
}

export function useRevisarReemplazo(id: number) {
  const qc = useQueryClient();
  return useMutation<Reemplazo, Error, RevisarReemplazoPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/reemplazos/${id}/revisar`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: REEMPLAZOS_KEY }),
  });
}

export function useDeleteReemplazo() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/reemplazos/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: REEMPLAZOS_KEY }),
  });
}
