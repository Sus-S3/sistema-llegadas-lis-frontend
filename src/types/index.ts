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
