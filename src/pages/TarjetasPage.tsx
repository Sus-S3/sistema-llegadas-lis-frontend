import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarjetas, useDeleteTarjeta } from '../hooks/useTarjetas';
import Layout from '../components/Layout';
import { CreditCard, Plus, Pencil, Trash2, User } from 'lucide-react';

const STATUS_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#d1fae5', color: '#065f46' },
  2: { bg: '#fee2e2', color: '#991b1b' },
};

export default function TarjetasPage() {
  const { data: tarjetas, isLoading, error } = useTarjetas();
  const deleteMutation = useDeleteTarjeta();
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
          <h1 className="page-title"><CreditCard size={22} /> Tarjetas NFC</h1>
          <p className="page-subtitle">Gestión de tarjetas NFC del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/tarjetas/nueva')}>
          <Plus size={15} /> Nueva tarjeta
        </button>
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}
      {deleteMutation.error && <div className="alert-error">{(deleteMutation.error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !tarjetas || tarjetas.length === 0 ? (
        <div className="empty-state">No hay tarjetas NFC registradas.</div>
      ) : (
        <div className="card-grid">
          {tarjetas.map((tarjeta) => {
            const statusColors = STATUS_COLORS[tarjeta.estado_id] ?? { bg: '#fef3c7', color: '#92400e' };
            const statusName = tarjeta.estado?.nombre ?? (tarjeta.estado_id === 1 ? 'Activo' : 'Inactivo');
            const usuarioNombre = tarjeta.usuario?.nombre ?? null;

            return (
              <div key={tarjeta.id_tarjeta} className="card">
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #5bc8c0, #0d2137)' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '0.875rem' }}>
                    <div style={{
                      width: '44px', height: '44px', flexShrink: 0,
                      background: '#e0f7f5', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#2a7d7b',
                    }}>
                      <CreditCard size={20} strokeWidth={2} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontWeight: 700, color: '#0d2137', fontSize: '0.95rem',
                        fontFamily: 'monospace', letterSpacing: '0.05em',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {tarjeta.uid_nfc}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <User size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.8rem', color: usuarioNombre ? '#374151' : '#94a3b8' }}>
                          {usuarioNombre ?? 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className="badge" style={{ background: statusColors.bg, color: statusColors.color }}>
                    {statusName}
                  </span>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.875rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '2px' }}>
                    {confirmId === tarjeta.id_tarjeta ? (
                      <div className="confirm-row">
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                        <button className="btn-confirm-yes" onClick={() => handleDelete(tarjeta.id_tarjeta)} disabled={deletingId === tarjeta.id_tarjeta}>
                          {deletingId === tarjeta.id_tarjeta ? '...' : 'Sí'}
                        </button>
                        <button className="btn-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className="btn-icon edit" onClick={() => navigate(`/tarjetas/editar/${tarjeta.id_tarjeta}`)} title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon delete" onClick={() => setConfirmId(tarjeta.id_tarjeta)} title="Eliminar">
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
