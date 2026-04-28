import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTokenPayload } from '../lib/auth';
import { LayoutDashboard, Users, Building2, Smartphone, CreditCard, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/usuarios', icon: Users, label: 'Usuarios', exact: false },
  { to: '/laboratorios', icon: Building2, label: 'Laboratorios', exact: false },
  { to: '/dispositivos', icon: Smartphone, label: 'Dispositivos', exact: false },
  { to: '/tarjetas', icon: CreditCard, label: 'Tarjetas', exact: false },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const payload = getTokenPayload();
  const correo = payload?.correo ?? '';
  const emailName = correo.split('@')[0];
  const userName = emailName
    ? emailName.split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    : 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px',
        background: '#0d2137',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 100,
      }}>
        <div style={{
          padding: '1.5rem 1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#5bc8c0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 'bold', color: '#0d2137',
            margin: '0 auto 10px',
          }}>LIS</div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.3px', margin: 0 }}>
            Sistema LIS
          </p>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {NAV.map(({ to, icon: Icon, label, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link key={to} to={to} className={`nav-link${isActive ? ' active' : ''}`}>
                <Icon size={18} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button className="sidebar-btn" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 2rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <span style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Hola, <strong style={{ color: '#0d2137' }}>{userName}</strong>
          </span>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #5bc8c0, #2a7d7b)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0,
          }}>
            {userInitial}
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', background: '#f0fafa' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
