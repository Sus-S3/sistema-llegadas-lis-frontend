import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Justificacion, JustificacionFormData, RevisarJustificacionPayload } from '../types';

const JUST_KEY = ['justificaciones'];

export function useJustificaciones() {
  return useQuery<Justificacion[]>({
    queryKey: JUST_KEY,
    queryFn: async () => {
      const { data } = await api.get('/justificaciones');
      return data;
    },
  });
}

export function useJustificacion(id: number) {
  return useQuery<Justificacion>({
    queryKey: ['justificacion', id],
    queryFn: async () => {
      const { data } = await api.get(`/justificaciones/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateJustificacion() {
  const qc = useQueryClient();
  return useMutation<Justificacion, Error, JustificacionFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/justificaciones', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: JUST_KEY }),
  });
}

export function useRevisarJustificacion(id: number) {
  const qc = useQueryClient();
  return useMutation<Justificacion, Error, RevisarJustificacionPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/justificaciones/${id}/revisar`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: JUST_KEY }),
  });
}

export function useDeleteJustificacion() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/justificaciones/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: JUST_KEY }),
  });
}
