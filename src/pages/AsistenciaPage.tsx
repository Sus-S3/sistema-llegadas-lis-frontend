import { useState } from 'react';
import { useAsistencia } from '../hooks/useAsistencia';
import { useUsers } from '../hooks/useUsers';
import Layout from '../components/Layout';
import { ClipboardList, Search } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

const formatFechaHora = (iso: string) => {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${fecha}, ${hora}`;
};

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  Entrada:  { bg: '#d1fae5', color: '#065f46' },
  Salida:   { bg: '#fee2e2', color: '#991b1b' },
  entrada:  { bg: '#d1fae5', color: '#065f46' },
  salida:   { bg: '#fee2e2', color: '#991b1b' },
};

export default function AsistenciaPage() {
  const [fecha, setFecha] = useState(today());
  const [usuarioId, setUsuarioId] = useState<number | undefined>(undefined);
  const [filtrosActivos, setFiltrosActivos] = useState<{ fecha: string; usuario_id?: number }>({ fecha: today() });

  const { data: registros, isLoading, error } = useAsistencia(filtrosActivos);
  const { data: usuarios } = useUsers();

  const aplicarFiltros = () => {
    setFiltrosActivos({ fecha, usuario_id: usuarioId });
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title"><ClipboardList size={22} /> Asistencia</h1>
          <p className="page-subtitle">Registro de llegadas y salidas</p>
        </div>
      </div>

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
                {['Fecha y hora', 'Usuario', 'Tarjeta UID', 'Tipo'].map((h) => (
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
                const tipoColors = TIPO_COLORS[r.tipo] ?? { bg: '#e0f7f5', color: '#2a7d7b' };
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
                        {r.tarjeta?.uid_nfc ?? `#${r.tarjeta_id}`}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span className="badge" style={{ background: tipoColors.bg, color: tipoColors.color }}>
                        {r.tipo}
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
