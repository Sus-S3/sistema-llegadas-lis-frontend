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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #0d2137, #4ecdc4)',
          borderRadius: '50%',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.8rem' }}>🏫</span>
        </div>

        <h1 style={{ color: '#0d2137', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Sistema de Llegadas
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          LIS — Inicio de sesión
        </p>

        <a
          href={`${import.meta.env.VITE_API_URL}/auth/google`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#0d2137',
            color: '#ffffff',
            padding: '14px 24px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'background 0.2s',
            border: '2px solid #4ecdc4',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1a3a5c')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#0d2137')}
        >
          <GoogleIcon />
          Iniciar sesión con Google
        </a>

        <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '2rem' }}>
          Solo cuentas institucionales autorizadas
        </p>
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
