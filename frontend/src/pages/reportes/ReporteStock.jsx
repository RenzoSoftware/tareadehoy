import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Filter, Download, Package, AlertTriangle, 
  RefreshCw, ChevronLeft, ChevronRight, Search, 
  TrendingUp, BarChart2, List, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const ReporteStock = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [productos, setProductos] = useState([]);
  const [sinMovimiento, setSinMovimiento] = useState([]);
  const [resumen, setResumen] = useState({ total: 0, normal: 0, critico: 0, sinStock: 0 });
  const [catalogos, setCatalogos] = useState({ categorias: [], laboratorios: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    categoria: 'Todos',
    estado: 'Todos',
    laboratorio: 'Todos'
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Estilos ---
  const s = {
    container: { backgroundColor: isDark ? '#0f1729' : '#F8FAFC', minHeight: '100%', padding: '24px', color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'system-ui, sans-serif', transition: 'all 0.2s' },
    card: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '16px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, padding: '20px', marginBottom: '24px' },
    statCard: (color, borderColor) => ({
      backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
      borderRadius: '16px',
      border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
      padding: '20px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      borderLeft: `4px solid ${borderColor || color}`
    }),
    input: { backgroundColor: isDark ? '#0f1729' : '#F8FAFC', border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`, borderRadius: '8px', padding: '10px 12px', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '14px', outline: 'none', width: '100%' },
    button: (bg = '#3b82f6') => ({ backgroundColor: bg, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s' }),
    btnGhost: { backgroundColor: 'transparent', color: isDark ? '#94a3b8' : '#64748b', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    td: { padding: '14px 16px', fontSize: '13px', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    badge: (bg, text) => ({ backgroundColor: bg, color: text, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' }),
    progressBar: (width, color) => ({
      width: '100%',
      height: '6px',
      backgroundColor: isDark ? '#0f1729' : '#F1F5F9',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '4px'
    }),
    progressFill: (width, color) => ({
      width: `${Math.min(width, 100)}%`,
      height: '100%',
      backgroundColor: color,
      transition: 'width 0.3s ease'
    })
  };

  // --- Lógica de Datos ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const query = `categoria=${filtros.categoria}&estado=${filtros.estado}&laboratorio=${filtros.laboratorio}`;
      const [prodRes, sinMovRes, resumenRes, catalogosRes] = await Promise.all([
        axios.get(`${API_BASE}/productos?${query}`),
        axios.get(`${API_BASE}/productos/sin-movimiento`),
        axios.get(`${API_BASE}/productos/resumen-stock`),
        axios.get(`${API_BASE}/productos/catalogos`)
      ]);

      setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);
      setSinMovimiento(Array.isArray(sinMovRes.data) ? sinMovRes.data : []);
      setResumen(resumenRes.data || { total: 0, normal: 0, critico: 0, sinStock: 0 });
      setCatalogos(catalogosRes.data || { categorias: [], laboratorios: [] });
      
      setError(null);
    } catch (err) {
      setError('Error al cargar reporte de stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportarPDF = () => {
    alert('Función de exportación PDF en desarrollo');
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductos = productos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productos.length / itemsPerPage);

  // Totales al pie
  const valorCompraTotal = productos.reduce((acc, p) => acc + ((p.stock_total || 0) * (p.precio_compra || 0)), 0);
  const valorVentaTotal = productos.reduce((acc, p) => acc + ((p.stock_total || 0) * (p.precio_venta || 0)), 0);

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: '4px' }}>Reporte de Stock</h1>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · CONTROL DE INVENTARIO</p>
      </div>

      {/* Tarjetas Resumen */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={s.statCard('#3b82f6')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>TOTAL PRODUCTOS</span>
          <span style={{ fontSize: '24px', fontWeight: '900' }}>{resumen.total}</span>
        </div>
        <div style={s.statCard('#10b981')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>STOCK NORMAL</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{resumen.normal}</span>
        </div>
        <div style={s.statCard('#ef4444')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>STOCK CRÍTICO</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{resumen.critico}</span>
        </div>
        <div style={s.statCard('#450a0a', '#ef4444')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>SIN STOCK</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{resumen.sinStock}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CATEGORÍA</label>
            <select style={s.input} value={filtros.categoria} onChange={e => setFiltros({...filtros, categoria: e.target.value})}>
              <option>Todos</option>
              {catalogos.categorias.map(c => <option key={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>ESTADO STOCK</label>
            <select style={s.input} value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}>
              <option>Todos</option>
              <option>Normal</option>
              <option>Crítico</option>
              <option>Sin stock</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>LABORATORIO</label>
            <select style={s.input} value={filtros.laboratorio} onChange={e => setFiltros({...filtros, laboratorio: e.target.value})}>
              <option>Todos</option>
              {catalogos.laboratorios.map(l => <option key={l.id}>{l.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.button('#3b82f6')} onClick={fetchData}><Filter size={18}/> Filtrar</button>
            <button style={s.button('#10b981')} onClick={handleExportarPDF}><Download size={18}/> PDF</button>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={32} /></div>
        ) : (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Código</th>
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>Categoría</th>
                  <th style={s.th}>Laboratorio</th>
                  <th style={s.th}>Stock</th>
                  <th style={s.th}>P. Compra</th>
                  <th style={s.th}>P. Venta</th>
                  <th style={s.th}>Margen (%)</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}>Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {currentProductos.map(p => {
                  const stockTotal = p.stock_total || 0;
                  const stockMin = p.stock_minimo || 5;
                  const pct = (stockTotal / (stockMin * 3)) * 100;
                  const color = stockTotal <= 0 ? '#ef4444' : stockTotal <= stockMin ? '#f59e0b' : '#10b981';
                  const margen = p.precio_compra > 0 ? ((p.precio_venta - p.precio_compra) / p.precio_compra) * 100 : 0;

                  return (
                    <tr key={p.id_producto}>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#64748b' }}>#{p.id_producto}</span></td>
                      <td style={s.td}>
                        <div style={{ fontWeight: 'bold' }}>{p.nombre_comercial}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.principio_activo}</div>
                      </td>
                      <td style={s.td}>{p.nombre_categoria}</td>
                      <td style={s.td}>{p.nombre_laboratorio}</td>
                      <td style={s.td}>
                        <div style={{ fontWeight: 'bold' }}>{stockTotal} <span style={{ fontSize: '10px', color: '#64748b' }}>/ {stockMin}</span></div>
                        <div style={s.progressBar()}>
                          <div style={s.progressFill(pct, color)}></div>
                        </div>
                      </td>
                      <td style={s.td}>S/ {p.precio_compra?.toFixed(2)}</td>
                      <td style={s.td}>S/ {p.precio_venta?.toFixed(2)}</td>
                      <td style={s.td}><span style={{ color: margen > 20 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{margen.toFixed(1)}%</span></td>
                      <td style={s.td}>
                        {stockTotal <= 0 ? (
                          <span style={s.badge('#450a0a', '#f87171')}>SIN STOCK</span>
                        ) : stockTotal <= stockMin ? (
                          <span style={s.badge('#422006', '#f59e0b')}>CRÍTICO</span>
                        ) : (
                          <span style={s.badge('#052e16', '#4ade80')}>NORMAL</span>
                        )}
                      </td>
                      <td style={s.td}>{p.proximo_vencimiento ? new Date(p.proximo_vencimiento).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totales al pie */}
            <div style={{ padding: '20px', backgroundColor: isDark ? '#0f1729' : '#F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '40px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>VALOR INVENTARIO (P. COMPRA)</span>
                <div style={{ fontSize: '18px', fontWeight: '900' }}>S/ {valorCompraTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>VALOR INVENTARIO (P. VENTA)</span>
                <div style={{ fontSize: '18px', fontWeight: '900' }}>S/ {valorVentaTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Paginación */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, productos.length)} de {productos.length} productos</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={s.btnGhost} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><ChevronLeft size={18}/></button>
                <button style={s.btnGhost} disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}><ChevronRight size={18}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Productos sin movimiento */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="#f59e0b" /> PRODUCTOS SIN MOVIMIENTO (ÚLTIMOS 30 DÍAS)
        </h3>
        <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Nombre</th>
                <th style={s.th}>Categoría</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>Último Movimiento</th>
                <th style={s.th}>Días sin venta</th>
              </tr>
            </thead>
            <tbody>
              {sinMovimiento.length > 0 ? sinMovimiento.map(p => (
                <tr key={p.id_producto}>
                  <td style={s.td}><span style={{ fontWeight: 'bold' }}>{p.nombre_comercial}</span></td>
                  <td style={s.td}>{p.nombre_categoria}</td>
                  <td style={s.td}>{p.stock_total}</td>
                  <td style={s.td}>{p.ultima_venta ? new Date(p.ultima_venta).toLocaleDateString() : 'Nunca vendido'}</td>
                  <td style={s.td}><span style={{ color: '#ef4444', fontWeight: 'bold' }}>{p.dias_sin_venta || '30+'} días</span></td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No se encontraron productos sin movimiento</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReporteStock;
