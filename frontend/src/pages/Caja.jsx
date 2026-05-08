import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Edit2, Trash2, Eye, Search, Check, X, Plus, Minus, 
  FileText, Printer, DollarSign, TrendingUp, TrendingDown, RefreshCw, Lock, Unlock 
} from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';

const Caja = ({ user }) => {
  const [caja, setCaja] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 2705 Usar fecha LOCAL (no UTC) para evitar desfase de zona horaria (Per00fa = UTC-5)
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [fecha, setFecha] = useState(getLocalDate());
  
  // Modales
  const [showAbrir, setShowAbrir] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showMov, setShowMov] = useState(false);
  const [showReporte, setShowReporte] = useState(false);
  const [reporteData, setReporteData] = useState(null);

  // Configuración de headers para axios
   const config = {
     headers: {
       'x-user-id': user?.id_usuario,
       'x-user-role': user?.cargo
     }
   };

  // Form states
  const [montoInicial, setMontoInicial] = useState('');
  const [obsAbrir, setObsAbrir] = useState('');
  const [montoContado, setMontoContado] = useState('');
  const [obsCerrar, setObsCerrar] = useState('');
  const [movForm, setMovForm] = useState({
    tipo: 'INGRESO',
    categoria: 'Venta',
    monto: '',
    descripcion: '',
    forma_pago: 'EFECTIVO'
  });

  const fetchCaja = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/caja/hoy`, config);
      setCaja(res.data);
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMovimientos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/caja/movimientos?fecha=${fecha}`, config);
      setMovimientos(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [fecha, user]);

  useEffect(() => {
    if (user) {
      fetchCaja();
      fetchMovimientos();
    }
  }, [fetchCaja, fetchMovimientos, user]);

  const handleAbrir = async () => {
    try {
      await axios.post(`${API_BASE}/caja/abrir`, {
        monto_inicial: parseFloat(montoInicial),
        observaciones: obsAbrir,
        id_usuario: user?.id_usuario
      }, config);
      setShowAbrir(false);
      fetchCaja();
    } catch (err) {
      alert('Error al abrir caja');
    }
  };

  const handleCerrar = async () => {
    try {
      await axios.post(`${API_BASE}/caja/cerrar`, {
        monto_contado: parseFloat(montoContado),
        observaciones: obsCerrar
      }, config);
      setShowCerrar(false);
      fetchCaja();
      // Mostrar reporte
      const rep = await axios.get(`${API_BASE}/caja/reporte?fecha=${getLocalDate()}`, config);
      setReporteData(rep.data);
      setShowReporte(true);
    } catch (err) {
      alert('Error al cerrar caja');
    }
  };

  const handleMovimiento = async () => {
    try {
      await axios.post(`${API_BASE}/caja/movimiento`, {
        ...movForm,
        monto: parseFloat(movForm.monto),
        id_usuario: user?.id_usuario
      }, config);
      setShowMov(false);
      fetchMovimientos();
      fetchCaja();
    } catch (err) {
      alert('Error al registrar movimiento');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#0f1729' }}>
      <RefreshCw size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
    </div>
  );

  if (error) return (
    <div style={{ color: '#f87171', padding: '2rem', textAlign: 'center', background: '#0f1729', height: '100%' }}>
      {error}
    </div>
  );

  const saldoCalculado = caja?.estado === 'Abierta' 
    ? (parseFloat(caja.monto_inicial) + parseFloat(caja.resumen?.total_ingresos || 0) - parseFloat(caja.resumen?.total_egresos || 0))
    : 0;

  const diferencia = parseFloat(montoContado || 0) - saldoCalculado;

  return (
    <div style={{ padding: '2rem', background: '#0f1729', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '900', margin: 0 }}>Caja del Día</h1>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
            BOTICA NOVA SALUD · CONTROL DE CAJA
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <Search size={16} style={{ color: '#64748b' }} />
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          {caja?.estado === 'Abierta' ? (
            <button 
              onClick={() => setShowCerrar(true)}
              style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <Lock size={18} /> CERRAR CAJA
            </button>
          ) : (
            <button 
              onClick={() => setShowAbrir(true)}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <Unlock size={18} /> ABRIR CAJA
            </button>
          )}
        </div>
      </div>

      {/* Estado Caja */}
      <div style={{ 
        background: caja?.estado === 'Abierta' ? '#052e16' : '#450a0a', 
        border: `1px solid ${caja?.estado === 'Abierta' ? '#166534' : '#7f1d1d'}`,
        padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h2 style={{ color: caja?.estado === 'Abierta' ? '#4ade80' : '#f87171', margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>
            {caja?.estado === 'Abierta' ? 'Caja Abierta' : 'Caja Cerrada'}
          </h2>
          {caja?.estado === 'Abierta' && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#e2e8f0' }}>
              Apertura: {new Date(caja.fecha_apertura).toLocaleTimeString()} · Monto inicial: S/ {caja.monto_inicial}
            </p>
          )}
        </div>
        <TrendingUp size={32} style={{ color: caja?.estado === 'Abierta' ? '#4ade80' : '#f87171', opacity: 0.5 }} />
      </div>

      {/* Resumen Cards */}
      {caja?.estado === 'Abierta' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Ventas Efectivo', val: caja.resumen?.ventas_efectivo || 0, color: '#3b82f6' },
            { label: 'Ventas Tarjeta', val: caja.resumen?.ventas_tarjeta || 0, color: '#8b5cf6' },
            { label: 'Ventas Digital', val: caja.resumen?.ventas_digital || 0, color: '#06b6d4' },
            { label: 'Total del Día', val: (parseFloat(caja.resumen?.total_ingresos || 0) - parseFloat(caja.resumen?.total_egresos || 0)), color: '#10b981' }
          ].map((card, i) => (
            <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{card.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '900', color: card.color, margin: 0 }}>S/ {parseFloat(card.val).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla Movimientos */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900' }}>Movimientos del día</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => { setMovForm({...movForm, tipo: 'INGRESO'}); setShowMov(true); }} style={{ background: '#052e16', color: '#4ade80', border: '1px solid #166534', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Plus size={16} /> Ingreso
            </button>
            <button onClick={() => { setMovForm({...movForm, tipo: 'EGRESO'}); setShowMov(true); }} style={{ background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Minus size={16} /> Egreso
            </button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Hora</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Tipo</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Descripción</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Pago</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Monto</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(m.fecha_hora).toLocaleTimeString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    fontSize: '0.625rem', fontWeight: '900', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', textTransform: 'uppercase',
                    background: m.tipo === 'INGRESO' ? '#052e16' : '#450a0a',
                    color: m.tipo === 'INGRESO' ? '#4ade80' : '#f87171'
                  }}>{m.tipo}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{m.descripcion}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{m.forma_pago}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '900', color: m.tipo === 'INGRESO' ? '#4ade80' : '#f87171' }}>
                  {m.tipo === 'INGRESO' ? '+' : '-'} S/ {parseFloat(m.monto).toFixed(2)}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{m.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {(showAbrir || showCerrar || showMov || showReporte) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', position: 'relative' }}>
            <button onClick={() => { setShowAbrir(false); setShowCerrar(false); setShowMov(false); setShowReporte(false); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X /></button>
            
            {showAbrir && (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>Abrir Caja</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Monto inicial (S/)</label>
                    <input type="number" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem', color: 'white', outline: 'none' }} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Observaciones</label>
                    <textarea value={obsAbrir} onChange={(e) => setObsAbrir(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem', color: 'white', outline: 'none', minHeight: '100px' }} />
                  </div>
                  <button onClick={handleAbrir} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.75rem', fontWeight: '900', marginTop: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Check /> CONFIRMAR APERTURA</button>
                </div>
              </>
            )}

            {showCerrar && (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>Cerrar Caja</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '1rem', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Saldo en Sistema:</span> <span style={{ fontWeight: '900' }}>S/ {saldoCalculado.toFixed(2)}</span></div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Efectivo en Caja (Físico)</label>
                    <input type="number" value={montoContado} onChange={(e) => setMontoContado(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem', color: 'white', outline: 'none' }} placeholder="0.00" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '1rem', background: diferencia === 0 ? '#052e16' : '#450a0a' }}>
                    <span style={{ fontWeight: '700' }}>Diferencia:</span>
                    <span style={{ fontWeight: '900', color: diferencia === 0 ? '#4ade80' : '#f87171' }}>S/ {diferencia.toFixed(2)}</span>
                  </div>
                  <button onClick={handleCerrar} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.75rem', fontWeight: '900', marginTop: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><FileText /> CERRAR Y GENERAR REPORTE</button>
                </div>
              </>
            )}

            {showMov && (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>{movForm.tipo === 'INGRESO' ? 'Registrar Ingreso' : 'Registrar Egreso'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Categoría</label>
                      <select value={movForm.categoria} onChange={(e) => setMovForm({...movForm, categoria: e.target.value})} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem', color: 'white' }}>
                        <option>Venta</option><option>Compra</option><option>Gasto operativo</option><option>Préstamo</option><option>Ajuste</option><option>Otro</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Monto (S/)</label>
                      <input type="number" value={movForm.monto} onChange={(e) => setMovForm({...movForm, monto: e.target.value})} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem', color: 'white', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Descripción</label>
                    <input type="text" value={movForm.descripcion} onChange={(e) => setMovForm({...movForm, descripcion: e.target.value})} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem', color: 'white', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Forma de Pago</label>
                    <select value={movForm.forma_pago} onChange={(e) => setMovForm({...movForm, forma_pago: e.target.value})} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem', color: 'white' }}>
                      <option>EFECTIVO</option><option>TARJETA</option><option>YAPE</option><option>PLIN</option>
                    </select>
                  </div>
                  <button onClick={handleMovimiento} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.75rem', fontWeight: '900', marginTop: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Check /> GUARDAR</button>
                </div>
              </>
            )}

            {showReporte && reporteData && (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem', textAlign: 'center' }}>Reporte de Cierre</h2>
                <div style={{ background: 'white', color: 'black', padding: '1.5rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '0 0 1rem 0' }}>BOTICA NOVA SALUD<br/>REPORTE DE CIERRE</p>
                  <hr style={{ border: 'none', borderTop: '1px dashed black', margin: '1rem 0' }} />
                  <p>Fecha: {new Date(reporteData.fecha_apertura).toLocaleDateString()}</p>
                  <p>Usuario: {reporteData.usuario_apertura}</p>
                  <hr style={{ border: 'none', borderTop: '1px dashed black', margin: '1rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Apertura:</span> <span>S/ {parseFloat(reporteData.monto_inicial).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ventas Efectivo:</span> <span>S/ {parseFloat(reporteData.ventas_efectivo || 0).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ventas Tarjeta:</span> <span>S/ {parseFloat(reporteData.ventas_tarjeta || 0).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ventas Digital:</span> <span>S/ {parseFloat(reporteData.ventas_digital || 0).toFixed(2)}</span></div>
                  <hr style={{ border: 'none', borderTop: '1px dashed black', margin: '1rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>Total Ingresos:</span> <span>S/ {parseFloat(reporteData.total_ingresos || 0).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>Total Egresos:</span> <span>S/ {parseFloat(reporteData.total_egresos || 0).toFixed(2)}</span></div>
                  <hr style={{ border: 'none', borderTop: '1px dashed black', margin: '1rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold' }}><span>Saldo Final:</span> <span>S/ {(parseFloat(reporteData.monto_inicial) + parseFloat(reporteData.total_ingresos || 0) - parseFloat(reporteData.total_egresos || 0)).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Efectivo Contado:</span> <span>S/ {parseFloat(reporteData.monto_final || 0).toFixed(2)}</span></div>
                </div>
                <button onClick={() => window.print()} style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.75rem', fontWeight: '900', marginTop: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Printer /> IMPRIMIR CIERRE</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Caja;
