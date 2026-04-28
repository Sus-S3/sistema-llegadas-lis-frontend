import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispositivos, useDeleteDispositivo } from '../hooks/useDispositivos';
import Layout from '../components/Layout';
import { Smartphone, Plus, Pencil, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#d1fae5', color: '#065f46' },
  2: { bg: '#fee2e2', color: '#991b1b' },
};

export default function DispositivosPage() {
  const { data: dispositivos, isLoading, error } = useDispositivos();
  const deleteMutation = useDeleteDispositivo();
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
          <h1 className="page-title"><Smartphone size={22} /> Dispositivos</h1>
          <p className="page-subtitle">Gestión de dispositivos del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dispositivos/nuevo')}>
          <Plus size={15} /> Nuevo dispositivo
        </button>
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}
      {deleteMutation.error && <div className="alert-error">{(deleteMutation.error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !dispositivos || dispositivos.length === 0 ? (
        <div className="empty-state">No hay dispositivos registrados.</div>
      ) : (
        <div className="card-grid">
          {dispositivos.map((disp) => {
            const statusColors = STATUS_COLORS[disp.estado_id] ?? { bg: '#fef3c7', color: '#92400e' };
            const statusName = disp.estado?.nombre ?? (disp.estado_id === 1 ? 'Activo' : 'Inactivo');
            const labName = disp.laboratorio?.nombre ?? `Lab #${disp.laboratorio_id}`;

            return (
              <div key={disp.id_dispositivos} className="card">
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #5bc8c0, #f5a623)' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '0.875rem' }}>
                    <div style={{
                      width: '44px', height: '44px', flexShrink: 0,
                      background: '#e0f7f5', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#2a7d7b',
                    }}>
                      <Smartphone size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0d2137', fontSize: '0.92rem' }}>{disp.nombre}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                        ID #{disp.id_dispositivos}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: '#e0f7f5', color: '#2a7d7b' }}>{labName}</span>
                    <span className="badge" style={{ background: statusColors.bg, color: statusColors.color }}>{statusName}</span>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.875rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '2px' }}>
                    {confirmId === disp.id_dispositivos ? (
                      <div className="confirm-row">
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                        <button className="btn-confirm-yes" onClick={() => handleDelete(disp.id_dispositivos)} disabled={deletingId === disp.id_dispositivos}>
                          {deletingId === disp.id_dispositivos ? '...' : 'Sí'}
                        </button>
                        <button className="btn-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className="btn-icon edit" onClick={() => navigate(`/dispositivos/${disp.id_dispositivos}/editar`)} title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon delete" onClick={() => setConfirmId(disp.id_dispositivos)} title="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
