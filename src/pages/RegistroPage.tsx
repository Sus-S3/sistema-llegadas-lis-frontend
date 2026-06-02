import { useState, useRef, useEffect, useCallback } from 'react';
import { ScanLine, Wifi, WifiOff, CheckCircle, Clock, Minus, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../lib/api';

// Minimal Web Serial API types (not in all TS DOM lib versions)
interface WebSerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
}
interface WebSerial {
  requestPort(options?: Record<string, unknown>): Promise<WebSerialPort>;
}
const getSerial = (): WebSerial =>
  (navigator as unknown as { serial: WebSerial }).serial;

interface MarcarResponse {
  usuario?: { nombre: string; correo?: string };
  nombre?: string;
  correo?: string;
  tipo?: string;
  estado_asistencia?: string;
  puntualidad?: string;
  clasificacion?: string;
  fecha_hora?: string;
}

type EstadoAsistencia = 'a_tiempo' | 'tarde' | 'sin_horario' | 'error';

interface RegistroResult {
  uid: string;
  nombre: string;
  correo?: string;
  tipo?: string;
  estadoAsistencia: EstadoAsistencia;
  hora: string;
  mensaje?: string;
}

const ESTADO_CFG: Record<EstadoAsistencia, {
  bg: string; border: string; color: string; accentBg: string;
  icon: React.ElementType; label: string;
}> = {
  a_tiempo: {
    bg: '#d1fae5', border: '#6ee7b7', color: '#065f46', accentBg: '#10b981',
    icon: CheckCircle, label: 'A tiempo',
  },
  tarde: {
    bg: '#fef3c7', border: '#fcd34d', color: '#92400e', accentBg: '#f59e0b',
    icon: Clock, label: 'Tarde',
  },
  sin_horario: {
    bg: '#f1f5f9', border: '#e2e8f0', color: '#64748b', accentBg: '#94a3b8',
    icon: Minus, label: 'Sin horario asignado',
  },
  error: {
    bg: '#fee2e2', border: '#fca5a5', color: '#991b1b', accentBg: '#dc2626',
    icon: XCircle, label: 'Tarjeta no registrada',
  },
};

const DEDUP_MS = 5_000;

function normalizeEstado(raw: string | undefined): EstadoAsistencia {
  if (!raw) return 'sin_horario';
  const v = raw.toLowerCase();
  if (v.includes('tiempo')) return 'a_tiempo';
  if (v.includes('tarde')) return 'tarde';
  if (v.includes('sin') || v.includes('horario')) return 'sin_horario';
  return 'sin_horario';
}

function formatHora(iso: string | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export default function RegistroPage() {
  const hasSerial = 'serial' in navigator;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<RegistroResult | null>(null);
  const [serialError, setSerialError] = useState<string | null>(null);

  const portRef = useRef<WebSerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const recentScans = useRef<Map<string, number>>(new Map());

  const processUID = useCallback(async (uid: string) => {
    const now = Date.now();
    const last = recentScans.current.get(uid);
    if (last && now - last < DEDUP_MS) return;
    recentScans.current.set(uid, now);

    setScanning(true);
    setSerialError(null);
    try {
      const { data } = await api.post<MarcarResponse>('/asistencia/marcar', { uid_nfc: uid });
      const nombre = data.usuario?.nombre ?? data.nombre ?? 'Usuario desconocido';
      const correo = data.usuario?.correo ?? data.correo;
      const estadoRaw = data.estado_asistencia ?? data.puntualidad ?? data.clasificacion;
      setResult({
        uid,
        nombre,
        correo,
        tipo: data.tipo,
        estadoAsistencia: normalizeEstado(estadoRaw),
        hora: formatHora(data.fecha_hora),
      });
    } catch (err) {
      setResult({
        uid,
        nombre: 'Tarjeta no reconocida',
        estadoAsistencia: 'error',
        hora: formatHora(undefined),
        mensaje: (err as Error).message || 'La tarjeta no está registrada en el sistema',
      });
    } finally {
      setScanning(false);
    }
  }, []);

  const startReadLoop = useCallback(async (port: WebSerialPort) => {
    const decoder = new TextDecoder();
    let buffer = '';
    const reader = port.readable!.getReader();
    readerRef.current = reader;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const m = line.trim().match(/^UID:([A-Fa-f0-9:]+)$/i);
          if (m) processUID(m[1].toUpperCase());
        }
      }
    } catch {
      // reader cancelled or port closed — expected on disconnect
    } finally {
      reader.releaseLock();
    }
  }, [processUID]);

  const handleConnect = async () => {
    if (!hasSerial) return;
    setConnecting(true);
    setSerialError(null);
    try {
      const port = await getSerial().requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setConnected(true);
      startReadLoop(port);
    } catch (err) {
      // NotFoundError = user cancelled the dialog, not an error
      if ((err as DOMException).name !== 'NotFoundError') {
        setSerialError((err as Error).message || 'No se pudo abrir el puerto serial');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
    } catch { /* ignore */ }
    try {
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch { /* ignore */ }
    setConnected(false);
    recentScans.current.clear();
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      readerRef.current?.cancel().catch(() => {});
      portRef.current?.close().catch(() => {});
    };
  }, []);

  const cfg = result ? ESTADO_CFG[result.estadoAsistencia] : null;
  const ResultIcon = cfg?.icon ?? CheckCircle;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title"><ScanLine size={22} /> Registro de llegadas</h1>
          <p className="page-subtitle">Acercá una tarjeta NFC al lector para registrar asistencia</p>
        </div>
      </div>

      {/* Browser support warning */}
      {!hasSerial && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          <strong>Navegador no compatible.</strong> La Web Serial API requiere Chrome o Edge versión 89+. Este navegador no la soporta.
        </div>
      )}

      {/* Connection panel */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 50, height: 50, borderRadius: '12px',
              background: connected ? '#d1fae5' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: connected ? '#065f46' : '#94a3b8',
              transition: 'background 0.3s, color 0.3s',
              flexShrink: 0,
            }}>
              {connected ? <Wifi size={22} /> : <WifiOff size={22} />}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#0d2137', fontSize: '0.95rem', marginBottom: '4px' }}>
                Lector serial (9600 baud)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                  background: connected ? '#10b981' : '#cbd5e0',
                  boxShadow: connected ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
                  transition: 'all 0.3s',
                }} />
                <span style={{ fontSize: '0.82rem', color: connected ? '#059669' : '#94a3b8', fontWeight: 500 }}>
                  {connected ? 'Conectado — escuchando puerto serial' : 'Sin conexión'}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {connected ? (
            <button
              onClick={handleDisconnect}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #fca5a5',
                background: '#fff', color: '#dc2626', fontWeight: 600,
                fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#fee2e2')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <WifiOff size={16} /> Desconectar
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleConnect}
              disabled={connecting || !hasSerial}
              style={{ minWidth: '170px', justifyContent: 'center' }}
            >
              <Wifi size={16} />
              {connecting ? 'Abriendo puerto…' : 'Conectar lector'}
            </button>
          )}
        </div>

        {/* Baudrate hint strip */}
        {connected && (
          <div style={{
            padding: '10px 2rem',
            background: 'linear-gradient(90deg, #0d2137, #1a3a5c)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#10b981',
              animation: 'pulse 2s infinite', display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
              Formato esperado: <span style={{ color: '#5bc8c0' }}>UID:XX:XX:XX:XX</span>
              <span style={{ marginLeft: '1.5rem', color: '#64748b' }}>
                Deduplicación: 5 s por tarjeta
              </span>
            </span>
          </div>
        )}
      </div>

      {serialError && <div className="alert-error">{serialError}</div>}

      {/* Scanning spinner */}
      {scanning && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 14px' }} />
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Registrando asistencia…</p>
          </div>
        </div>
      )}

      {/* Result card */}
      {!scanning && result && cfg && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          overflow: 'hidden',
          animation: 'registro-fadein 0.3s ease',
        }}>
          {/* Color accent strip */}
          <div style={{ height: '6px', background: cfg.accentBg }} />

          <div style={{ padding: '1.75rem 2rem', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
              background: cfg.bg, border: `1.5px solid ${cfg.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: cfg.color,
            }}>
              <ResultIcon size={26} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badges row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.8rem', fontWeight: 700 }}>
                  {cfg.label}
                </span>
                {result.tipo && (
                  <span className="badge" style={{ background: '#e0f7f5', color: '#2a7d7b', fontSize: '0.8rem' }}>
                    {result.tipo}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.88rem', color: '#0d2137', fontWeight: 700 }}>
                  {result.hora}
                </span>
              </div>

              {/* Name */}
              <p style={{ fontWeight: 700, color: '#0d2137', fontSize: '1.15rem', lineHeight: 1.3 }}>
                {result.nombre}
              </p>

              {/* Email */}
              {result.correo && (
                <p style={{ fontSize: '0.83rem', color: '#64748b', marginTop: '3px' }}>
                  {result.correo}
                </p>
              )}

              {/* Error message */}
              {result.mensaje && (
                <p style={{
                  fontSize: '0.83rem', color: cfg.color, marginTop: '8px',
                  fontWeight: 500, padding: '8px 12px',
                  background: cfg.bg, borderRadius: '8px',
                  border: `1px solid ${cfg.border}`,
                }}>
                  {result.mensaje}
                </p>
              )}

              {/* UID */}
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                UID: {result.uid}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Idle state — connected but no scan yet */}
      {!scanning && !result && connected && (
        <div className="empty-state">
          <ScanLine size={44} style={{ margin: '0 auto 14px', color: '#cbd5e0', display: 'block' }} />
          <p style={{ fontWeight: 600, color: '#94a3b8' }}>Esperando tarjeta NFC…</p>
          <p style={{ fontSize: '0.82rem', marginTop: '6px', color: '#cbd5e0' }}>
            Acercá la tarjeta al lector cuando esté listo
          </p>
        </div>
      )}

      {/* Disconnected state */}
      {!connected && !result && (
        <div className="empty-state">
          <WifiOff size={44} style={{ margin: '0 auto 14px', color: '#cbd5e0', display: 'block' }} />
          <p style={{ fontWeight: 600, color: '#94a3b8' }}>Lector desconectado</p>
          <p style={{ fontSize: '0.82rem', marginTop: '6px', color: '#cbd5e0' }}>
            Presioná "Conectar lector" para comenzar
          </p>
        </div>
      )}
    </Layout>
  );
}
