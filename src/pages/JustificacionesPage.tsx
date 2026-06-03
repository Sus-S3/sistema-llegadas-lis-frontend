import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2, ClipboardCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { useJustificaciones, useDeleteJustificacion, useRevisarJustificacion } from '../hooks/useJustificaciones';
import { useEstados } from '../hooks/useEstados';
import { useAuth } from '../contexts/AuthContext';
import { getTokenPayload } from '../lib/auth';

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  Pendiente:  { bg: '#fef3c7', color: '#92400e' },
  Aprobada:   { bg: '#d1fae5', color: '#065f46' },
  Rechazada:  { bg: '#fee2e2', color: '#991b1b' },
};

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const formatFechaHora = (iso: string) => {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${fecha}, ${hora}`;
};

function RevisarConfirm({ id, onDone }: { id: number; onDone: () => void }) {
  const revisar = useRevisarJustificacion(id);
  const { data: estados } = useEstados();

  const payload = getTokenPayload();
  const revisado_por_id = parseInt(payload?.sub ?? '0', 10);

  const handle = async (nombreEstado: 'Aprobada' | 'Rechazada') => {
    const estadoObj = estados?.find((e) => e.nombre === nombreEstado && e.categoria_estado_id === 3);
    if (!estadoObj) return;
    try {
      await revisar.mutateAsync({ estado_id: estadoObj.id_estados, revisado_por_id });
    } finally {
      onDone();
    }
  };

  const ready = !!estados && revisado_por_id > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Revisar:</span>
      <button
        className="btn-confirm-yes"
        onClick={() => handle('Aprobada')}
        disabled={revisar.isPending || !ready}
      >
        {revisar.isPending ? '...' : 'Aprobar'}
      </button>
      <button
        className="btn-confirm-no"
        onClick={() => handle('Rechazada')}
        disabled={revisar.isPending || !ready}
        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
      >
        {revisar.isPending ? '...' : 'Rechazar'}
      </button>
      <button className="btn-confirm-no" onClick={onDone} disabled={revisar.isPending}>
        Cancelar
      </button>
    </div>
  );
}

export default function JustificacionesPage() {
  const { rolId } = useAuth();
  const payload = getTokenPayload();
  const miId = parseInt(payload?.sub ?? '0', 10);
  const isAdmin = rolId === 6;

  const { data: rawJustificaciones, isLoading, error } = useJustificaciones();
  const deleteMutation = useDeleteJustificacion();
  const navigate = useNavigate();

  const justificaciones = isAdmin
    ? (rawJustificaciones ?? [])
    : (rawJustificaciones ?? []).filter(j => j.usuario_id === miId);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [revisarId, setRevisarId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title"><FileText size={22} /> Justificaciones</h1>
          <p className="page-subtitle">Solicitudes de justificación de asistencia</p>
        </div>
        {!isAdmin && (
          <button className="btn-primary" onClick={() => navigate('/justificaciones/nueva')}>
            <Plus size={15} /> Nueva justificación
          </button>
        )}
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}
      {deleteMutation.error && <div className="alert-error">{(deleteMutation.error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !justificaciones || justificaciones.length === 0 ? (
        <div className="empty-state">No hay justificaciones registradas.</div>
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
                {['Usuario', 'Motivo', 'Asistencia', 'Estado', 'Fecha solicitud', 'Acciones'].map((h) => (
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
              {justificaciones.map((j, i) => {
                const estadoNombre = j.estado?.nombre ?? '';
                const estadoBadge = ESTADO_BADGE[estadoNombre] ?? { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <tr key={j.id_justificacion} style={{
                    background: i % 2 === 0 ? '#fff' : '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: '#0d2137', fontSize: '0.88rem', margin: 0 }}>
                        {j.usuario?.nombre ?? `Usuario #${j.usuario_id}`}
                      </p>
                      {j.usuario?.correo && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          {j.usuario.correo}
                        </p>
                      )}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '220px' }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }} title={j.motivo}>
                        {j.motivo}
                      </p>
                    </td>
                    <td style={tdStyle}>
                      {j.asistencia ? (
                        <div>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: '#0d2137', fontWeight: 500 }}>
                            {formatFechaHora(j.asistencia.fecha_hora)}
                          </p>
                          {j.asistencia.clasificacion && (
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                              {j.asistencia.clasificacion}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          #{j.asistencia_id}
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span className="badge" style={{ background: estadoBadge.bg, color: estadoBadge.color }}>
                        {estadoNombre}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.88rem', color: '#374151' }}>
                        {formatFecha(j.fecha_solicitud)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      {confirmDeleteId === j.id_justificacion ? (
                        <div className="confirm-row">
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                          <button
                            className="btn-confirm-yes"
                            onClick={() => handleDelete(j.id_justificacion)}
                            disabled={deletingId === j.id_justificacion}
                          >
                            {deletingId === j.id_justificacion ? '...' : 'Sí'}
                          </button>
                          <button className="btn-confirm-no" onClick={() => setConfirmDeleteId(null)}>
                            No
                          </button>
                        </div>
                      ) : revisarId === j.id_justificacion ? (
                        <RevisarConfirm
                          id={j.id_justificacion}
                          onDone={() => setRevisarId(null)}
                        />
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {estadoNombre === 'Pendiente' && (
                            <button
                              className="btn-icon edit"
                              title="Revisar"
                              onClick={() => setRevisarId(j.id_justificacion)}
                            >
                              <ClipboardCheck size={15} />
                            </button>
                          )}
                          <button
                            className="btn-icon delete"
                            title="Eliminar"
                            onClick={() => setConfirmDeleteId(j.id_justificacion)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '0.88rem',
  color: '#374151',
};
