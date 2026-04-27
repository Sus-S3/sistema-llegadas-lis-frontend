import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { useEstados } from '../hooks/useEstados';
import Layout from '../components/Layout';
import type { UserFormData } from '../types';

const ROLES = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Auxiliar administrativo' },
  { id: 3, nombre: 'Auxiliar de programación' },
];


const initialForm: UserFormData = {
  nombre: '',
  correo: '',
  rol_id: 1,
  estado_id: 1,
};

export default function UserFormPage() {
  const { id } = useParams<{ id?: string }>();
  const userId = id ? parseInt(id, 10) : 0;
  const isEdit = userId > 0;

  const navigate = useNavigate();
  const { data: existingUser, isLoading: loadingUser, error: loadError } = useUser(userId);
  const { data: estados, isLoading: loadingEstados } = useEstados();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(userId);

  const [form, setForm] = useState<UserFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!existingUser) return;
    setForm({
      nombre: existingUser.nombre,
      correo: existingUser.correo,
      rol_id: existingUser.rol_id ?? existingUser.rol?.id ?? 1,
      estado_id: existingUser.estado_id ?? existingUser.estado?.id ?? 1,
    });
  }, [existingUser]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!isEdit) {
      if (!form.correo.trim()) {
        newErrors.correo = 'El correo es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
        newErrors.correo = 'Ingresa un correo válido';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'rol_id' || name === 'estado_id' ? parseInt(value, 10) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          nombre: form.nombre,
          rol_id: form.rol_id,
          estado_id: form.estado_id,
        });
      } else {
        await createMutation.mutateAsync(form);
      }
      navigate('/usuarios');
    } catch (err) {
      setSubmitError((err as Error).message || 'Error al guardar');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingUser) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid #e2e8f0', borderTop: '3px solid #4ecdc4',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  if (isEdit && loadError) {
    return (
      <Layout>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5',
            color: '#991b1b', padding: '16px', borderRadius: '8px',
          }}>
            No se pudo cargar el usuario: {(loadError as Error).message}
          </div>
          <button
            onClick={() => navigate('/usuarios')}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            ← Volver a usuarios
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/usuarios')}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', fontSize: '0.88rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
          }}
        >
          ← Volver a usuarios
        </button>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            background: '#0d2137',
            padding: '1.5rem 2rem',
            borderBottom: '3px solid #4ecdc4',
          }}>
            <h1 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
              {isEdit ? `Modificando usuario #${userId}` : 'Completa los campos para registrar un usuario'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            {submitError && (
              <div style={{
                background: '#fee2e2', border: '1px solid #fca5a5',
                color: '#991b1b', padding: '12px 16px', borderRadius: '8px',
                marginBottom: '1.5rem', fontSize: '0.88rem',
              }}>
                {submitError}
              </div>
            )}

            <Field label="Nombre" error={errors.nombre}>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
                style={inputStyle(!!errors.nombre)}
              />
            </Field>

            <Field label="Correo electrónico" error={errors.correo}>
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="correo@institucion.edu"
                readOnly={isEdit}
                style={{
                  ...inputStyle(!!errors.correo),
                  ...(isEdit ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' } : {}),
                }}
              />
            </Field>

            <Field label="Rol">
              <select
                name="rol_id"
                value={form.rol_id}
                onChange={handleChange}
                style={inputStyle(false)}
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </Field>

            <Field label="Estado">
              <select
                name="estado_id"
                value={form.estado_id}
                onChange={handleChange}
                disabled={loadingEstados}
                style={inputStyle(false)}
              >
                {estados?.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </Field>

            <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  flex: 1,
                  background: isPending ? '#94a3b8' : 'linear-gradient(135deg, #0d2137, #1a3a5c)',
                  color: '#4ecdc4',
                  border: '1px solid #4ecdc4',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/usuarios')}
                style={{
                  background: '#f1f5f9',
                  color: '#374151',
                  border: '1px solid #e2e8f0',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', color: '#374151', fontWeight: 500, fontSize: '0.88rem', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: '#dc2626', fontSize: '0.78rem', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${hasError ? '#fca5a5' : '#d1d5db'}`,
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: '#374151',
  background: '#f9fafb',
  outline: 'none',
  boxSizing: 'border-box',
});
