import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Dispositivo, DispositivoFormData } from '../types';

const DISP_KEY = ['dispositivos'];

export function useDispositivos() {
  return useQuery<Dispositivo[]>({
    queryKey: DISP_KEY,
    queryFn: async () => {
      const { data } = await api.get('/dispositivos');
      return data;
    },
  });
}

export function useDispositivo(id: number) {
  return useQuery<Dispositivo>({
    queryKey: ['dispositivo', id],
    queryFn: async () => {
      const { data } = await api.get(`/dispositivos/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateDispositivo() {
  const qc = useQueryClient();
  return useMutation<Dispositivo, Error, DispositivoFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/dispositivos', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DISP_KEY }),
  });
}

export function useUpdateDispositivo(id: number) {
  const qc = useQueryClient();
  return useMutation<Dispositivo, Error, DispositivoFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/dispositivos/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DISP_KEY }),
  });
}

export function useDeleteDispositivo() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/dispositivos/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DISP_KEY }),
  });
}
