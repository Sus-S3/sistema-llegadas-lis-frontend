import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, loggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      navigate('/usuarios', { replace: true });
    }
  }, [searchParams, login, navigate]);

  useEffect(() => {
    if (loggedIn) navigate('/usuarios', { replace: true });
  }, [loggedIn, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(150deg, #0d2137 0%, #2a7d7b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
      }}>
        <img
          src="/logo-lis.png"
          alt="LIS"
          style={{ width: '130px', marginBottom: '2rem', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
        />
        <h1 style={{
          color: '#fff', fontSize: '1.9rem', fontWeight: 800,
          textAlign: 'center', marginBottom: '0.75rem', lineHeight: 1.2,
        }}>
          Sistema de Llegadas LIS
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', textAlign: 'center', maxWidth: '300px', lineHeight: 1.6 }}>
          Laboratorio de Ingeniería de Sistemas — UdeA
        </p>
      </div>

      {/* Right panel */}
      <div style={{
        width: '460px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <h2 style={{ color: '#0d2137', fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px' }}>
            Bienvenido
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            Inicia sesión con tu cuenta institucional
          </p>

          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #5bc8c0, #2a7d7b)',
              color: '#fff',
              padding: '14px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(91,200,192,0.35)',
              width: '100%',
              boxSizing: 'border-box',
              transition: 'opacity 0.2s, transform 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <GoogleIcon />
            Iniciar sesión con Google
          </a>

          <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '2.5rem', textAlign: 'center' }}>
            Universidad de Antioquia
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.6 16.5 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 16.3 5 9.7 9.1 6.3 15.2z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.8 13.5-4.7l-6.2-5.2C29.4 36.9 26.8 38 24 38c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 41 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C42 36.2 44 31 44 25c0-1.3-.1-2.7-.4-3.9z"/>
    </svg>
  );
}
