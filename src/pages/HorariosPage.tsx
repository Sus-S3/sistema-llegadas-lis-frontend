import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHorarios, useDeleteHorario } from '../hooks/useHorarios';
import Layout from '../components/Layout';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#d1fae5', color: '#065f46' },
  2: { bg: '#fee2e2', color: '#991b1b' },
};

const DIA_LABEL: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '0.88rem',
  color: '#374151',
};

export default function HorariosPage() {
  const { data: horarios, isLoading, error } = useHorarios();
  const deleteMutation = useDeleteHorario();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Calendar size={22} /> Horarios</h1>
          <p className="page-subtitle">Gestión de horarios de acceso al laboratorio</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/horarios/nuevo')}>
          <Plus size={15} /> Nuevo horario
        </button>
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}
      {deleteMutation.error && <div className="alert-error">{(deleteMutation.error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !horarios || horarios.length === 0 ? (
        <div className="empty-state">No hay horarios registrados.</div>
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
                {['Usuario', 'Laboratorio', 'Día', 'Hora inicio', 'Hora fin', 'Estado', ''].map((h, i) => (
                  <th key={i} style={{
                    color: '#5bc8c0',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '13px 16px',
                    textAlign: h === '' ? 'right' : 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map((h, i) => {
                const statusColors = STATUS_COLORS[h.estado_id] ?? { bg: '#fef3c7', color: '#92400e' };
                const statusName = h.estado?.nombre ?? (h.estado_id === 1 ? 'Activo' : 'Inactivo');
                const usuarioNombre = h.usuario?.nombre ?? `Usuario #${h.usuario_id}`;
                const labNombre = h.laboratorio?.nombre ?? `Lab #${h.laboratorio_id}`;
                const diaLabel = DIA_LABEL[h.dia_semana] ?? h.dia_semana;

                return (
                  <tr key={h.id_horarios} style={{
                    background: i % 2 === 0 ? '#fff' : '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: '#0d2137', fontSize: '0.88rem', margin: 0 }}>{usuarioNombre}</p>
                      {h.usuario?.correo && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{h.usuario.correo}</p>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span className="badge" style={{ background: '#e0f7f5', color: '#2a7d7b' }}>{labNombre}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 500, color: '#374151' }}>{diaLabel}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{h.hora_inicio}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{h.hora_fin}</span>
                    </td>
                    <td style={tdStyle}>
                      <span className="badge" style={{ background: statusColors.bg, color: statusColors.color }}>{statusName}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {confirmId === h.id_horarios ? (
                        <div className="confirm-row" style={{ justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                          <button className="btn-confirm-yes" onClick={() => handleDelete(h.id_horarios)} disabled={deletingId === h.id_horarios}>
                            {deletingId === h.id_horarios ? '...' : 'Sí'}
                          </button>
                          <button className="btn-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn-icon edit" onClick={() => navigate(`/horarios/${h.id_horarios}/editar`)} title="Editar">
                            <Pencil size={15} />
                          </button>
                          <button className="btn-icon delete" onClick={() => setConfirmId(h.id_horarios)} title="Eliminar">
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
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
