import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Filter, Download, AlertTriangle, 
  RefreshCw, ChevronLeft, ChevronRight, XCircle, 
  Check, X, Search, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const Vencimientos = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [productos, setProductos] = useState([]);
  const [resumen, setResumen] = useState({ vencidos: 0, vencen7: 0, vencen30: 0, vencen90: 0 });
  const [catalogos, setCatalogos] = useState({ categorias: [], laboratorios: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Por Vencer');

  // Filtros
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    categoria: 'Todos',
    laboratorio: 'Todos'
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Baja
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bajaForm, setBajaForm] = useState({ motivo: 'Vencido', cantidad: 1, observaciones: '' });

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
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: (active) => ({
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      backgroundColor: active ? '#3b82f6' : (isDark ? '#1e293b' : '#FFFFFF'),
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
      border: `1px solid ${active ? '#3b82f6' : (isDark ? '#334155' : '#E2E8F0')}`,
      transition: 'all 0.2s'
    }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '20px', width: '95%', maxWidth: '500px', padding: '32px', position: 'relative', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }
  };

  // --- Lógica de Datos ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const query = `desde=${filtros.desde}&hasta=${filtros.hasta}&categoria=${filtros.categoria}&laboratorio=${filtros.laboratorio}`;
      const [prodRes, resumenRes, catalogosRes] = await Promise.all([
        axios.get(`${API_BASE}/productos/vencimientos?${query}`),
        axios.get(`${API_BASE}/productos/resumen-vencimientos`),
        axios.get(`${API_BASE}/productos/catalogos`)
      ]);

      setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);
      setResumen(resumenRes.data || { vencidos: 0, vencen7: 0, vencen30: 0, vencen90: 0 });
      setCatalogos(catalogosRes.data || { categorias: [], laboratorios: [] });
      
      setError(null);
    } catch (err) {
      setError('Error al cargar control de vencimientos');
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

  const handleBaja = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/productos/${selectedProduct.id_producto}/baja`, bajaForm);
      alert('Baja procesada con éxito');
      setShowBajaModal(false);
      fetchData();
    } catch (err) {
      alert('Error al procesar baja');
    }
  };

  // Filtrado por Tab
  const filteredItems = productos.filter(p => {
    if (activeTab === 'Ya Vencidos') return p.dias_restantes <= 0;
    return p.dias_restantes > 0;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductos = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const getBadgeStyle = (dias) => {
    if (dias <= 0) return { bg: '#450a0a', text: '#f87171', label: 'VENCIDO' };
    if (dias <= 7) return { bg: '#450a0a', text: '#fca5a5', label: 'CRÍTICO' };
    if (dias <= 30) return { bg: '#422006', text: '#f59e0b', label: 'PRÓXIMO' };
    if (dias <= 90) return { bg: '#422006', text: '#fbbf24', label: 'ALERTA' };
    return { bg: '#052e16', text: '#4ade80', label: 'SEGURO' };
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: '4px' }}>Control de Vencimientos</h1>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · ALERTAS DE CADUCIDAD</p>
      </div>

      {/* Tarjetas Resumen */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={s.statCard('#ef4444')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENCIDOS</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{resumen.vencidos}</span>
        </div>
        <div style={s.statCard('#f87171')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENCEN EN 7 DÍAS</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#f87171' }}>{resumen.vencen7}</span>
        </div>
        <div style={s.statCard('#f59e0b')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENCEN EN 30 DÍAS</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{resumen.vencen30}</span>
        </div>
        <div style={s.statCard('#3b82f6')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>VENCEN EN 90 DÍAS</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#3b82f6' }}>{resumen.vencen90}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>FECHA INICIO</label>
            <input type="date" style={s.input} value={filtros.desde} onChange={e => setFiltros({...filtros, desde: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>FECHA FIN</label>
            <input type="date" style={s.input} value={filtros.hasta} onChange={e => setFiltros({...filtros, hasta: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CATEGORÍA</label>
            <select style={s.input} value={filtros.categoria} onChange={e => setFiltros({...filtros, categoria: e.target.value})}>
              <option>Todos</option>
              {catalogos.categorias.map(c => <option key={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={s.button('#3b82f6')} onClick={fetchData}><Filter size={18}/> Filtrar</button>
            <button style={s.button('#10b981')} onClick={handleExportarPDF}><Download size={18}/> PDF</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <div style={s.tab(activeTab === 'Por Vencer')} onClick={() => { setActiveTab('Por Vencer'); setCurrentPage(1); }}>Por Vencer</div>
        <div style={s.tab(activeTab === 'Ya Vencidos')} onClick={() => { setActiveTab('Ya Vencidos'); setCurrentPage(1); }}>Ya Vencidos</div>
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
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>Código</th>
                  <th style={s.th}>Categoría</th>
                  <th style={s.th}>Laboratorio</th>
                  <th style={s.th}>Lote</th>
                  <th style={s.th}>Stock</th>
                  <th style={s.th}>Vencimiento</th>
                  <th style={s.th}>Días Restantes</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {currentProductos.map(p => {
                  const style = getBadgeStyle(p.dias_restantes);
                  return (
                    <tr key={p.id_producto + p.lote}>
                      <td style={s.td}>
                        <div style={{ fontWeight: 'bold' }}>{p.nombre_comercial}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.principio_activo}</div>
                      </td>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#64748b' }}>#{p.id_producto}</span></td>
                      <td style={s.td}>{p.nombre_categoria}</td>
                      <td style={s.td}>{p.nombre_laboratorio}</td>
                      <td style={s.td}><span style={s.badge('#0c1a3a', '#60a5fa')}>{p.lote || 'N/A'}</span></td>
                      <td style={s.td}><span style={{ fontWeight: 'bold' }}>{p.stock_actual}</span></td>
                      <td style={s.td}>{new Date(p.fecha_vencimiento).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: p.dias_restantes <= 7 ? '#ef4444' : p.dias_restantes <= 30 ? '#f59e0b' : 'inherit'
                        }}>
                          {p.dias_restantes <= 0 ? `Vencido hace ${Math.abs(p.dias_restantes)} días` : `${p.dias_restantes} días`}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={s.badge(style.bg, style.text)}>{style.label}</span>
                      </td>
                      <td style={s.td}>
                        <button style={{ ...s.btnGhost, color: '#ef4444' }} title="Dar de baja" onClick={() => { setSelectedProduct(p); setShowBajaModal(true); }}><XCircle size={18}/></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredItems.length)} de {filteredItems.length} registros</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={s.btnGhost} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><ChevronLeft size={18}/></button>
                <button style={s.btnGhost} disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}><ChevronRight size={18}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Dar de Baja */}
      {showBajaModal && selectedProduct && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Dar de Baja Producto</h2>
              <button onClick={() => setShowBajaModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>

            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: isDark ? '#0f1729' : '#F8FAFC', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedProduct.nombre_comercial}</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Lote: {selectedProduct.lote} · Stock disponible: {selectedProduct.stock_actual}</p>
            </div>

            <form onSubmit={handleBaja}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>MOTIVO</label>
                <select style={s.input} value={bajaForm.motivo} onChange={e => setBajaForm({...bajaForm, motivo: e.target.value})}>
                  <option>Vencido</option>
                  <option>Dañado</option>
                  <option>Pérdida</option>
                  <option>Otro</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CANTIDAD (MÁX: {selectedProduct.stock_actual})</label>
                <input type="number" min="1" max={selectedProduct.stock_actual} style={s.input} value={bajaForm.cantidad} onChange={e => setBajaForm({...bajaForm, cantidad: parseInt(e.target.value)})} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>OBSERVACIONES</label>
                <textarea style={{ ...s.input, height: '80px', resize: 'none' }} value={bajaForm.observaciones} onChange={e => setBajaForm({...bajaForm, observaciones: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowBajaModal(false)} style={s.btnGhost}><X size={18}/> Cancelar</button>
                <button type="submit" style={s.button('#ef4444')}><Check size={18}/> Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vencimientos;
