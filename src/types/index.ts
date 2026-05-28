export interface User {
  id_usuarios: number;
  nombre: string;
  correo: string;
  rol_id: number;
  estado_id: number;
  rol?: { id: number; nombre: string };
  estado?: { id: number; nombre: string };
}

export interface UserFormData {
  nombre: string;
  correo: string;
  rol_id: number;
  estado_id: number;
}

export interface UserUpdateData {
  nombre: string;
  rol_id: number;
  estado_id: number;
}

export interface Role {
  id: number;
  nombre: string;
}

export interface Estado {
  id_estados: number;
  nombre: string;
  categoria_estado_id: number;
}

export interface Laboratorio {
  id_laboratorios: number;
  nombre: string;
  ubicacion: string;
  estado_id: number;
  estado?: { id: number; nombre: string };
}

export interface LaboratorioFormData {
  nombre: string;
  ubicacion: string;
  estado_id: number;
}

export interface Dispositivo {
  id_dispositivos: number;
  nombre: string;
  laboratorio_id: number;
  estado_id: number;
  laboratorio?: { id: number; nombre: string };
  estado?: { id: number; nombre: string };
}

export interface DispositivoFormData {
  nombre: string;
  laboratorio_id: number;
  estado_id: number;
}

export interface Tarjeta {
  id_tarjeta: number;
  uid_nfc: string;
  usuario_id: number | null;
  estado_id: number;
  usuario?: { id_usuario: number; nombre: string; correo: string };
  estado?: { id_estados: number; nombre: string };
}

export interface TarjetaFormData {
  uid_nfc: string;
  usuario_id: number | null;
  estado_id: number;
}

export interface Horario {
  id_horarios: number;
  usuario_id: number;
  laboratorio_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estado_id: number;
  usuario?: { id_usuarios: number; nombre: string; correo: string };
  laboratorio?: { id_laboratorios: number; nombre: string };
  estado?: { id: number; nombre: string };
}

export interface HorarioFormData {
  usuario_id: number;
  laboratorio_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estado_id: number;
}

export interface Asistencia {
  id_asistencia: number;
  tarjeta_id: number;
  usuario_id: number;
  fecha_hora: string;
  tipo: string;
  clasificacion?: string;
  usuario?: { id_usuario: number; nombre: string; correo: string };
  tarjeta?: { id_tarjeta: number; uid_nfc: string };
}

export interface Justificacion {
  id_justificacion: number;
  usuario_id: number;
  asistencia_id: number;
  motivo: string;
  estado: { nombre: string };
  fecha_solicitud: string;
  usuario?: { id_usuarios: number; nombre: string; correo: string };
  asistencia?: { id_asistencia: number; fecha_hora: string; clasificacion?: string };
  revisado_por?: { nombre: string } | null;
}

export interface JustificacionFormData {
  usuario_id: number;
  asistencia_id: number;
  motivo: string;
}

export interface RevisarJustificacionPayload {
  estado_id: number;
  revisado_por_id: number;
}

export interface Reemplazo {
  id_reemplazo: number;
  solicitante_id: number;
  reemplazante_id: number;
  horario_id: number;
  motivo: string;
  estado: { nombre: string };
  fecha_solicitud: string;
  solicitante?: { id_usuarios: number; nombre: string; correo: string };
  reemplazante?: { id_usuarios: number; nombre: string; correo: string };
  horario?: { id_horarios: number; dia_semana: string; hora_inicio: string; hora_fin: string };
}

export interface ReemplazoFormData {
  solicitante_id: number;
  reemplazante_id: number;
  horario_id: number;
  motivo: string;
}

export interface RevisarReemplazoPayload {
  estado_id: number;
  revisado_por_id: number;
}
