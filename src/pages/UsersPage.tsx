import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { useRoles } from '../hooks/useRoles';
import Layout from '../components/Layout';
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react';

const ROLE_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#0d2137', color: '#fff' },
  2: { bg: '#e0f7f5', color: '#2a7d7b' },
  3: { bg: '#fef3c7', color: '#92400e' },
};

const STATUS_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#d1fae5', color: '#065f46' },
  2: { bg: '#fee2e2', color: '#991b1b' },
};

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const { data: roles } = useRoles();
  const deleteMutation = useDeleteUser();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const rolesMap = new Map(roles?.map((r) => [r.id_roles, r.nombre]) ?? []);

  const filtered = users?.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
  });

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
          <h1 className="page-title"><Users size={22} /> Usuarios</h1>
          <p className="page-subtitle">Gestión de usuarios del sistema</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => navigate('/usuarios/nuevo')}>
            <Plus size={15} /> Nuevo usuario
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}
      {deleteMutation.error && <div className="alert-error">{(deleteMutation.error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="empty-state">
          {search ? 'Sin resultados para tu búsqueda.' : 'No hay usuarios registrados.'}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((user) => {
            const rolName = user.rol?.nombre ?? rolesMap.get(user.rol_id) ?? `Rol ${user.rol_id}`;
            const rolColors = ROLE_COLORS[user.rol_id] ?? { bg: '#e2e8f0', color: '#374151' };
            const statusColors = STATUS_COLORS[user.estado_id] ?? { bg: '#fef3c7', color: '#92400e' };
            const statusName = user.estado?.nombre ?? (user.estado_id === 1 ? 'Activo' : 'Inactivo');

            return (
              <div key={user.id_usuarios} className="card">
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.875rem' }}>
                    <div style={{
                      width: '46px', height: '46px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #5bc8c0, #2a7d7b)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                    }}>
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#0d2137', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.nombre}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.correo}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                    <span className="badge" style={{ background: rolColors.bg, color: rolColors.color }}>{rolName}</span>
                    <span className="badge" style={{ background: statusColors.bg, color: statusColors.color }}>{statusName}</span>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '2px' }}>
                    {confirmId === user.id_usuarios ? (
                      <div className="confirm-row">
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                        <button className="btn-confirm-yes" onClick={() => handleDelete(user.id_usuarios)} disabled={deletingId === user.id_usuarios}>
                          {deletingId === user.id_usuarios ? '...' : 'Sí'}
                        </button>
                        <button className="btn-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className="btn-icon edit" onClick={() => navigate(`/usuarios/${user.id_usuarios}/editar`)} title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon delete" onClick={() => setConfirmId(user.id_usuarios)} title="Eliminar">
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
