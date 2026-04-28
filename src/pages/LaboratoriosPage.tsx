import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaboratorios, useDeleteLaboratorio } from '../hooks/useLaboratorios';
import Layout from '../components/Layout';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#d1fae5', color: '#065f46' },
  2: { bg: '#fee2e2', color: '#991b1b' },
};

export default function LaboratoriosPage() {
  const { data: laboratorios, isLoading, error } = useLaboratorios();
  const deleteMutation = useDeleteLaboratorio();
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
          <h1 className="page-title"><Building2 size={22} /> Laboratorios</h1>
          <p className="page-subtitle">Gestión de laboratorios del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/laboratorios/nuevo')}>
          <Plus size={15} /> Nuevo laboratorio
        </button>
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}
      {deleteMutation.error && <div className="alert-error">{(deleteMutation.error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !laboratorios || laboratorios.length === 0 ? (
        <div className="empty-state">No hay laboratorios registrados.</div>
      ) : (
        <div className="card-grid">
          {laboratorios.map((lab) => {
            const statusColors = STATUS_COLORS[lab.estado_id] ?? { bg: '#fef3c7', color: '#92400e' };
            const statusName = lab.estado?.nombre ?? (lab.estado_id === 1 ? 'Activo' : 'Inactivo');

            return (
              <div key={lab.id_laboratorios} className="card">
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #5bc8c0, #2a7d7b)' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '0.875rem' }}>
                    <div style={{
                      width: '44px', height: '44px', flexShrink: 0,
                      background: '#e0f7f5', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#2a7d7b',
                    }}>
                      <Building2 size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0d2137', fontSize: '0.92rem' }}>{lab.nombre}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{lab.ubicacion}</p>
                    </div>
                  </div>

                  <span className="badge" style={{ background: statusColors.bg, color: statusColors.color }}>{statusName}</span>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.875rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '2px' }}>
                    {confirmId === lab.id_laboratorios ? (
                      <div className="confirm-row">
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                        <button className="btn-confirm-yes" onClick={() => handleDelete(lab.id_laboratorios)} disabled={deletingId === lab.id_laboratorios}>
                          {deletingId === lab.id_laboratorios ? '...' : 'Sí'}
                        </button>
                        <button className="btn-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className="btn-icon edit" onClick={() => navigate(`/laboratorios/${lab.id_laboratorios}/editar`)} title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon delete" onClick={() => setConfirmId(lab.id_laboratorios)} title="Eliminar">
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
