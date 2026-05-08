import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart2, Calendar, Filter, Download, Eye, 
  Printer, X, Search, RefreshCw, ChevronLeft, 
  ChevronRight, TrendingUp, ShoppingBag, Users, FileText
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const ReporteVentas = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState({ hoy: 0, mes: 0, ticketPromedio: 0, totalTransacciones: 0 });
  const [vendedores, setVendedores] = useState([]);
  const [comprobantes, setComprobantes] = useState([]);

  // Filtros
  const [filtros, setFiltros] = useState({
    desde: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
    tipo: 'Todos',
    usuario: 'Todos'
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);

  // --- Estilos ---
  const s = {
    container: { backgroundColor: isDark ? '#0f1729' : '#F8FAFC', minHeight: '100%', padding: '24px', color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'system-ui, sans-serif', transition: 'all 0.2s' },
    card: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '16px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, padding: '20px', marginBottom: '24px' },
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
    badge: (bg, text) => ({ backgroundColor: bg, color: text, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '20px', width: '95%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    chartContainer: { height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px 0', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }
  };

  // --- Lógica de Datos ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const query = `desde=${filtros.desde}&hasta=${filtros.hasta}&tipo=${filtros.tipo}&usuario=${filtros.usuario}`;
      const [ventasRes, resumenRes, comprobantesRes] = await Promise.all([
        axios.get(`${API_BASE}/ventas?${query}`),
        axios.get(`${API_BASE}/ventas/resumen`),
        axios.get(`${API_BASE}/ventas/comprobantes`)
      ]);
      
      setVentas(Array.isArray(ventasRes.data) ? ventasRes.data : []);
      setResumen(resumenRes.data || { hoy: 0, mes: 0, ticketPromedio: 0, totalTransacciones: 0 });
      setComprobantes(comprobantesRes.data || []);
      
      // Extraer vendedores únicos
      const vend = [...new Set(ventasRes.data.map(v => v.vendedor))].filter(Boolean);
      setVendedores(vend);
      
      setError(null);
    } catch (err) {
      setError('Error al cargar reporte de ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerDetalle = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/ventas/${id}`);
      setSelectedVenta(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert('Error al cargar detalle de venta');
    }
  };

  const handleExportarPDF = () => {
    alert('Función de exportación PDF en desarrollo');
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVentas = ventas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ventas.length / itemsPerPage);

  // Totales
  const subtotalTotal = ventas.reduce((acc, v) => acc + (v.total / 1.18), 0);
  const igvTotal = ventas.reduce((acc, v) => acc + (v.total - (v.total / 1.18)), 0);
  const granTotal = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

  // Datos para el gráfico simple
  const dailyVentas = ventas.reduce((acc, v) => {
    const date = new Date(v.fecha_hora).toLocaleDateString();
    acc[date] = (acc[date] || 0) + v.total;
    return acc;
  }, {});
  const maxVenta = Math.max(...Object.values(dailyVentas), 1);

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: '4px' }}>Reporte de Ventas</h1>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · ANÁLISIS DE VENTAS</p>
      </div>

      {/* Tarjetas Resumen */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={s.statCard('#3b82f6')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENTAS DEL DÍA</span>
          <span style={{ fontSize: '24px', fontWeight: '900' }}>S/ {resumen.hoy?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={s.statCard('#10b981')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENTAS DEL MES</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>S/ {resumen.mes?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={s.statCard('#f59e0b')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>TICKET PROMEDIO</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>S/ {resumen.ticketPromedio?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={s.statCard('#6366f1')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>TOTAL TRANSACCIONES</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#6366f1' }}>{resumen.totalTransacciones}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>DESDE</label>
            <input type="date" style={s.input} value={filtros.desde} onChange={e => setFiltros({...filtros, desde: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>HASTA</label>
            <input type="date" style={s.input} value={filtros.hasta} onChange={e => setFiltros({...filtros, hasta: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>COMPROBANTE</label>
            <select style={s.input} value={filtros.tipo} onChange={e => setFiltros({...filtros, tipo: e.target.value})}>
              <option>Todos</option>
              {comprobantes.map(c => <option key={c.id_tipo_comprobante}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>VENDEDOR</label>
            <select style={s.input} value={filtros.usuario} onChange={e => setFiltros({...filtros, usuario: e.target.value})}>
              <option>Todos</option>
              {vendedores.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.button('#3b82f6')} onClick={fetchData}><Filter size={18}/> Filtrar</button>
            <button style={s.button('#10b981')} onClick={handleExportarPDF}><Download size={18}/> PDF</button>
          </div>
        </div>
      </div>

      {/* Gráfico Simple */}
      <div style={s.card}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="#3b82f6" /> VENTAS POR DÍA
        </h3>
        <div style={s.chartContainer}>
          {Object.entries(dailyVentas).map(([date, amount]) => (
            <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '100%', 
                height: `${(amount / maxVenta) * 150}px`, 
                backgroundColor: '#3b82f6', 
                borderRadius: '4px 4px 0 0',
                position: 'relative'
              }} title={`S/ ${amount.toFixed(2)}`}>
                <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 'bold' }}>
                  {amount > 0 && `S/ ${Math.round(amount)}`}
                </div>
              </div>
              <span style={{ fontSize: '9px', color: '#64748b', transform: 'rotate(-45deg)', marginTop: '10px' }}>{date.split('/')[0]}/{date.split('/')[1]}</span>
            </div>
          ))}
          {Object.keys(dailyVentas).length === 0 && (
            <div style={{ width: '100%', textAlign: 'center', color: '#64748b' }}>No hay datos para el gráfico</div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={32} /></div>
        ) : (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>N° Comprobante</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Cliente</th>
                  <th style={s.th}>Productos</th>
                  <th style={s.th}>Subtotal</th>
                  <th style={s.th}>IGV</th>
                  <th style={s.th}>Total</th>
                  <th style={s.th}>Vendedor</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {currentVentas.map(v => (
                  <tr key={v.id_venta}>
                    <td style={s.td}>{new Date(v.fecha_hora).toLocaleDateString()}</td>
                    <td style={s.td}><span style={{ fontWeight: 'bold' }}>{v.serie_documento}-{v.numero_documento}</span></td>
                    <td style={s.td}>{v.tipo_comprobante}</td>
                    <td style={s.td}>{v.cliente_nombre || 'Público General'}</td>
                    <td style={s.td}>{v.cantidad_items}</td>
                    <td style={s.td}>S/ {(v.total / 1.18).toFixed(2)}</td>
                    <td style={s.td}>S/ {(v.total - (v.total / 1.18)).toFixed(2)}</td>
                    <td style={s.td}><span style={{ fontWeight: 'bold', color: '#10b981' }}>S/ {v.total?.toFixed(2)}</span></td>
                    <td style={s.td}>{v.vendedor}</td>
                    <td style={s.td}>
                      <button style={s.btnGhost} onClick={() => handleVerDetalle(v.id_venta)}><Eye size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales al pie */}
            <div style={{ padding: '20px', backgroundColor: isDark ? '#0f1729' : '#F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '40px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>SUBTOTAL TOTAL</span>
                <div style={{ fontSize: '18px', fontWeight: '900' }}>S/ {subtotalTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>IGV TOTAL</span>
                <div style={{ fontSize: '18px', fontWeight: '900' }}>S/ {igvTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>GRAN TOTAL</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>S/ {granTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Paginación */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, ventas.length)} de {ventas.length} registros</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={s.btnGhost} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><ChevronLeft size={18}/></button>
                <button style={s.btnGhost} disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}><ChevronRight size={18}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detalle */}
      {showDetailModal && selectedVenta && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Detalle de Venta</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', backgroundColor: isDark ? '#0f1729' : '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>FECHA</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{new Date(selectedVenta.fecha_hora).toLocaleString()}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>COMPROBANTE</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenta.serie_documento}-{selectedVenta.numero_documento}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>CLIENTE</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenta.cliente_nombre || 'Público General'}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>VENDEDOR</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedVenta.vendedor}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                  <th style={{ ...s.th, padding: '8px' }}>Producto</th>
                  <th style={{ ...s.th, padding: '8px', textAlign: 'center' }}>Cant.</th>
                  <th style={{ ...s.th, padding: '8px', textAlign: 'right' }}>Precio U.</th>
                  <th style={{ ...s.th, padding: '8px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedVenta.detalle.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                    <td style={{ ...s.td, padding: '8px' }}>{item.nombre_comercial}</td>
                    <td style={{ ...s.td, padding: '8px', textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ ...s.td, padding: '8px', textAlign: 'right' }}>S/ {item.precio_unitario?.toFixed(2)}</td>
                    <td style={{ ...s.td, padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>S/ {item.subtotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '40px', fontSize: '13px', color: '#64748b' }}><span>Subtotal:</span><span>S/ {(selectedVenta.total / 1.18).toFixed(2)}</span></div>
              <div style={{ display: 'flex', gap: '40px', fontSize: '13px', color: '#64748b' }}><span>IGV (18%):</span><span>S/ {(selectedVenta.total - (selectedVenta.total / 1.18)).toFixed(2)}</span></div>
              <div style={{ display: 'flex', gap: '40px', fontSize: '20px', fontWeight: '900', color: '#10b981' }}><span>TOTAL:</span><span>S/ {selectedVenta.total?.toFixed(2)}</span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button style={s.button('#6366f1')} onClick={() => window.print()}><Printer size={18}/> Imprimir</button>
              <button style={s.btnGhost} onClick={() => setShowDetailModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteVentas;
