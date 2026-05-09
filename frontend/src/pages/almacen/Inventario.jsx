import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, Package, 
  AlertTriangle, RefreshCw, X, Check,
  ChevronLeft, ChevronRight, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const Inventario = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [filtroStock, setFiltroStock] = useState('Todos');
  const [ordenamiento, setOrdenamiento] = useState('nombre_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [categorias, setCategorias] = useState([]);

  // Estados para Modales
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    id_producto: '',
    nombre_comercial: '',
    id_categoria: '',
    id_laboratorio: '',
    principio_activo: '',
    id_presentacion: '',
    stock_actual_unidades: 0,
    stock_minimo_unidades: 5,
    precio_compra: 0,
    precio_venta: 0,
    fecha_vencimiento: '',
    requiere_receta: false
  });

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
    button: (bg = '#3b82f6') => ({ backgroundColor: bg, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }),
    btnGhost: { backgroundColor: 'transparent', color: isDark ? '#94a3b8' : '#64748b', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    td: { padding: '14px 16px', fontSize: '14px', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    badge: (bg, text) => ({ backgroundColor: bg, color: text, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '20px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, color: isDark ? '#e2e8f0' : '#1e293b' }
  };

  // --- Lógica de Datos ---
  const fetchProductos = async () => {
    setLoading(true);
    try {
      // Construir params para la API
      const params = new URLSearchParams();
      if (filtroCategoria !== 'Todos') params.append('categoria', filtroCategoria);
      if (filtroStock === 'Stock crítico') params.append('stock', 'critico');
      if (searchTerm) params.append('busqueda', searchTerm);
      params.append('orden', ordenamiento);

      const [resProd, resCat] = await Promise.all([
        axios.get(`${API_BASE}/productos?${params.toString()}`),
        axios.get(`${API_BASE}/catalogos/categorias`)
      ]);
      
      setProductos(resProd.data);
      setCategorias(resCat.data);
      setError(null);
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const debounce = setTimeout(() => {
      fetchProductos();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, filtroCategoria, filtroStock, ordenamiento]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (parseFloat(formData.precio_venta) <= parseFloat(formData.precio_compra)) {
      alert('El precio de venta debe ser mayor al de compra');
      return;
    }

    try {
      if (editingProduct) {
        await axios.put(`${API_BASE}/productos/${editingProduct.id_producto}`, formData);
      } else {
        await axios.post(`${API_BASE}/productos`, formData);
      }
      fetchProductos();
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Error al guardar el producto');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/productos/${deletingProduct.id_producto}`);
      fetchProductos();
      setShowDeleteModal(false);
      setDeletingProduct(null);
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  // --- Filtrado y Búsqueda (Ahora manejado mayormente por el Backend) ---
  const filteredItems = productos;

  // --- Cálculos de Resumen ---
  const totalProductos = productos.length;
  const stockCriticoCount = productos.filter(p => p.stock_total <= p.stock_minimo).length;
  const porVencerCount = productos.filter(p => p.dias_para_vencer > 0 && p.dias_para_vencer <= 30).length;
  const valorInventario = productos.reduce((acc, p) => acc + (p.stock_total * (p.precio_base || 0)), 0);

  // --- Paginación ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: '4px' }}>Inventario</h1>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · GESTIÓN DE STOCK</p>
      </div>

      {/* Resumen */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={s.statCard('#3b82f6')}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TOTAL PRODUCTOS</span>
          <span style={{ fontSize: '24px', fontWeight: '900' }}>{totalProductos}</span>
        </div>
        <div style={s.statCard('#ef4444')}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>STOCK CRÍTICO</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{stockCriticoCount}</span>
        </div>
        <div style={s.statCard('#f59e0b')}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>POR VENCER</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{porVencerCount}</span>
        </div>
        <div style={s.statCard('#10b981')}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>VALOR TOTAL</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>S/ {valorInventario.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.card}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              style={s.input} 
              placeholder="Buscar por nombre o código..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select style={{ ...s.input, width: '180px' }} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option value="Todos">Todas las Categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </select>
          <select style={{ ...s.input, width: '150px' }} value={filtroStock} onChange={e => setFiltroStock(e.target.value)}>
            <option value="Todos">Todo el Stock</option>
            <option value="Stock crítico">Stock crítico</option>
          </select>
          <select style={{ ...s.input, width: '180px' }} value={ordenamiento} onChange={e => setOrdenamiento(e.target.value)}>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
            <option value="stock_asc">Menor Stock primero</option>
            <option value="stock_desc">Mayor Stock primero</option>
            <option value="precio_asc">Menor Precio primero</option>
            <option value="precio_desc">Mayor Precio primero</option>
          </select>
          <button style={s.button()} onClick={() => { setEditingProduct(null); setFormData({id_producto:'', nombre_comercial:'', id_categoria:'', id_laboratorio:'', principio_activo:'', id_presentacion:'', stock_actual_unidades:0, stock_minimo_unidades:5, precio_compra:0, precio_venta:0, fecha_vencimiento:'', requiere_receta:false}); setShowModal(true); }}>
            <Plus size={18}/> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={32} /></div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}><AlertTriangle size={32} /> <p>{error}</p></div>
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
                  <th style={s.th}>P. Venta</th>
                  <th style={s.th}>Vencimiento</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(p => {
                  const isCritico = p.stock_total <= p.stock_minimo;
                  const isAgotado = p.stock_total <= 0;
                  return (
                    <tr key={p.id_producto} style={{ backgroundColor: isDark ? 'transparent' : 'transparent', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', color: isDark ? '#94a3b8' : '#64748b' }}>#{p.id_producto}</span></td>
                      <td style={s.td}>
                        <div style={{ fontWeight: 'bold' }}>{p.nombre_comercial}</div>
                        <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>{p.principio_activo}</div>
                      </td>
                      <td style={s.td}>{p.nombre_categoria}</td>
                      <td style={s.td}>{p.nombre_laboratorio}</td>
                      <td style={s.td}>
                        <span style={{ fontWeight: '900', color: isCritico ? '#ef4444' : 'inherit' }}>{p.stock_total || 0}</span>
                        <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginLeft: '4px' }}>/ {p.stock_minimo || 0}</span>
                      </td>
                      <td style={s.td}>S/ {p.precio_base?.toFixed(2) || '0.00'}</td>
                      <td style={s.td}>{p.proximo_vencimiento ? new Date(p.proximo_vencimiento).toLocaleDateString() : '-'}</td>
                      <td style={s.td}>
                        {isAgotado ? (
                          <span style={s.badge('#7f1d1d', '#f87171')}>SIN STOCK</span>
                        ) : isCritico ? (
                          <span style={s.badge('#b45309', '#fbbf24')}>BAJO</span>
                        ) : (
                          <span style={s.badge('#065f46', '#34d399')}>NORMAL</span>
                        )}
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ ...s.btnGhost, padding: '6px' }} onClick={() => { setEditingProduct(p); setFormData(p); setShowModal(true); }}><Edit2 size={16}/></button>
                          <button style={{ ...s.btnGhost, padding: '6px', color: '#ef4444' }} onClick={() => { setDeletingProduct(p); setShowDeleteModal(true); }}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Paginación */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredItems.length)} de {filteredItems.length}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} style={s.btnGhost} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} style={s.btnGhost} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Nuevo/Editar */}
      {showModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>NOMBRE COMERCIAL *</label>
                <input required style={s.input} value={formData.nombre_comercial} onChange={e => setFormData({...formData, nombre_comercial: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>PRINCIPIO ACTIVO</label>
                <input style={s.input} value={formData.principio_activo} onChange={e => setFormData({...formData, principio_activo: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CATEGORÍA *</label>
                <select required style={s.input} value={formData.id_categoria} onChange={e => setFormData({...formData, id_categoria: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  <option value="1">Medicamentos</option>
                  <option value="2">Vitaminas</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>LABORATORIO</label>
                <select style={s.input} value={formData.id_laboratorio} onChange={e => setFormData({...formData, id_laboratorio: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  <option value="1">Bayer</option>
                  <option value="2">Portugal</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>STOCK ACTUAL *</label>
                <input type="number" required style={s.input} value={formData.stock_actual_unidades} onChange={e => setFormData({...formData, stock_actual_unidades: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>STOCK MÍNIMO</label>
                <input type="number" style={s.input} value={formData.stock_minimo_unidades} onChange={e => setFormData({...formData, stock_minimo_unidades: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>PRECIO COMPRA *</label>
                <input type="number" step="0.01" required style={s.input} value={formData.precio_compra} onChange={e => setFormData({...formData, precio_compra: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>PRECIO VENTA *</label>
                <input type="number" step="0.01" required style={s.input} value={formData.precio_venta} onChange={e => setFormData({...formData, precio_venta: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>VENCIMIENTO</label>
                <input type="date" style={s.input} value={formData.fecha_vencimiento?.split('T')[0]} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <input type="checkbox" checked={formData.requiere_receta} onChange={e => setFormData({...formData, requiere_receta: e.target.checked})} />
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Requiere Receta Médica</label>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnGhost}>Cancelar</button>
                <button type="submit" style={s.button()}>Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '12px' }}>¿Eliminar Producto?</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
              Esta acción no se puede deshacer. Se eliminará permanentemente <strong>{deletingProduct?.nombre_comercial}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowDeleteModal(false)} style={s.btnGhost}>Cancelar</button>
              <button onClick={handleDelete} style={s.button('#ef4444')}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
