import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useHorario, useCreateHorario, useUpdateHorario } from '../hooks/useHorarios';
import { useUsers } from '../hooks/useUsers';
import { useLaboratorios } from '../hooks/useLaboratorios';
import { useEstados } from '../hooks/useEstados';
import Layout from '../components/Layout';
import type { HorarioFormData } from '../types';

const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const initialForm: HorarioFormData = {
  usuario_id: 0,
  laboratorio_id: 0,
  dia_semana: 1,
  hora_inicio: '',
  hora_fin: '',
  estado_id: 1,
};

export default function HorarioFormPage() {
  const { id } = useParams<{ id?: string }>();
  const horarioId = id ? parseInt(id, 10) : 0;
  const isEdit = horarioId > 0;

  const navigate = useNavigate();
  const { data: existing, isLoading: loadingHorario, error: loadError } = useHorario(horarioId);
  const { data: usuarios, isLoading: loadingUsuarios } = useUsers();
  const { data: laboratorios, isLoading: loadingLabs } = useLaboratorios();
  const { data: estados, isLoading: loadingEstados } = useEstados();
  const createMutation = useCreateHorario();
  const updateMutation = useUpdateHorario(horarioId);

  const [form, setForm] = useState<HorarioFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof HorarioFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setForm({
      usuario_id: existing.usuario_id,
      laboratorio_id: existing.laboratorio_id,
      dia_semana: existing.dia_semana,
      hora_inicio: existing.hora_inicio?.slice(0, 5) ?? '',
      hora_fin: existing.hora_fin?.slice(0, 5) ?? '',
      estado_id: Number(existing.estado_id),
    });
  }, [existing]);

  useEffect(() => {
    if (!isEdit && laboratorios && laboratorios.length > 0 && form.laboratorio_id === 0) {
      setForm((prev) => ({ ...prev, laboratorio_id: laboratorios[0].id_laboratorios }));
    }
  }, [laboratorios, isEdit]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof HorarioFormData, string>> = {};
    if (!form.usuario_id) newErrors.usuario_id = 'El usuario es obligatorio';
    if (!form.laboratorio_id) newErrors.laboratorio_id = 'Selecciona un laboratorio';
    if (!form.dia_semana) newErrors.dia_semana = 'El día es obligatorio';
    if (!form.hora_inicio) newErrors.hora_inicio = 'La hora de inicio es obligatoria';
    if (!form.hora_fin) newErrors.hora_fin = 'La hora de fin es obligatoria';
    if (form.hora_inicio && form.hora_fin && form.hora_fin <= form.hora_inicio) {
      newErrors.hora_fin = 'La hora de fin debe ser posterior a la de inicio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['usuario_id', 'laboratorio_id', 'dia_semana', 'estado_id'];
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value, 10) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(form);
      } else {
        await createMutation.mutateAsync(form);
      }
      navigate('/horarios');
    } catch (err) {
      setSubmitError((err as Error).message || 'Error al guardar');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingHorario) {
    return <Layout><div className="spinner-container"><div className="spinner" /></div></Layout>;
  }

  if (isEdit && loadError) {
    return (
      <Layout>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="alert-error">No se pudo cargar el horario: {(loadError as Error).message}</div>
          <button className="btn-secondary" onClick={() => navigate('/horarios')}>← Volver</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/horarios">Horarios</Link>
        <span style={{ color: '#cbd5e0' }}>/</span>
        <span>{isEdit ? `Editar #${horarioId}` : 'Nuevo horario'}</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'Editar horario' : 'Nuevo horario'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '4px' }}>
            {isEdit ? `Modificando horario #${horarioId}` : 'Completa los campos para registrar un horario de acceso'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {submitError && <div className="alert-error">{submitError}</div>}

          <div className="form-field">
            <label className="form-label">
              Usuario <span style={{ color: '#e53e3e', marginLeft: '2px' }}>*</span>
            </label>
            <select
              name="usuario_id"
              value={form.usuario_id || ''}
              onChange={handleChange}
              disabled={loadingUsuarios}
              className={`form-input${errors.usuario_id ? ' has-error' : ''}`}
            >
              <option value="" disabled>Selecciona un usuario</option>
              {usuarios?.map((u) => (
                <option key={u.id_usuarios} value={u.id_usuarios}>{u.nombre}</option>
              ))}
            </select>
            {errors.usuario_id && <p className="form-error">{errors.usuario_id}</p>}
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
            <label className="form-label">Día de la semana</label>
            <select
              name="dia_semana"
              value={form.dia_semana}
              onChange={handleChange}
              className={`form-input${errors.dia_semana ? ' has-error' : ''}`}
            >
              {DIAS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            {errors.dia_semana && <p className="form-error">{errors.dia_semana}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-field">
              <label className="form-label">Hora inicio</label>
              <input
                type="time"
                name="hora_inicio"
                value={form.hora_inicio}
                onChange={handleChange}
                min="06:00"
                max="20:00"
                className={`form-input${errors.hora_inicio ? ' has-error' : ''}`}
              />
              {errors.hora_inicio && <p className="form-error">{errors.hora_inicio}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">Hora fin</label>
              <input
                type="time"
                name="hora_fin"
                value={form.hora_fin}
                onChange={handleChange}
                min="06:00"
                max="20:00"
                className={`form-input${errors.hora_fin ? ' has-error' : ''}`}
              />
              {errors.hora_fin && <p className="form-error">{errors.hora_fin}</p>}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Estado</label>
            <select
              name="estado_id"
              value={form.estado_id}
              onChange={handleChange}
              disabled={loadingEstados}
              className="form-input"
            >
              {estados?.filter(e => e.categoria_estado_id === 1).map((e) => (
                <option key={e.id_estados} value={e.id_estados}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear horario'}
            </button>
            <button type="button" onClick={() => navigate('/horarios')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
