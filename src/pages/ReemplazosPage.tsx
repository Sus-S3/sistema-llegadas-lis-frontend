import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Trash2, ClipboardCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { useReemplazos, useDeleteReemplazo, useRevisarReemplazo } from '../hooks/useReemplazos';
import type { RevisarReemplazoPayload } from '../types';

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  Pendiente:  { bg: '#fef3c7', color: '#92400e' },
  Aprobado:   { bg: '#d1fae5', color: '#065f46' },
  Rechazado:  { bg: '#fee2e2', color: '#991b1b' },
};

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const formatHora = (t: string) => t.slice(0, 5);

function RevisarConfirm({ id, onDone }: { id: number; onDone: () => void }) {
  const revisar = useRevisarReemplazo(id);

  const handle = async (estado: RevisarReemplazoPayload['estado']) => {
    try {
      await revisar.mutateAsync({ estado });
    } finally {
      onDone();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Revisar:</span>
      <button
        className="btn-confirm-yes"
        onClick={() => handle('Aprobado')}
        disabled={revisar.isPending}
      >
        {revisar.isPending ? '...' : 'Aprobar'}
      </button>
      <button
        className="btn-confirm-no"
        onClick={() => handle('Rechazado')}
        disabled={revisar.isPending}
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

export default function ReemplazosPage() {
  const { data: reemplazos, isLoading, error } = useReemplazos();
  const deleteMutation = useDeleteReemplazo();
  const navigate = useNavigate();

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
          <h1 className="page-title"><RefreshCw size={22} /> Reemplazos</h1>
          <p className="page-subtitle">Solicitudes de reemplazo de horario</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/reemplazos/nuevo')}>
          <Plus size={15} /> Nuevo reemplazo
        </button>
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}
      {deleteMutation.error && <div className="alert-error">{(deleteMutation.error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !reemplazos || reemplazos.length === 0 ? (
        <div className="empty-state">No hay solicitudes de reemplazo registradas.</div>
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
                {['Solicitante', 'Reemplazante', 'Horario', 'Motivo', 'Estado', 'Fecha solicitud', 'Acciones'].map((h) => (
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
              {reemplazos.map((r, i) => {
                const estadoNombre = r.estado?.nombre ?? '';
                const estadoBadge = ESTADO_BADGE[estadoNombre] ?? { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <tr key={r.id_reemplazos} style={{
                    background: i % 2 === 0 ? '#fff' : '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: '#0d2137', fontSize: '0.88rem', margin: 0 }}>
                        {r.solicitante?.nombre ?? `Usuario #${r.solicitante_id}`}
                      </p>
                      {r.solicitante?.correo && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          {r.solicitante.correo}
                        </p>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: '#0d2137', fontSize: '0.88rem', margin: 0 }}>
                        {r.reemplazante?.nombre ?? `Usuario #${r.reemplazante_id}`}
                      </p>
                      {r.reemplazante?.correo && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          {r.reemplazante.correo}
                        </p>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {r.horario ? (
                        <div>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: '#0d2137', fontWeight: 500 }}>
                            {r.horario.dia_semana}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                            {formatHora(r.horario.hora_inicio)} – {formatHora(r.horario.hora_fin)}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          #{r.horario_id}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '200px' }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }} title={r.motivo}>
                        {r.motivo}
                      </p>
                    </td>
                    <td style={tdStyle}>
                      <span className="badge" style={{ background: estadoBadge.bg, color: estadoBadge.color }}>
                        {estadoNombre}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.88rem', color: '#374151' }}>
                        {formatFecha(r.fecha_solicitud)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      {confirmDeleteId === r.id_reemplazos ? (
                        <div className="confirm-row">
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                          <button
                            className="btn-confirm-yes"
                            onClick={() => handleDelete(r.id_reemplazos)}
                            disabled={deletingId === r.id_reemplazos}
                          >
                            {deletingId === r.id_reemplazos ? '...' : 'Sí'}
                          </button>
                          <button className="btn-confirm-no" onClick={() => setConfirmDeleteId(null)}>
                            No
                          </button>
                        </div>
                      ) : revisarId === r.id_reemplazos ? (
                        <RevisarConfirm
                          id={r.id_reemplazos}
                          onDone={() => setRevisarId(null)}
                        />
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {estadoNombre === 'Pendiente' && (
                            <button
                              className="btn-icon edit"
                              title="Revisar"
                              onClick={() => setRevisarId(r.id_reemplazos)}
                            >
                              <ClipboardCheck size={15} />
                            </button>
                          )}
                          <button
                            className="btn-icon delete"
                            title="Eliminar"
                            onClick={() => setConfirmDeleteId(r.id_reemplazos)}
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
