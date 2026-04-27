import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: '#0d2137',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ color: '#4ecdc4', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.5px' }}>
            Sistema LIS
          </span>
          <Link to="/usuarios" style={{ color: '#cbd5e0', textDecoration: 'none', fontSize: '0.9rem' }}>
            Usuarios
          </Link>
          <Link to="/laboratorios" style={{ color: '#cbd5e0', textDecoration: 'none', fontSize: '0.9rem' }}>
            Laboratorios
          </Link>
          <Link to="/dispositivos" style={{ color: '#cbd5e0', textDecoration: 'none', fontSize: '0.9rem' }}>
            Dispositivos
          </Link>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid #4ecdc4',
            color: '#4ecdc4',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Cerrar sesión
        </button>
      </nav>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
