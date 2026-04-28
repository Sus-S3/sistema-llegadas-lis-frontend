import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispositivo, useCreateDispositivo, useUpdateDispositivo } from '../hooks/useDispositivos';
import { useLaboratorios } from '../hooks/useLaboratorios';
import { useEstados } from '../hooks/useEstados';
import Layout from '../components/Layout';
import type { DispositivoFormData } from '../types';

const initialForm: DispositivoFormData = {
  nombre: '',
  laboratorio_id: 0,
  estado_id: 1,
};

export default function DispositivoFormPage() {
  const { id } = useParams<{ id?: string }>();
  const dispId = id ? parseInt(id, 10) : 0;
  const isEdit = dispId > 0;

  const navigate = useNavigate();
  const { data: existing, isLoading: loadingDisp, error: loadError } = useDispositivo(dispId);
  const { data: laboratorios, isLoading: loadingLabs } = useLaboratorios();
  const { data: estados, isLoading: loadingEstados } = useEstados();
  const createMutation = useCreateDispositivo();
  const updateMutation = useUpdateDispositivo(dispId);

  const [form, setForm] = useState<DispositivoFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof DispositivoFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setForm({
      nombre: existing.nombre,
      laboratorio_id: existing.laboratorio_id ?? existing.laboratorio?.id ?? 0,
      estado_id: existing.estado_id ?? existing.estado?.id ?? 1,
    });
  }, [existing]);

  useEffect(() => {
    if (!isEdit && laboratorios && laboratorios.length > 0 && form.laboratorio_id === 0) {
      setForm((prev) => ({ ...prev, laboratorio_id: laboratorios[0].id_laboratorios }));
    }
  }, [laboratorios, isEdit]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DispositivoFormData, string>> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.laboratorio_id) newErrors.laboratorio_id = 'Selecciona un laboratorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'laboratorio_id' || name === 'estado_id' ? parseInt(value, 10) : value,
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
      navigate('/dispositivos');
    } catch (err) {
      setSubmitError((err as Error).message || 'Error al guardar');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingDisp) {
    return <Layout><div className="spinner-container"><div className="spinner" /></div></Layout>;
  }

  if (isEdit && loadError) {
    return (
      <Layout>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="alert-error">No se pudo cargar el dispositivo: {(loadError as Error).message}</div>
          <button className="btn-secondary" onClick={() => navigate('/dispositivos')}>← Volver</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/dispositivos">Dispositivos</Link>
        <span style={{ color: '#cbd5e0' }}>/</span>
        <span>{isEdit ? `Editar #${dispId}` : 'Nuevo dispositivo'}</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'Editar dispositivo' : 'Nuevo dispositivo'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '4px' }}>
            {isEdit ? `Modificando dispositivo #${dispId}` : 'Completa los campos para registrar un dispositivo'}
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
              placeholder="Nombre del dispositivo"
              className={`form-input${errors.nombre ? ' has-error' : ''}`}
            />
            {errors.nombre && <p className="form-error">{errors.nombre}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Laboratorio</label>
            <select
              name="laboratorio_id"
              value={form.laboratorio_id}
              onChange={handleChange}
              disabled={loadingLabs}
              className={`form-input${errors.laboratorio_id ? ' has-error' : ''}`}
            >
              {!laboratorios || laboratorios.length === 0 ? (
                <option value={0}>Sin laboratorios disponibles</option>
              ) : (
                laboratorios.map((lab) => (
                  <option key={lab.id_laboratorios} value={lab.id_laboratorios}>{lab.nombre}</option>
                ))
              )}
            </select>
            {errors.laboratorio_id && <p className="form-error">{errors.laboratorio_id}</p>}
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
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear dispositivo'}
            </button>
            <button type="button" onClick={() => navigate('/dispositivos')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
