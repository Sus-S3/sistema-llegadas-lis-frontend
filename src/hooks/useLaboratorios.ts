import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Laboratorio, LaboratorioFormData } from '../types';

const LAB_KEY = ['laboratorios'];

export function useLaboratorios() {
  return useQuery<Laboratorio[]>({
    queryKey: LAB_KEY,
    queryFn: async () => {
      const { data } = await api.get('/laboratorios');
      return data;
    },
  });
}

export function useLaboratorio(id: number) {
  return useQuery<Laboratorio>({
    queryKey: ['laboratorio', id],
    queryFn: async () => {
      const { data } = await api.get(`/laboratorios/${id}`);
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateLaboratorio() {
  const qc = useQueryClient();
  return useMutation<Laboratorio, Error, LaboratorioFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/laboratorios', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: LAB_KEY }),
  });
}

export function useUpdateLaboratorio(id: number) {
  const qc = useQueryClient();
  return useMutation<Laboratorio, Error, LaboratorioFormData>({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/laboratorios/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: LAB_KEY }),
  });
}

export function useDeleteLaboratorio() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/laboratorios/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: LAB_KEY }),
  });
}
