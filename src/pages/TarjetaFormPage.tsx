import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTarjeta, useCreateTarjeta, useUpdateTarjeta } from '../hooks/useTarjetas';
import { useUsers } from '../hooks/useUsers';
import { useEstados } from '../hooks/useEstados';
import Layout from '../components/Layout';
import type { TarjetaFormData } from '../types';

const initialForm: TarjetaFormData = {
  uid_nfc: '',
  usuario_id: null,
  estado_id: 1,
};

export default function TarjetaFormPage() {
  const { id } = useParams<{ id?: string }>();
  const tarjetaId = id ? parseInt(id, 10) : 0;
  const isEdit = tarjetaId > 0;

  const navigate = useNavigate();
  const { data: existing, isLoading: loadingTarjeta, error: loadError } = useTarjeta(tarjetaId);
  const { data: usuarios, isLoading: loadingUsuarios } = useUsers();
  const { data: estados, isLoading: loadingEstados } = useEstados();
  const createMutation = useCreateTarjeta();
  const updateMutation = useUpdateTarjeta(tarjetaId);

  const [form, setForm] = useState<TarjetaFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TarjetaFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setForm({
      uid_nfc: existing.uid_nfc,
      usuario_id: existing.usuario_id,
      estado_id: Number(existing.estado_id),
    });
  }, [existing]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TarjetaFormData, string>> = {};
    if (!form.uid_nfc.trim()) newErrors.uid_nfc = 'El UID NFC es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'estado_id'
        ? parseInt(value, 10)
        : name === 'usuario_id'
          ? (value === '' ? null : parseInt(value, 10))
          : value,
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
      navigate('/tarjetas');
    } catch (err) {
      setSubmitError((err as Error).message || 'Error al guardar');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingTarjeta) {
    return <Layout><div className="spinner-container"><div className="spinner" /></div></Layout>;
  }

  if (isEdit && loadError) {
    return (
      <Layout>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="alert-error">No se pudo cargar la tarjeta: {(loadError as Error).message}</div>
          <button className="btn-secondary" onClick={() => navigate('/tarjetas')}>← Volver</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/tarjetas">Tarjetas NFC</Link>
        <span style={{ color: '#cbd5e0' }}>/</span>
        <span>{isEdit ? `Editar #${tarjetaId}` : 'Nueva tarjeta'}</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'Editar tarjeta NFC' : 'Nueva tarjeta NFC'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '4px' }}>
            {isEdit ? `Modificando tarjeta #${tarjetaId}` : 'Registra una nueva tarjeta NFC en el sistema'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {submitError && <div className="alert-error">{submitError}</div>}

          <div className="form-field">
            <label className="form-label">UID NFC</label>
            <input
              name="uid_nfc"
              value={form.uid_nfc}
              onChange={handleChange}
              placeholder="Ej: A3:4F:2B:1C"
              className={`form-input${errors.uid_nfc ? ' has-error' : ''}`}
              style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
            />
            {errors.uid_nfc && <p className="form-error">{errors.uid_nfc}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Usuario asignado</label>
            <select
              name="usuario_id"
              value={form.usuario_id ?? ''}
              onChange={handleChange}
              disabled={loadingUsuarios}
              className="form-input"
            >
              <option value="">Sin asignar</option>
              {usuarios?.map((u) => (
                <option key={u.id_usuarios} value={u.id_usuarios}>{u.nombre}</option>
              ))}
            </select>
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
              {estados?.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear tarjeta'}
            </button>
            <button type="button" onClick={() => navigate('/tarjetas')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
