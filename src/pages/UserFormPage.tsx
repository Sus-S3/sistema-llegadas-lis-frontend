import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { useEstados } from '../hooks/useEstados';
import { useRoles } from '../hooks/useRoles';
import Layout from '../components/Layout';
import type { UserFormData } from '../types';

const initialForm: UserFormData = {
  nombre: '',
  correo: '',
  rol_id: 0,
  estado_id: 1,
};

export default function UserFormPage() {
  const { id } = useParams<{ id?: string }>();
  const userId = id ? parseInt(id, 10) : 0;
  const isEdit = userId > 0;

  const navigate = useNavigate();
  const { data: existingUser, isLoading: loadingUser, error: loadError } = useUser(userId);
  const { data: roles, isLoading: loadingRoles } = useRoles();
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
      rol_id: Number(existingUser.rol_id),
      estado_id: Number(existingUser.estado_id),
    });
  }, [existingUser]);

  useEffect(() => {
    if (!isEdit && roles && roles.length > 0 && form.rol_id === 0) {
      setForm((prev) => ({ ...prev, rol_id: roles[0].id_roles }));
    }
  }, [roles, isEdit]);

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
        await updateMutation.mutateAsync({ nombre: form.nombre, rol_id: Number(form.rol_id), estado_id: Number(form.estado_id) });
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
    return <Layout><div className="spinner-container"><div className="spinner" /></div></Layout>;
  }

  if (isEdit && loadError) {
    return (
      <Layout>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="alert-error">No se pudo cargar el usuario: {(loadError as Error).message}</div>
          <button className="btn-secondary" onClick={() => navigate('/usuarios')}>← Volver</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/usuarios">Usuarios</Link>
        <span style={{ color: '#cbd5e0' }}>/</span>
        <span>{isEdit ? `Editar #${userId}` : 'Nuevo usuario'}</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '4px' }}>
            {isEdit ? `Modificando usuario #${userId}` : 'Completa los campos para registrar un usuario'}
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
              placeholder="Nombre completo"
              className={`form-input${errors.nombre ? ' has-error' : ''}`}
            />
            {errors.nombre && <p className="form-error">{errors.nombre}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Correo electrónico</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="correo@institucion.edu"
              readOnly={isEdit}
              className={`form-input${errors.correo ? ' has-error' : ''}${isEdit ? ' readonly-input' : ''}`}
            />
            {errors.correo && <p className="form-error">{errors.correo}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Rol</label>
            <select name="rol_id" value={form.rol_id} onChange={handleChange} disabled={loadingRoles} className="form-input">
              {roles?.map((r) => (
                <option key={r.id_roles} value={r.id_roles}>{r.nombre}</option>
              ))}
            </select>
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
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
            <button type="button" onClick={() => navigate('/usuarios')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
