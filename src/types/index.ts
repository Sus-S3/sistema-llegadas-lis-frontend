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
