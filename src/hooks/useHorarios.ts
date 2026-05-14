import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Horario, HorarioFormData } from '../types';

const HORARIOS_KEY = ['horarios'];

export function useHorarios() {
  return useQuery<Horario[]>({
    queryKey: HORARIOS_KEY,
    queryFn: async () => {
      const { data } = await api.get('/horarios');
      return data;
    },
  });
}

export function useHorario(id: number) {
  return useQuery<Horario>({
    queryKey: ['horario', id],
    queryFn: async () => {
      const { data } = await api.get(`/horarios/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateHorario() {
  const qc = useQueryClient();
  return useMutation<Horario, Error, HorarioFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/horarios', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HORARIOS_KEY }),
  });
}

export function useUpdateHorario(id: number) {
  const qc = useQueryClient();
  return useMutation<Horario, Error, HorarioFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/horarios/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HORARIOS_KEY }),
  });
}

export function useDeleteHorario() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/horarios/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HORARIOS_KEY }),
  });
}
