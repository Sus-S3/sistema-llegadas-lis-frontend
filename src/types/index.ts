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
  id_roles: number;
  nombre: string;
}

export interface Estado {
  id: number;
  nombre: string;
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

export interface Asistencia {
  id_asistencia: number;
  tarjeta_id: number;
  usuario_id: number;
  fecha_hora: string;
  tipo: string;
  usuario?: { id_usuario: number; nombre: string; correo: string };
  tarjeta?: { id_tarjeta: number; uid_nfc: string };
}
