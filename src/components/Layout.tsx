import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTokenPayload } from '../lib/auth';
import { Users, Building2, Smartphone, CreditCard, ClipboardList, Calendar, FileText, RefreshCw, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

const ADMIN_ROL_ID = 6;
const ADMIN_ONLY_ROUTES = new Set(['/laboratorios', '/dispositivos', '/tarjetas']);
const NAV = [
  { to: '/usuarios',       icon: Users,        label: 'Usuarios',       exact: false },
  { to: '/laboratorios',   icon: Building2,    label: 'Laboratorios',   exact: false },
  { to: '/dispositivos',   icon: Smartphone,   label: 'Dispositivos',   exact: false },
  { to: '/tarjetas',       icon: CreditCard,   label: 'Tarjetas',       exact: false },
  { to: '/asistencia',     icon: ClipboardList,label: 'Asistencia',     exact: false },
  { to: '/horarios',       icon: Calendar,     label: 'Horarios',       exact: false },
  { to: '/justificaciones',icon: FileText,     label: 'Justificaciones',exact: false },
  { to: '/reemplazos',     icon: RefreshCw,    label: 'Reemplazos',     exact: false },
];

const LOGO_URL = 'https://lis.udea.edu.co/wp-content/uploads/2020/09/cropped-logo-lis-192x192.png';
const W_EXPANDED  = 220;
const W_COLLAPSED =  60;

export default function Layout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { logout, rolId } = useAuth();
  const visibleNav = rolId === ADMIN_ROL_ID
    ? NAV
    : NAV.filter(({ to }) => !ADMIN_ONLY_ROUTES.has(to));

  const navigate  = useNavigate();
  const location  = useLocation();
  const payload   = getTokenPayload();
  const correo    = payload?.correo ?? '';
  const emailName = correo.split('@')[0];
  const userName  = emailName
    ? emailName.split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    : 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarW = collapsed ? W_COLLAPSED : W_EXPANDED;
  const transition = 'width 0.2s ease';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarW,
        minWidth: sidebarW,
        background: '#0d2137',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 100,
        overflow: 'hidden',
        transition,
      }}>

        {/* Toggle button */}
        <div style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '10px 10px 0',
        }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28, height: 28,
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0,
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Logo / branding */}
        <div style={{
          padding: collapsed ? '0.75rem 0' : '0.75rem 1.25rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          {logoError ? (
            <div style={{
              width: collapsed ? 34 : 56,
              height: collapsed ? 34 : 56,
              borderRadius: '50%',
              background: '#5bc8c0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: collapsed ? 13 : 18,
              fontWeight: 'bold', color: '#0d2137',
              flexShrink: 0,
              transition: 'width 0.2s ease, height 0.2s ease, font-size 0.2s ease',
            }}>LIS</div>
          ) : (
            <img
              src={LOGO_URL}
              alt="LIS"
              onError={() => setLogoError(true)}
              style={{
                width: collapsed ? 34 : 56,
                height: collapsed ? 34 : 56,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                transition: 'width 0.2s ease, height 0.2s ease',
              }}
            />
          )}
          {!collapsed && (
            <p style={{
              color: '#fff', fontWeight: 700, fontSize: '0.9rem',
              letterSpacing: '0.3px', margin: '8px 0 0',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
              Sistema LIS
            </p>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {visibleNav.map(({ to, icon: Icon, label, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={`nav-link${isActive ? ' active' : ''}`}
                style={collapsed ? { justifyContent: 'center', padding: '0.55rem', gap: 0 } : {}}
              >
                <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            className="sidebar-btn"
            onClick={handleLogout}
            title={collapsed ? 'Cerrar sesión' : undefined}
            style={collapsed ? { justifyContent: 'center', padding: '0.55rem', gap: 0 } : {}}
          >
            <LogOut size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
            {!collapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{
        flex: 1,
        marginLeft: sidebarW,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition,
      }}>
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
