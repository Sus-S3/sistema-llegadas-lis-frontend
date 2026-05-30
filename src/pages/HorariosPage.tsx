import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useHorarios, useDeleteHorario } from '../hooks/useHorarios';
import { useUsers } from '../hooks/useUsers';
import { useRoles } from '../hooks/useRoles';
import type { Horario } from '../types';

// ── Constantes del calendario ──────────────────────────────────────────────
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// ── Helpers ────────────────────────────────────────────────────────────────
function normDay(s: string): string {
  const n = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const map: Record<string, string> = {
    lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
    jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado',
  };
  return map[n] ?? s;
}

function parseHour(t: string): number {
  return parseInt(t.split(':')[0], 10);
}

// ── Tipos de calendario ────────────────────────────────────────────────────
type CellEntry = { nombre: string; horarioId: number; isFirst: boolean };
// Índice principal: hora (6..20), secundario: día
type CalGrid = Map<number, Map<string, CellEntry[]>>;

function buildGrid(
  horarios: Horario[],
  userRolMap: Map<number, number>,
  targetRolId: number,
): CalGrid {
  const grid: CalGrid = new Map(
    HOURS.map(h => [h, new Map(DAYS.map(d => [d, [] as CellEntry[]]))])
  );
  for (const hor of horarios) {
    if (userRolMap.get(hor.usuario_id) !== targetRolId) continue;
    const day = normDay(hor.dia_semana);
    if (!DAYS.includes(day)) continue;
    const start = parseHour(hor.hora_inicio);
    const end   = parseHour(hor.hora_fin);
    const nombre = hor.usuario?.nombre ?? `#${hor.usuario_id}`;
    for (let h = start; h < end; h++) {
      if (!grid.has(h)) continue;
      grid.get(h)!.get(day)?.push({ nombre, horarioId: hor.id_horarios, isFirst: h === start });
    }
  }
  return grid;
}

// ── Sub-componente: calendario semanal (filas=horas, columnas=días) ────────
function WeekCalendar({ title, grid }: { title: string; grid: CalGrid }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '0.98rem', fontWeight: 700, color: '#0d2137',
        marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '3px',
          background: '#5bc8c0', display: 'inline-block', flexShrink: 0,
        }} />
        {title}
      </h2>

      <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <table style={{
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          minWidth: '820px',
          width: '100%',
          background: '#fff',
        }}>
          <colgroup>
            <col style={{ width: '72px' }} />
            {DAYS.map(d => <col key={d} />)}
          </colgroup>
          <thead>
            <tr style={{ background: '#0d2137' }}>
              <th style={{
                padding: '11px 12px', textAlign: 'left',
                color: '#5bc8c0', fontSize: '0.72rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderRight: '2px solid rgba(255,255,255,0.1)',
              }}>
                Hora
              </th>
              {DAYS.map(d => (
                <th key={d} style={{
                  padding: '11px 8px', textAlign: 'center',
                  color: '#5bc8c0', fontSize: '0.78rem', fontWeight: 600,
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour, hi) => (
              <tr key={hour}>
                <td style={{
                  padding: '6px 12px',
                  fontWeight: 700, fontSize: '0.8rem', color: '#374151',
                  background: hi % 2 === 0 ? '#fff' : '#f8fafc',
                  borderRight: '2px solid #e2e8f0',
                  borderBottom: '1px solid #f1f5f9',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                }}>
                  {hour}h
                </td>
                {DAYS.map(day => {
                  const entries = grid.get(hour)?.get(day) ?? [];
                  const occupied = entries.length > 0;
                  const starters = entries.filter(e => e.isFirst);

                  return (
                    <td key={day} style={{
                      minHeight: '48px',
                      height: '48px',
                      padding: occupied ? '4px 6px' : '0',
                      background: occupied
                        ? '#0d2137'
                        : (hi % 2 === 0 ? '#fff' : '#f8fafc'),
                      border: '1px solid #e2e8f0',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      overflow: 'hidden',
                    }}>
                      {starters.map((e, idx) => (
                        <div key={idx} style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#5bc8c0',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {e.nombre.split(' ')[0]}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Estilos tabla de gestión ───────────────────────────────────────────────
const STATUS_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#d1fae5', color: '#065f46' },
  2: { bg: '#fee2e2', color: '#991b1b' },
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '0.88rem',
  color: '#374151',
};

// ── Página principal ───────────────────────────────────────────────────────
export default function HorariosPage() {
  const { rolId } = useAuth();
  const { data: horarios, isLoading, error } = useHorarios();
  const { data: usuarios } = useUsers();
  const { data: roles } = useRoles();
  const deleteMutation = useDeleteHorario();
  const navigate = useNavigate();

  const [confirmId, setConfirmId]   = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isAdmin = rolId === 6;

  // Mapa usuario_id → rol_id (para filtrar calendarios)
  const userRolMap = new Map<number, number>(
    usuarios?.map(u => [u.id_usuarios, u.rol_id]) ?? []
  );

  // Buscar rol_id por nombre con fallback a 4 y 5
  const rolAdm  = roles?.find(r => r.nombre.toLowerCase().includes('administrativ'))?.id_roles ?? 4;
  const rolProg = roles?.find(r =>
    r.nombre.toLowerCase().includes('programac') ||
    r.nombre.toLowerCase().includes('programación')
  )?.id_roles ?? 5;

  const gridAdm  = buildGrid(horarios ?? [], userRolMap, rolAdm);
  const gridProg = buildGrid(horarios ?? [], userRolMap, rolProg);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Calendar size={22} /> Horarios</h1>
          <p className="page-subtitle">Calendario semanal de acceso al laboratorio</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => navigate('/horarios/nuevo')}>
            <Plus size={15} /> Nuevo horario
          </button>
        )}
      </div>

      {error && <div className="alert-error">{(error as Error).message}</div>}

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : (
        <>
          <WeekCalendar title="Auxiliares Administrativos" grid={gridAdm} />
          <WeekCalendar title="Auxiliares de Programación" grid={gridProg} />

          {/* Tabla de gestión: solo para administradores */}
          {isAdmin && (
            <div style={{ marginTop: '0.5rem' }}>
              <h2 style={{
                fontSize: '0.98rem', fontWeight: 700, color: '#0d2137',
                marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '3px',
                  background: '#0d2137', display: 'inline-block', flexShrink: 0,
                }} />
                Gestión de horarios
              </h2>

              {deleteMutation.error && (
                <div className="alert-error">{(deleteMutation.error as Error).message}</div>
              )}

              {!horarios || horarios.length === 0 ? (
                <div className="empty-state">No hay horarios registrados.</div>
              ) : (
                <div style={{
                  background: '#fff', borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#0d2137' }}>
                        {['Usuario', 'Laboratorio', 'Día', 'Hora inicio', 'Hora fin', 'Estado', ''].map((h, i) => (
                          <th key={i} style={{
                            color: '#5bc8c0', fontWeight: 600, fontSize: '0.78rem',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            padding: '13px 16px', textAlign: h === '' ? 'right' : 'left',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {horarios.map((h, i) => {
                        const statusColors = STATUS_COLORS[h.estado_id] ?? { bg: '#fef3c7', color: '#92400e' };
                        const statusName   = h.estado?.nombre ?? (h.estado_id === 1 ? 'Activo' : 'Inactivo');
                        const usuarioNombre = h.usuario?.nombre ?? `Usuario #${h.usuario_id}`;
                        const labNombre     = h.laboratorio?.nombre ?? `Lab #${h.laboratorio_id}`;
                        return (
                          <tr key={h.id_horarios} style={{
                            background: i % 2 === 0 ? '#fff' : '#f8fafc',
                            borderBottom: '1px solid #f1f5f9',
                          }}>
                            <td style={tdStyle}>
                              <p style={{ fontWeight: 600, color: '#0d2137', fontSize: '0.88rem', margin: 0 }}>
                                {usuarioNombre}
                              </p>
                              {h.usuario?.correo && (
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                                  {h.usuario.correo}
                                </p>
                              )}
                            </td>
                            <td style={tdStyle}>
                              <span className="badge" style={{ background: '#e0f7f5', color: '#2a7d7b' }}>
                                {labNombre}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span style={{ fontWeight: 500, color: '#374151' }}>
                                {normDay(h.dia_semana)}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{h.hora_inicio}</span>
                            </td>
                            <td style={tdStyle}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{h.hora_fin}</span>
                            </td>
                            <td style={tdStyle}>
                              <span className="badge" style={{ background: statusColors.bg, color: statusColors.color }}>
                                {statusName}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {confirmId === h.id_horarios ? (
                                <div className="confirm-row" style={{ justifyContent: 'flex-end' }}>
                                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>¿Eliminar?</span>
                                  <button
                                    className="btn-confirm-yes"
                                    onClick={() => handleDelete(h.id_horarios)}
                                    disabled={deletingId === h.id_horarios}
                                  >
                                    {deletingId === h.id_horarios ? '...' : 'Sí'}
                                  </button>
                                  <button className="btn-confirm-no" onClick={() => setConfirmId(null)}>
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    className="btn-icon edit"
                                    onClick={() => navigate(`/horarios/${h.id_horarios}/editar`)}
                                    title="Editar"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    className="btn-icon delete"
                                    onClick={() => setConfirmId(h.id_horarios)}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
