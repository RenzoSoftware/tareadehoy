import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Check, X, Plus, Minus, FileText, Printer, 
  DollarSign, TrendingUp, TrendingDown, RefreshCw,
  Search, Calendar, Clock, AlertTriangle, ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const Caja = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [caja, setCaja] = useState(null); // Estado de la caja hoy
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);

  // Modales
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [showReporteModal, setShowReporteModal] = useState(false);

  // Formularios
  const [abrirForm, setAbrirForm] = useState({ monto_inicial: '', observaciones: '' });
  const [cerrarForm, setCerrarForm] = useState({ monto_contado: '', observaciones: '' });
  const [movForm, setMovForm] = useState({ tipo: 'Ingreso', categoria: 'Venta', monto: '', descripcion: '', forma_pago: 'Efectivo' });

  // --- Estilos ---
  const s = {
    container: { backgroundColor: isDark ? '#0f1729' : '#F8FAFC', minHeight: '100%', padding: '24px', color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'system-ui, sans-serif', transition: 'all 0.2s' },
    card: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '16px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, padding: '20px', marginBottom: '24px' },
    statusCard: (abierta) => ({
      backgroundColor: abierta ? (isDark ? '#052e16' : '#DCFCE7') : (isDark ? '#450a0a' : '#FEE2E2'),
      border: `1px solid ${abierta ? (isDark ? '#166534' : '#86EFAC') : (isDark ? '#7f1d1d' : '#FCA5A5')}`,
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: abierta ? (isDark ? '#4ade80' : '#166534') : (isDark ? '#f87171' : '#991B1B')
    }),
    statCard: (color) => ({
      backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
      borderRadius: '16px',
      border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
      padding: '20px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      borderLeft: `4px solid ${color}`
    }),
    input: { backgroundColor: isDark ? '#0f1729' : '#F8FAFC', border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`, borderRadius: '8px', padding: '10px 12px', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '14px', outline: 'none', width: '100%' },
    button: (bg = '#3b82f6') => ({ backgroundColor: bg, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s' }),
    btnGhost: { backgroundColor: 'transparent', color: isDark ? '#94a3b8' : '#64748b', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    td: { padding: '14px 16px', fontSize: '13px', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '20px', width: '95%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }
  };

  // --- Lógica de Datos ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [cajaRes, movRes] = await Promise.all([
        axios.get(`${API_BASE}/caja/hoy`),
        axios.get(`${API_BASE}/caja/movimientos?fecha=${fechaFiltro}`)
      ]);
      setCaja(cajaRes.data);
      setMovimientos(movRes.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de caja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [fechaFiltro]);

  const handleAbrir = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/caja/abrir`, abrirForm);
      setShowAbrirModal(false);
      fetchData();
    } catch (err) {
      alert('Error al abrir caja');
    }
  };

  const handleCerrar = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/caja/cerrar`, cerrarForm);
      setShowCerrarModal(false);
      setShowReporteModal(true);
      fetchData();
    } catch (err) {
      alert('Error al cerrar caja');
    }
  };

  const handleMovimiento = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/caja/movimiento`, movForm);
      setShowMovimientoModal(false);
      fetchData();
    } catch (err) {
      alert('Error al registrar movimiento');
    }
  };

  // Cálculos de Resumen
  const resumen = movimientos.reduce((acc, m) => {
    if (m.tipo === 'Venta') {
      if (m.forma_pago === 'Efectivo') acc.efectivo += m.monto;
      else if (m.forma_pago === 'Tarjeta') acc.tarjeta += m.monto;
      else if (['Yape', 'Plin'].includes(m.forma_pago)) acc.digital += m.monto;
    }
    if (m.tipo === 'Ingreso') acc.ingresos += m.monto;
    if (m.tipo === 'Egreso') acc.egresos += m.monto;
    return acc;
  }, { efectivo: 0, tarjeta: 0, digital: 0, ingresos: 0, egresos: 0 });

  const totalDia = resumen.efectivo + resumen.tarjeta + resumen.digital;
  const saldoCaja = (caja?.monto_inicial || 0) + resumen.efectivo + resumen.ingresos - resumen.egresos;

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: '4px' }}>Caja del Día</h1>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · CONTROL DE CAJA</p>
      </div>

      {/* Estado de Caja */}
      <div style={s.statusCard(caja?.estado === 'Abierta')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: caja?.estado === 'Abierta' ? '#10b981' : '#ef4444', color: '#fff', padding: '12px', borderRadius: '12px' }}>
            {caja?.estado === 'Abierta' ? <TrendingUp size={32}/> : <Lock size={32}/>}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>{caja?.estado === 'Abierta' ? 'Caja Abierta' : 'Caja Cerrada'}</h2>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              {caja?.estado === 'Abierta' ? `Apertura: ${new Date(caja.fecha_apertura).toLocaleTimeString()} · Monto inicial: S/ ${caja.monto_inicial.toFixed(2)}` : 'Inicie jornada para registrar movimientos'}
            </p>
          </div>
        </div>
        {caja?.estado === 'Abierta' ? (
          <button style={s.button('#ef4444')} onClick={() => setShowCerrarModal(true)}><Lock size={18}/> Cerrar Caja</button>
        ) : (
          <button style={s.button('#10b981')} onClick={() => setShowAbrirModal(true)}><TrendingUp size={18}/> Abrir Caja</button>
        )}
      </div>

      {/* Tarjetas Resumen (Solo si abierta) */}
      {caja?.estado === 'Abierta' && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <div style={s.statCard('#10b981')}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENTAS EFECTIVO</span>
            <span style={{ fontSize: '24px', fontWeight: '900' }}>S/ {resumen.efectivo.toFixed(2)}</span>
          </div>
          <div style={s.statCard('#3b82f6')}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENTAS TARJETA</span>
            <span style={{ fontSize: '24px', fontWeight: '900' }}>S/ {resumen.tarjeta.toFixed(2)}</span>
          </div>
          <div style={s.statCard('#8b5cf6')}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENTAS YAPE/PLIN</span>
            <span style={{ fontSize: '24px', fontWeight: '900' }}>S/ {resumen.digital.toFixed(2)}</span>
          </div>
          <div style={s.statCard('#10b981')}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>TOTAL DEL DÍA</span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>S/ {totalDia.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Movimientos */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Movimientos</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="#64748b" />
              <input type="date" style={{ ...s.input, width: '150px' }} value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} />
            </div>
          </div>
          {caja?.estado === 'Abierta' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={s.button('#10b981')} onClick={() => { setMovForm({ ...movForm, tipo: 'Ingreso' }); setShowMovimientoModal(true); }}><Plus size={18}/> Registrar Ingreso</button>
              <button style={s.button('#ef4444')} onClick={() => { setMovForm({ ...movForm, tipo: 'Egreso' }); setShowMovimientoModal(true); }}><Minus size={18}/> Registrar Egreso</button>
            </div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Hora</th>
                <th style={s.th}>Tipo</th>
                <th style={s.th}>Descripción</th>
                <th style={s.th}>Forma de Pago</th>
                <th style={s.th}>Monto</th>
                <th style={s.th}>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m, i) => (
                <tr key={i}>
                  <td style={s.td}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14}/> {new Date(m.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></td>
                  <td style={s.td}>{m.tipo}</td>
                  <td style={s.td}>{m.descripcion}</td>
                  <td style={s.td}>{m.forma_pago}</td>
                  <td style={{ ...s.td, fontWeight: 'bold', color: ['Venta', 'Ingreso'].includes(m.tipo) ? '#10b981' : '#ef4444' }}>
                    {['Venta', 'Ingreso'].includes(m.tipo) ? '+' : '-'} S/ {m.monto.toFixed(2)}
                  </td>
                  <td style={s.td}>{m.usuario}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No hay movimientos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totales al pie */}
        <div style={{ padding: '24px', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, display: 'flex', justifyContent: 'flex-end', gap: '48px', marginTop: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>TOTAL INGRESOS</span>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>S/ {(resumen.efectivo + resumen.ingresos).toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>TOTAL EGRESOS</span>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>S/ {resumen.egresos.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>SALDO EN CAJA (EFECTIVO)</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#3b82f6' }}>S/ {saldoCaja.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Modal Abrir Caja */}
      {showAbrirModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Apertura de Caja</h2>
              <button onClick={() => setShowAbrirModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleAbrir}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>MONTO INICIAL EN EFECTIVO (S/)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input required type="number" step="0.01" style={{ ...s.input, paddingLeft: '40px' }} value={abrirForm.monto_inicial} onChange={e => setAbrirForm({...abrirForm, monto_inicial: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>OBSERVACIONES</label>
                <textarea style={{ ...s.input, height: '80px', resize: 'none' }} value={abrirForm.observaciones} onChange={e => setAbrirForm({...abrirForm, observaciones: e.target.value})} placeholder="Opcional..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowAbrirModal(false)} style={s.btnGhost}>Cancelar</button>
                <button type="submit" style={s.button('#10b981')}><Check size={18}/> Iniciar Jornada</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cerrar Caja */}
      {showCerrarModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Cierre de Caja</h2>
              <button onClick={() => setShowCerrarModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>
            <div style={{ marginBottom: '24px', backgroundColor: isDark ? '#0f1729' : '#F8FAFC', padding: '16px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><span style={{ fontSize: '11px', color: '#64748b' }}>Monto Esperado (Efectivo):</span><div style={{ fontWeight: 'bold', fontSize: '18px' }}>S/ {saldoCaja.toFixed(2)}</div></div>
              <div><span style={{ fontSize: '11px', color: '#64748b' }}>Ventas Digitales:</span><div style={{ fontWeight: 'bold', fontSize: '18px' }}>S/ {resumen.digital.toFixed(2)}</div></div>
            </div>
            <form onSubmit={handleCerrar}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>MONTO EFECTIVO CONTADO FÍSICAMENTE (S/)</label>
                <input required type="number" step="0.01" style={s.input} value={cerrarForm.monto_contado} onChange={e => setCerrarForm({...cerrarForm, monto_contado: e.target.value})} placeholder="0.00" />
              </div>
              {cerrarForm.monto_contado && (
                <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: (parseFloat(cerrarForm.monto_contado) - saldoCaja) === 0 ? '#052e16' : '#450a0a', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px' }}>Diferencia:</span>
                  <span style={{ fontWeight: 'bold' }}>S/ {(parseFloat(cerrarForm.monto_contado) - saldoCaja).toFixed(2)}</span>
                </div>
              )}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>OBSERVACIONES</label>
                <textarea style={{ ...s.input, height: '80px', resize: 'none' }} value={cerrarForm.observaciones} onChange={e => setCerrarForm({...cerrarForm, observaciones: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowCerrarModal(false)} style={s.btnGhost}>Cancelar</button>
                <button type="submit" style={s.button('#ef4444')}><FileText size={18}/> Cerrar y Generar Reporte</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Movimiento (Ingreso/Egreso) */}
      {showMovimientoModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Registrar {movForm.tipo}</h2>
              <button onClick={() => setShowMovimientoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleMovimiento}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CATEGORÍA</label>
                  <select style={s.input} value={movForm.categoria} onChange={e => setMovForm({...movForm, categoria: e.target.value})}>
                    <option>Venta</option>
                    <option>Compra</option>
                    <option>Gasto operativo</option>
                    <option>Préstamo</option>
                    <option>Ajuste</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>FORMA DE PAGO</label>
                  <select style={s.input} value={movForm.forma_pago} onChange={e => setMovForm({...movForm, forma_pago: e.target.value})}>
                    <option>Efectivo</option>
                    <option>Tarjeta</option>
                    <option>Yape</option>
                    <option>Plin</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>MONTO (S/)</label>
                <input required type="number" step="0.01" style={s.input} value={movForm.monto} onChange={e => setMovForm({...movForm, monto: e.target.value})} placeholder="0.00" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>DESCRIPCIÓN / MOTIVO</label>
                <input required style={s.input} value={movForm.descripcion} onChange={e => setMovForm({...movForm, descripcion: e.target.value})} placeholder="Ej: Pago de luz, Ajuste de caja..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowMovimientoModal(false)} style={s.btnGhost}>Cancelar</button>
                <button type="submit" style={s.button(movForm.tipo === 'Ingreso' ? '#10b981' : '#ef4444')}><Check size={18}/> Guardar {movForm.tipo}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reporte Cierre */}
      {showReporteModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>Reporte de Cierre</h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{new Date().toLocaleString()}</p>
            </div>
            <div style={{ borderTop: '1px dashed #64748b', borderBottom: '1px dashed #64748b', padding: '16px 0', marginBottom: '24px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Ventas Efectivo:</span><span>S/ {resumen.efectivo.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Ventas Tarjeta:</span><span>S/ {resumen.tarjeta.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Ventas Yape/Plin:</span><span>S/ {resumen.digital.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>(+) Ingresos:</span><span>S/ {resumen.ingresos.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span>(-) Egresos:</span><span>S/ {resumen.egresos.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}><span>SALDO FINAL:</span><span>S/ {saldoCaja.toFixed(2)}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ ...s.button('#3b82f6'), flex: 1 }} onClick={() => window.print()}><Printer size={18}/> Imprimir</button>
              <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => setShowReporteModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caja;
