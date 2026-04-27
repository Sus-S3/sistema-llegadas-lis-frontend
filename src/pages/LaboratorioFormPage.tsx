import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLaboratorio, useCreateLaboratorio, useUpdateLaboratorio } from '../hooks/useLaboratorios';
import { useEstados } from '../hooks/useEstados';
import Layout from '../components/Layout';
import type { LaboratorioFormData } from '../types';

const initialForm: LaboratorioFormData = {
  nombre: '',
  ubicacion: '',
  estado_id: 1,
};

export default function LaboratorioFormPage() {
  const { id } = useParams<{ id?: string }>();
  const labId = id ? parseInt(id, 10) : 0;
  const isEdit = labId > 0;

  const navigate = useNavigate();
  const { data: existing, isLoading: loadingLab, error: loadError } = useLaboratorio(labId);
  const { data: estados, isLoading: loadingEstados } = useEstados();
  const createMutation = useCreateLaboratorio();
  const updateMutation = useUpdateLaboratorio(labId);

  const [form, setForm] = useState<LaboratorioFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof LaboratorioFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setForm({
      nombre: existing.nombre,
      ubicacion: existing.ubicacion,
      estado_id: existing.estado_id ?? existing.estado?.id ?? 1,
    });
  }, [existing]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LaboratorioFormData, string>> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.ubicacion.trim()) newErrors.ubicacion = 'La ubicación es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'estado_id' ? parseInt(value, 10) : value,
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
        await updateMutation.mutateAsync(form);
      } else {
        await createMutation.mutateAsync(form);
      }
      navigate('/laboratorios');
    } catch (err) {
      setSubmitError((err as Error).message || 'Error al guardar');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingLab) {
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
            No se pudo cargar el laboratorio: {(loadError as Error).message}
          </div>
          <button
            onClick={() => navigate('/laboratorios')}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            ← Volver a laboratorios
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/laboratorios')}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', fontSize: '0.88rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
          }}
        >
          ← Volver a laboratorios
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
              {isEdit ? 'Editar laboratorio' : 'Nuevo laboratorio'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
              {isEdit ? `Modificando laboratorio #${labId}` : 'Completa los campos para registrar un laboratorio'}
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
                placeholder="Nombre del laboratorio"
                style={inputStyle(!!errors.nombre)}
              />
            </Field>

            <Field label="Ubicación" error={errors.ubicacion}>
              <input
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Edificio A, Piso 2"
                style={inputStyle(!!errors.ubicacion)}
              />
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
                {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear laboratorio'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/laboratorios')}
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
