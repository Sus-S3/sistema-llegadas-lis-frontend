import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateReemplazo } from '../hooks/useReemplazos';
import { useUsers } from '../hooks/useUsers';
import { useHorarios } from '../hooks/useHorarios';
import Layout from '../components/Layout';
import type { ReemplazoFormData } from '../types';

const initialForm: ReemplazoFormData = {
  solicitante_id: 0,
  reemplazante_id: 0,
  horario_id: 0,
  motivo: '',
};

const formatHora = (t: string) => t.slice(0, 5);

const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ReemplazoFormPage() {
  const navigate = useNavigate();
  const { data: usuarios, isLoading: loadingUsuarios } = useUsers();
  const { data: todosHorarios, isLoading: loadingHorarios } = useHorarios();
  const createMutation = useCreateReemplazo();

  const [form, setForm] = useState<ReemplazoFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ReemplazoFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const horariosDelSolicitante = todosHorarios?.filter(
    (h) => h.usuario_id === form.solicitante_id,
  ).sort((a, b) => DIAS_ORDEN.indexOf(a.dia_semana) - DIAS_ORDEN.indexOf(b.dia_semana)) ?? [];

  const reemplazantesDisponibles = usuarios?.filter(
    (u) => u.id_usuarios !== form.solicitante_id,
  ) ?? [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'solicitante_id') {
      setForm((prev) => ({
        ...prev,
        solicitante_id: parseInt(value, 10) || 0,
        horario_id: 0,
        reemplazante_id: prev.reemplazante_id === (parseInt(value, 10) || 0)
          ? 0
          : prev.reemplazante_id,
      }));
    } else if (name === 'reemplazante_id' || name === 'horario_id') {
      setForm((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ReemplazoFormData, string>> = {};
    if (!form.solicitante_id) newErrors.solicitante_id = 'El solicitante es obligatorio';
    if (!form.reemplazante_id) newErrors.reemplazante_id = 'El reemplazante es obligatorio';
    if (!form.horario_id) newErrors.horario_id = 'El horario es obligatorio';
    if (!form.motivo.trim()) newErrors.motivo = 'El motivo es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    try {
      await createMutation.mutateAsync(form);
      navigate('/reemplazos');
    } catch (err) {
      setSubmitError((err as Error).message || 'Error al guardar');
    }
  };

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/reemplazos">Reemplazos</Link>
        <span style={{ color: '#cbd5e0' }}>/</span>
        <span>Nuevo reemplazo</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            Nuevo reemplazo
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '4px' }}>
            Solicita un reemplazo de horario entre dos usuarios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {submitError && <div className="alert-error">{submitError}</div>}

          <div className="form-field">
            <label className="form-label">
              Solicitante <span style={{ color: '#e53e3e', marginLeft: '2px' }}>*</span>
            </label>
            <select
              name="solicitante_id"
              value={form.solicitante_id || ''}
              onChange={handleChange}
              disabled={loadingUsuarios}
              className={`form-input${errors.solicitante_id ? ' has-error' : ''}`}
            >
              <option value="" disabled>Selecciona el solicitante</option>
              {usuarios?.map((u) => (
                <option key={u.id_usuarios} value={u.id_usuarios}>{u.nombre}</option>
              ))}
            </select>
            {errors.solicitante_id && <p className="form-error">{errors.solicitante_id}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">
              Reemplazante <span style={{ color: '#e53e3e', marginLeft: '2px' }}>*</span>
            </label>
            <select
              name="reemplazante_id"
              value={form.reemplazante_id || ''}
              onChange={handleChange}
              disabled={loadingUsuarios}
              className={`form-input${errors.reemplazante_id ? ' has-error' : ''}`}
            >
              <option value="" disabled>
                {!form.solicitante_id
                  ? 'Selecciona el solicitante primero'
                  : 'Selecciona el reemplazante'}
              </option>
              {reemplazantesDisponibles.map((u) => (
                <option key={u.id_usuarios} value={u.id_usuarios}>{u.nombre}</option>
              ))}
            </select>
            {errors.reemplazante_id && <p className="form-error">{errors.reemplazante_id}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">
              Horario del solicitante <span style={{ color: '#e53e3e', marginLeft: '2px' }}>*</span>
            </label>
            <select
              name="horario_id"
              value={form.horario_id || ''}
              onChange={handleChange}
              disabled={!form.solicitante_id || loadingHorarios}
              className={`form-input${errors.horario_id ? ' has-error' : ''}`}
            >
              <option value="" disabled>
                {!form.solicitante_id
                  ? 'Selecciona el solicitante primero'
                  : loadingHorarios
                    ? 'Cargando horarios…'
                    : 'Selecciona un horario'}
              </option>
              {horariosDelSolicitante.map((h) => (
                <option key={h.id_horarios} value={h.id_horarios}>
                  {h.dia_semana} — {formatHora(h.hora_inicio)} a {formatHora(h.hora_fin)}
                  {h.laboratorio?.nombre ? ` (${h.laboratorio.nombre})` : ''}
                </option>
              ))}
            </select>
            {errors.horario_id && <p className="form-error">{errors.horario_id}</p>}
            {form.solicitante_id > 0 && !loadingHorarios && horariosDelSolicitante.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                Este usuario no tiene horarios asignados.
              </p>
            )}
          </div>

          <div className="form-field">
            <label className="form-label">
              Motivo <span style={{ color: '#e53e3e', marginLeft: '2px' }}>*</span>
            </label>
            <textarea
              name="motivo"
              value={form.motivo}
              onChange={handleChange}
              placeholder="Describe el motivo del reemplazo"
              rows={4}
              className={`form-input${errors.motivo ? ' has-error' : ''}`}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
            {errors.motivo && <p className="form-error">{errors.motivo}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Guardando...' : 'Crear reemplazo'}
            </button>
            <button type="button" onClick={() => navigate('/reemplazos')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
