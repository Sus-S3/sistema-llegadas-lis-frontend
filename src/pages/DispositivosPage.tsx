import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispositivos, useDeleteDispositivo } from '../hooks/useDispositivos';
import Layout from '../components/Layout';

export default function DispositivosPage() {
  const { data: dispositivos, isLoading, error } = useDispositivos();
  const deleteMutation = useDeleteDispositivo();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#0d2137', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Dispositivos</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Gestión de dispositivos del sistema
          </p>
        </div>
        <button
          onClick={() => navigate('/dispositivos/nuevo')}
          style={{
            background: 'linear-gradient(135deg, #0d2137, #1a3a5c)',
            color: '#4ecdc4',
            border: '1px solid #4ecdc4',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          + Nuevo dispositivo
        </button>
      </div>

      {error && <ErrorBanner message={(error as Error).message} />}
      {deleteMutation.error && <ErrorBanner message={(deleteMutation.error as Error).message} />}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {!dispositivos || dispositivos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No hay dispositivos registrados.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d2137' }}>
                  {['ID', 'Nombre', 'Laboratorio', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{
                      color: '#4ecdc4',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '14px 16px',
                      textAlign: 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dispositivos.map((disp, i) => (
                  <tr key={disp.id_dispositivos} style={{
                    background: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                  }}>
                    <td style={tdStyle}>{disp.id_dispositivos}</td>
                    <td style={{ ...tdStyle, fontWeight: 500, color: '#0d2137' }}>{disp.nombre}</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle('#dbeafe', '#1e40af')}>
                        {disp.laboratorio?.nombre ?? `Lab #${disp.laboratorio_id}`}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(
                        disp.estado_id === 1 ? '#d1fae5' : '#fee2e2',
                        disp.estado_id === 1 ? '#065f46' : '#991b1b'
                      )}>
                        {disp.estado?.nombre ?? (disp.estado_id === 1 ? 'Activo' : 'Inactivo')}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {confirmId === disp.id_dispositivos ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>¿Confirmar?</span>
                          <button
                            onClick={() => handleDelete(disp.id_dispositivos)}
                            disabled={deletingId === disp.id_dispositivos}
                            style={actionBtn('#dc2626', '#ffffff')}
                          >
                            {deletingId === disp.id_dispositivos ? '...' : 'Sí'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            style={actionBtn('#e2e8f0', '#374151')}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => navigate(`/dispositivos/${disp.id_dispositivos}/editar`)}
                            style={actionBtn('#4ecdc4', '#0d2137')}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmId(disp.id_dispositivos)}
                            style={actionBtn('#fee2e2', '#dc2626')}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
  background: bg,
  color,
  padding: '3px 10px',
  borderRadius: '999px',
  fontSize: '0.78rem',
  fontWeight: 500,
});

const actionBtn = (bg: string, color: string): React.CSSProperties => ({
  background: bg,
  color,
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 500,
});

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      background: '#fee2e2',
      border: '1px solid #fca5a5',
      color: '#991b1b',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.88rem',
    }}>
      {message}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #4ecdc4',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
