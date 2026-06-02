import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAsistencia } from '../hooks/useAsistencia';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import LectorNFC from '../components/LectorNFC';
import api from '../lib/api';
import { ClipboardList, Search, FileDown } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

const formatFechaHora = (iso: string) => {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${fecha}, ${hora}`;
};

const ESTADO_COLORS: Record<string, { bg: string; color: string }> = {
  'A tiempo': { bg: '#d1fae5', color: '#065f46' },
  'Tarde':    { bg: '#fef3c7', color: '#92400e' },
  'Ausente':  { bg: '#fee2e2', color: '#991b1b' },
};

export default function AsistenciaPage() {
  const { rolId } = useAuth();
  const [fecha, setFecha] = useState(today());
  const [usuarioId, setUsuarioId] = useState<number | undefined>(undefined);
  const [filtrosActivos, setFiltrosActivos] = useState<{ fecha: string; usuario_id?: number }>({ fecha: today() });
  const [downloading, setDownloading] = useState<'excel' | 'pdf' | null>(null);

  const { data: registros, isLoading, error } = useAsistencia(filtrosActivos);
  const { data: usuarios } = useUsers();

  const isAdmin = rolId === 6;
  const queryClient = useQueryClient();

  const handleRegistroExitoso = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['asistencia'] });
  }, [queryClient]);

  const aplicarFiltros = () => {
    setFiltrosActivos({ fecha, usuario_id: usuarioId });
  };

  const handleDownload = async (formato: 'excel' | 'pdf') => {
    setDownloading(formato);
    try {
      const params: Record<string, string> = {};
      if (filtrosActivos.fecha) {
        params.fecha_inicio = filtrosActivos.fecha;
        params.fecha_fin    = filtrosActivos.fecha;
      }
      if (filtrosActivos.usuario_id) {
        params.usuario_id = String(filtrosActivos.usuario_id);
      }
      const endpoint = formato === 'excel'
        ? '/reportes/asistencia/excel'
        : '/reportes/asistencia/pdf';
      const response = await api.get(endpoint, { params, responseType: 'blob' });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = formato === 'excel' ? 'asistencia.xlsx' : 'asistencia.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // el interceptor de api ya normaliza el error; no hay estado de error específico para descarga
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title"><ClipboardList size={22} /> Asistencia</h1>
          <p className="page-subtitle">Registro de llegadas y salidas</p>
        </div>
      </div>

      {/* Lector NFC — solo admin */}
      {isAdmin && <LectorNFC onRegistroExitoso={handleRegistroExitoso} />}

      {/* Filtros */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
      }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: '5px' }}>
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="form-input"
            style={{ width: '170px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: '5px' }}>
            Usuario
          </label>
          <select
            value={usuarioId ?? ''}
            onChange={(e) => setUsuarioId(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
            className="form-input"
            style={{ width: '220px' }}
          >
            <option value="">Todos los usuarios</option>
            {usuarios?.map((u) => (
              <option key={u.id_usuarios} value={u.id_usuarios}>{u.nombre}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary" onClick={aplicarFiltros} style={{ marginBottom: '1px' }}>
          <Search size={15} /> Filtrar
        </button>

        {isAdmin && (
          <>
            <button
              className="btn-secondary"
              onClick={() => handleDownload('excel')}
              disabled={downloading !== null}
              style={{ marginBottom: '1px' }}
            >
              <FileDown size={15} />
              {downloading === 'excel' ? 'Descargando...' : 'Descargar Excel'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleDownload('pdf')}
              disabled={downloading !== null}
              style={{ marginBottom: '1px' }}
            >
              <FileDown size={15} />
              {downloading === 'pdf' ? 'Descargando...' : 'Descargar PDF'}
            </button>
          </>
        )}
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !registros || registros.length === 0 ? (
        <div className="empty-state">No hay registros para los filtros seleccionados.</div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d2137' }}>
                {['Fecha y hora', 'Usuario', 'Tarjeta UID', 'Estado'].map((h) => (
                  <th key={h} style={{
                    color: '#5bc8c0',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '13px 16px',
                    textAlign: 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((r, i) => {
                const estadoNombre = r.estado?.nombre ?? '';
                const estadoColors = ESTADO_COLORS[estadoNombre] ?? { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <tr key={r.id_asistencia} style={{
                    background: i % 2 === 0 ? '#fff' : '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 500, color: '#0d2137', fontSize: '0.88rem' }}>
                        {formatFechaHora(r.fecha_hora)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: '#0d2137', fontSize: '0.88rem', margin: 0 }}>
                        {r.usuario?.nombre ?? `Usuario #${r.usuario_id}`}
                      </p>
                      {r.usuario?.correo && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          {r.usuario.correo}
                        </p>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#374151', letterSpacing: '0.03em' }}>
                        {r.tarjeta?.uid_nfc ?? '—'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span className="badge" style={{ background: estadoColors.bg, color: estadoColors.color }}>
                        {estadoNombre || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '0.88rem',
  color: '#374151',
};
