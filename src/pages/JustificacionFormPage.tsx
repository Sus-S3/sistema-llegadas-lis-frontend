import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateJustificacion } from '../hooks/useJustificaciones';
import { useMisAsistenciasJustificables } from '../hooks/useAsistencia';
import { getTokenPayload } from '../lib/auth';
import Layout from '../components/Layout';
import type { JustificacionFormData } from '../types';

const formatOpcion = (iso: string, estadoNombre?: string | null): string => {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora  = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return estadoNombre ? `${fecha} — ${estadoNombre} — ${hora}` : `${fecha} — ${hora}`;
};

export default function JustificacionFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreateJustificacion();
  const { data: asistencias, isLoading: loadingAsistencias } = useMisAsistenciasJustificables();

  const payload = getTokenPayload();
  const myUserId = parseInt(payload?.sub ?? '0', 10);

  const [form, setForm] = useState<JustificacionFormData>({
    usuario_id: myUserId,
    asistencia_id: 0,
    motivo: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof JustificacionFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'asistencia_id' ? (parseInt(value, 10) || 0) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof JustificacionFormData, string>> = {};
    if (!form.asistencia_id) newErrors.asistencia_id = 'La asistencia es obligatoria';
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
      navigate('/justificaciones');
    } catch (err) {
      setSubmitError((err as Error).message || 'Error al guardar');
    }
  };

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/justificaciones">Justificaciones</Link>
        <span style={{ color: '#cbd5e0' }}>/</span>
        <span>Nueva justificación</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            Nueva justificación
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '4px' }}>
            Registra una solicitud de justificación de asistencia
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {submitError && <div className="alert-error">{submitError}</div>}

          <div className="form-field">
            <label className="form-label">
              Asistencia <span style={{ color: '#e53e3e', marginLeft: '2px' }}>*</span>
            </label>
            <select
              name="asistencia_id"
              value={form.asistencia_id || ''}
              onChange={handleChange}
              disabled={loadingAsistencias}
              className={`form-input${errors.asistencia_id ? ' has-error' : ''}`}
            >
              <option value="" disabled>
                {loadingAsistencias ? 'Cargando registros…' : 'Selecciona un registro de asistencia'}
              </option>
              {asistencias?.map((a) => (
                <option key={a.id_asistencia} value={a.id_asistencia}>
                  {formatOpcion(a.fecha_hora, a.estado?.nombre ?? a.clasificacion)}
                </option>
              ))}
            </select>
            {errors.asistencia_id && <p className="form-error">{errors.asistencia_id}</p>}
            {!loadingAsistencias && asistencias?.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                No tenés registros de asistencia disponibles.
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
              placeholder="Describe el motivo de la justificación"
              rows={4}
              className={`form-input${errors.motivo ? ' has-error' : ''}`}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
            {errors.motivo && <p className="form-error">{errors.motivo}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Guardando...' : 'Crear justificación'}
            </button>
            <button type="button" onClick={() => navigate('/justificaciones')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
