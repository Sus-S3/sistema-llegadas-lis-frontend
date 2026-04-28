import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Asistencia } from '../types';

interface FiltrosAsistencia {
  usuario_id?: number;
  fecha?: string;
}

export function useAsistencia(filtros?: FiltrosAsistencia) {
  return useQuery<Asistencia[]>({
    queryKey: ['asistencia', filtros],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filtros?.usuario_id) params.usuario_id = String(filtros.usuario_id);
      if (filtros?.fecha) params.fecha = filtros.fecha;
      const { data } = await api.get('/asistencia', { params });
      return data;
    },
  });
}
