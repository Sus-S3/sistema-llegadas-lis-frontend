import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

const ADMIN_ROL_ID = 6;

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { loggedIn, rolId } = useAuth();
  if (!loggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && rolId !== ADMIN_ROL_ID) return <Navigate to="/usuarios" replace />;
  return <>{children}</>;
}
