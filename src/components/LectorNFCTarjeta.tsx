import { useState, useRef, useEffect, useCallback } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function LectorNFCTarjeta() {
  const navigate = useNavigate();
  const hasSerial = 'serial' in navigator;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [serialError, setSerialError] = useState<string | null>(null);

  const portRef = useRef<WebSerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const processUID = useCallback((uid: string) => {
    navigate(`/tarjetas/nueva?uid=${encodeURIComponent(uid)}`);
  }, [navigate]);

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
  };

  useEffect(() => {
    return () => {
      readerRef.current?.cancel().catch(() => {});
      portRef.current?.close().catch(() => {});
    };
  }, []);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{
        fontSize: '0.98rem', fontWeight: 700, color: '#0d2137',
        marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '3px',
          background: connected ? '#10b981' : '#94a3b8',
          display: 'inline-block', flexShrink: 0,
          transition: 'background 0.3s',
        }} />
        Registrar tarjeta con lector NFC
      </h2>

      {!hasSerial && (
        <div className="alert-error" style={{ marginBottom: '1rem' }}>
          <strong>Navegador no compatible.</strong> La Web Serial API requiere Chrome o Edge versión 89+.
        </div>
      )}

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '10px',
              background: connected ? '#d1fae5' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: connected ? '#065f46' : '#94a3b8',
              transition: 'background 0.3s, color 0.3s',
              flexShrink: 0,
            }}>
              {connected ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#0d2137', fontSize: '0.88rem', marginBottom: '3px' }}>
                Lector serial (9600 baud)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                  background: connected ? '#10b981' : '#cbd5e0',
                  boxShadow: connected ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
                  transition: 'all 0.3s',
                }} />
                <span style={{ fontSize: '0.78rem', color: connected ? '#059669' : '#94a3b8', fontWeight: 500 }}>
                  {connected ? 'Conectado — acercá la tarjeta para registrar' : 'Sin conexión'}
                </span>
              </div>
            </div>
          </div>

          {connected ? (
            <button
              onClick={handleDisconnect}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #fca5a5',
                background: '#fff', color: '#dc2626', fontWeight: 600,
                fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#fee2e2')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <WifiOff size={15} /> Desconectar
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleConnect}
              disabled={connecting || !hasSerial}
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              <Wifi size={15} />
              {connecting ? 'Abriendo puerto…' : 'Conectar lector'}
            </button>
          )}
        </div>

        {connected && (
          <div style={{
            padding: '8px 1.5rem',
            background: 'linear-gradient(90deg, #0d2137, #1a3a5c)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#10b981',
              animation: 'pulse 2s infinite', display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
              Al detectar un UID se abrirá el formulario automáticamente
            </span>
          </div>
        )}
      </div>

      {serialError && <div className="alert-error" style={{ marginTop: '0.75rem' }}>{serialError}</div>}
    </div>
  );
}
