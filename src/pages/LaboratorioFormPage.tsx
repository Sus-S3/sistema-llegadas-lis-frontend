import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
    return <Layout><div className="spinner-container"><div className="spinner" /></div></Layout>;
  }

  if (isEdit && loadError) {
    return (
      <Layout>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="alert-error">No se pudo cargar el laboratorio: {(loadError as Error).message}</div>
          <button className="btn-secondary" onClick={() => navigate('/laboratorios')}>← Volver</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/laboratorios">Laboratorios</Link>
        <span style={{ color: '#cbd5e0' }}>/</span>
        <span>{isEdit ? `Editar #${labId}` : 'Nuevo laboratorio'}</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'Editar laboratorio' : 'Nuevo laboratorio'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '4px' }}>
            {isEdit ? `Modificando laboratorio #${labId}` : 'Completa los campos para registrar un laboratorio'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {submitError && <div className="alert-error">{submitError}</div>}

          <div className="form-field">
            <label className="form-label">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del laboratorio"
              className={`form-input${errors.nombre ? ' has-error' : ''}`}
            />
            {errors.nombre && <p className="form-error">{errors.nombre}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Ubicación</label>
            <input
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              placeholder="Ej: Edificio A, Piso 2"
              className={`form-input${errors.ubicacion ? ' has-error' : ''}`}
            />
            {errors.ubicacion && <p className="form-error">{errors.ubicacion}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Estado</label>
            <select name="estado_id" value={form.estado_id} onChange={handleChange} disabled={loadingEstados} className="form-input">
              {estados?.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear laboratorio'}
            </button>
            <button type="button" onClick={() => navigate('/laboratorios')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
