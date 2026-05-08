import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Trash2, Eye, ShoppingCart, 
  FileText, X, ChevronDown, Check, RefreshCw, 
  AlertTriangle, Calendar, CreditCard, Info,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const Compras = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productosMaster, setProductosMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroFecha, setFiltroFecha] = useState('Este mes');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  
  const [viewingCompra, setViewingCompra] = useState(null);
  const [anulandoCompra, setAnulandoCompra] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Formulario Nueva / Editar Compra
  const [formData, setFormData] = useState({
    id_proveedor: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    nro_factura: '',
    forma_pago: 'Contado',
    estado: 'Pagado',
    notas: '',
    detalle: []
  });

  // Buscador de productos en modal
  const [prodSearch, setProdSearch] = useState('');
  const [filteredProds, setFilteredProds] = useState([]);

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
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    td: { padding: '14px 16px', fontSize: '13px', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    badge: (bg, text) => ({ backgroundColor: bg, color: text, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '20px', width: '95%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, color: isDark ? '#e2e8f0' : '#1e293b' },
    modalTable: { width: '100%', borderCollapse: 'collapse', backgroundColor: isDark ? '#0f1729' : '#F8FAFC', borderRadius: '12px', overflow: 'hidden' },
    alternateRow: { backgroundColor: isDark ? '#1a2744' : '#F1F5F9' }
  };

  const badgeStyles = {
    pendiente: { bg: '#422006', text: '#f59e0b' },
    pagado: { bg: '#052e16', text: '#4ade80' },
    anulado: { bg: '#450a0a', text: '#f87171' }
  };

  // --- Lógica de Datos ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [comprasRes, proveRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE}/compras`),
        axios.get(`${API_BASE}/proveedores`),
        axios.get(`${API_BASE}/productos`)
      ]);
      setCompras(Array.isArray(comprasRes.data) ? comprasRes.data : []);
      setProveedores(Array.isArray(proveRes.data) ? proveRes.data : []);
      setProductosMaster(Array.isArray(prodRes.data) ? prodRes.data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos. Verifica la conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filtrado de productos en modal
  useEffect(() => {
    if (prodSearch.length > 1) {
      const filtered = productosMaster.filter(p => 
        (p.nombre_comercial || '').toLowerCase().includes(prodSearch.toLowerCase()) ||
        (p.principio_activo || '').toLowerCase().includes(prodSearch.toLowerCase())
      ).slice(0, 5);
      setFilteredProds(filtered);
    } else {
      setFilteredProds([]);
    }
  }, [prodSearch, productosMaster]);

  const agregarProducto = (p) => {
    const existe = formData.detalle.find(item => item.id_producto === p.id_producto);
    if (existe) return alert('El producto ya está en la lista');
    
    setFormData({
      ...formData,
      detalle: [...formData.detalle, {
        id_producto: p.id_producto,
        nombre: p.nombre_comercial,
        cantidad: 1,
        precio_unitario: p.precio_compra || 0,
        subtotal: p.precio_compra || 0
      }]
    });
    setProdSearch('');
  };

  const quitarProducto = (index) => {
    const nuevoDetalle = [...formData.detalle];
    nuevoDetalle.splice(index, 1);
    setFormData({ ...formData, detalle: nuevoDetalle });
  };

  const actualizarItem = (index, field, value) => {
    const nuevoDetalle = [...formData.detalle];
    nuevoDetalle[index][field] = value;
    nuevoDetalle[index].subtotal = (nuevoDetalle[index].cantidad || 0) * (nuevoDetalle[index].precio_unitario || 0);
    setFormData({ ...formData, detalle: nuevoDetalle });
  };

  const subtotalForm = formData.detalle.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const igvForm = subtotalForm * 0.18;
  const totalForm = subtotalForm + igvForm;

  const handleSaveCompra = async (e) => {
    e.preventDefault();
    if (!formData.id_proveedor) return alert('Seleccione un proveedor');
    if (formData.detalle.length === 0) return alert('Agregue al menos un producto');

    try {
      const data = { ...formData, total: totalForm };
      if (isEditing) {
        await axios.put(`${API_BASE}/compras/${formData.id_compra}`, data);
        alert('Compra actualizada con éxito');
      } else {
        await axios.post(`${API_BASE}/compras`, data);
        alert('Compra registrada con éxito');
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert('Error al guardar la compra');
    }
  };

  const resetForm = () => {
    setFormData({
      id_proveedor: '',
      fecha_compra: new Date().toISOString().split('T')[0],
      nro_factura: '',
      forma_pago: 'Contado',
      estado: 'Pagado',
      notas: '',
      detalle: []
    });
    setIsEditing(false);
  };

  const openEditModal = (compra) => {
    setIsEditing(true);
    setFormData({
      ...compra,
      fecha_compra: new Date(compra.fecha_compra).toISOString().split('T')[0],
      detalle: compra.detalle || [] // Asumiendo que el backend trae el detalle o lo cargamos
    });
    // Si el backend no trae el detalle en el GET general, habría que hacer un GET por ID
    loadCompraDetail(compra.id_compra, true);
  };

  const loadCompraDetail = async (id, forEdit = false) => {
    try {
      const res = await axios.get(`${API_BASE}/compras/${id}`);
      if (forEdit) {
        setFormData(prev => ({ ...prev, detalle: res.data.detalle || [] }));
        setShowModal(true);
      } else {
        setViewingCompra(res.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      alert('Error al cargar el detalle de la compra');
    }
  };

  const handleAnular = async () => {
    try {
      await axios.delete(`${API_BASE}/compras/${anulandoCompra.id_compra}`);
      fetchData();
      setShowAnularModal(false);
      setShowDetailModal(false);
      alert('Compra anulada y stock revertido');
    } catch (err) {
      alert('Error al anular compra');
    }
  };

  const handleMarcarPagado = async (id) => {
    try {
      await axios.put(`${API_BASE}/compras/${id}`, { estado: 'Pagado' });
      fetchData();
      loadCompraDetail(id); // Recargar detalle
      alert('Compra marcada como pagada');
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  // --- Filtrado Tabla ---
  const filteredCompras = compras.filter(c => {
    const matchesSearch = (c.id_compra || '').toString().includes(searchTerm) || 
                          (c.razon_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.nro_factura || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filtroEstado === 'Todos' || c.estado === filtroEstado;
    
    // Filtro Fecha
    const fechaCompra = new Date(c.fecha_compra);
    const hoy = new Date();
    let matchesFecha = true;
    
    if (filtroFecha === 'Hoy') {
      matchesFecha = fechaCompra.toDateString() === hoy.toDateString();
    } else if (filtroFecha === 'Esta semana') {
      const haceUnaSemana = new Date();
      haceUnaSemana.setDate(hoy.getDate() - 7);
      matchesFecha = fechaCompra >= haceUnaSemana;
    } else if (filtroFecha === 'Este mes') {
      matchesFecha = fechaCompra.getMonth() === hoy.getMonth() && fechaCompra.getFullYear() === hoy.getFullYear();
    } else if (filtroFecha === 'Este año') {
      matchesFecha = fechaCompra.getFullYear() === hoy.getFullYear();
    }

    return matchesSearch && matchesEstado && matchesFecha;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCompras.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompras.slice(indexOfFirstItem, indexOfLastItem);

  // --- Resumen Stats (Basado en el mes actual por defecto o filtrado) ---
  const comprasMes = compras.filter(c => {
    const d = new Date(c.fecha_compra);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.estado !== 'Anulado';
  });

  const montoTotalMes = comprasMes.reduce((acc, c) => acc + (c.total || 0), 0);
  const pendientesGlobal = compras.filter(c => c.estado === 'Pendiente').length;
  const pagadasGlobal = compras.filter(c => c.estado === 'Pagado').length;

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#F1F5F9', marginBottom: '4px' }}>Compras</h1>
          <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · REGISTRO DE COMPRAS</p>
        </div>
        <button style={s.button()} onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={18}/> Nueva Compra
        </button>
      </div>

      {/* Resumen Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={s.statCard('#3b82f6')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>TOTAL COMPRAS DEL MES</span>
          <span style={{ fontSize: '24px', fontWeight: '900' }}>{comprasMes.length}</span>
        </div>
        <div style={s.statCard('#10b981')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>MONTO TOTAL (S/)</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>S/ {montoTotalMes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={s.statCard('#f59e0b', '#f59e0b')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>COMPRAS PENDIENTES</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{pendientesGlobal}</span>
            <span style={s.badge(badgeStyles.pendiente.bg, badgeStyles.pendiente.text)}>PENDIENTE</span>
          </div>
        </div>
        <div style={s.statCard('#10b981', '#10b981')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>COMPRAS PAGADAS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{pagadasGlobal}</span>
            <span style={s.badge(badgeStyles.pagado.bg, badgeStyles.pagado.text)}>PAGADO</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.card}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              style={{ ...s.input, paddingLeft: '40px' }} 
              placeholder="Buscar por número de orden o proveedor..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Estado:</span>
            <select style={{ ...s.input, width: '140px' }} value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setCurrentPage(1); }}>
              <option>Todos</option>
              <option>Pendiente</option>
              <option>Pagado</option>
              <option>Anulado</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Fecha:</span>
            <select style={{ ...s.input, width: '140px' }} value={filtroFecha} onChange={e => { setFiltroFecha(e.target.value); setCurrentPage(1); }}>
              <option>Hoy</option>
              <option>Esta semana</option>
              <option>Este mes</option>
              <option>Este año</option>
            </select>
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
                  <th style={s.th}>N° Orden</th>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Proveedor</th>
                  <th style={s.th}>N° Productos</th>
                  <th style={s.th}>Total (S/)</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}>Forma de Pago</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map(c => (
                  <tr key={c.id_compra} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={s.td}><span style={{ fontWeight: 'bold', color: '#3b82f6' }}>#ORD-{String(c.id_compra).padStart(5, '0')}</span></td>
                    <td style={s.td}>{new Date(c.fecha_compra).toLocaleDateString()}</td>
                    <td style={s.td}>{c.razon_social}</td>
                    <td style={s.td}>{c.items_count || 0}</td>
                    <td style={s.td}>S/ {(c.total || 0).toFixed(2)}</td>
                    <td style={s.td}>
                      {c.estado === 'Pendiente' && <span style={s.badge(badgeStyles.pendiente.bg, badgeStyles.pendiente.text)}>PENDIENTE</span>}
                      {c.estado === 'Pagado' && <span style={s.badge(badgeStyles.pagado.bg, badgeStyles.pagado.text)}>PAGADO</span>}
                      {c.estado === 'Anulado' && <span style={s.badge(badgeStyles.anulado.bg, badgeStyles.anulado.text)}>ANULADO</span>}
                    </td>
                    <td style={s.td}>{c.forma_pago}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={s.btnGhost} title="Ver detalle" onClick={() => loadCompraDetail(c.id_compra)}><Eye size={16}/></button>
                        {c.estado !== 'Anulado' && (
                          <>
                            <button style={s.btnGhost} title="Editar" onClick={() => openEditModal(c)}><FileText size={16}/></button>
                            <button style={{ ...s.btnGhost, color: '#ef4444' }} title="Anular" onClick={() => { setAnulandoCompra(c); setShowAnularModal(true); }}><X size={16}/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No se encontraron compras</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredCompras.length)} de {filteredCompras.length} resultados</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    style={{ ...s.btnGhost, opacity: currentPage === 1 ? 0.5 : 1 }} 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft size={18}/>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      style={{ 
                        ...s.btnGhost, 
                        width: '36px', 
                        backgroundColor: currentPage === i + 1 ? '#3b82f6' : 'transparent',
                        color: currentPage === i + 1 ? '#fff' : '#94a3b8',
                        borderColor: currentPage === i + 1 ? '#3b82f6' : '#334155'
                      }}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    style={{ ...s.btnGhost, opacity: currentPage === totalPages ? 0.5 : 1 }} 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight size={18}/>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Nueva / Editar Compra */}
      {showModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>{isEditing ? 'Editar Compra' : 'Nueva Compra'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24}/></button>
            </div>

            <form onSubmit={handleSaveCompra}>
              {/* Sección 1 - Datos Generales */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16}/> SECCIÓN 1 - DATOS GENERALES
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PROVEEDOR *</label>
                    <select required style={s.input} value={formData.id_proveedor} onChange={e => setFormData({...formData, id_proveedor: e.target.value})}>
                      <option value="">Seleccionar proveedor...</option>
                      {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FECHA DE COMPRA</label>
                    <input type="date" style={s.input} value={formData.fecha_compra} onChange={e => setFormData({...formData, fecha_compra: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>N° FACTURA DEL PROVEEDOR</label>
                    <input placeholder="Ej: F001-000123" style={s.input} value={formData.nro_factura} onChange={e => setFormData({...formData, nro_factura: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FORMA DE PAGO</label>
                    <select style={s.input} value={formData.forma_pago} onChange={e => setFormData({...formData, forma_pago: e.target.value})}>
                      <option>Contado</option>
                      <option>Crédito 15d</option>
                      <option>Crédito 30d</option>
                      <option>Crédito 60d</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>ESTADO</label>
                    <select style={s.input} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                      <option>Pagado</option>
                      <option>Pendiente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2 - Detalle de Productos */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={16}/> SECCIÓN 2 - DETALLE DE PRODUCTOS
                </h3>
                <div style={{ backgroundColor: '#0f1729', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>BUSCADOR DE PRODUCTOS</label>
                    <div style={{ position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input 
                        style={{ ...s.input, paddingLeft: '40px' }} 
                        placeholder="Buscar producto por nombre o principio..." 
                        value={prodSearch}
                        onChange={e => setProdSearch(e.target.value)}
                      />
                    </div>
                    {filteredProds.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', marginTop: '4px', zIndex: 10, boxShadow: '0 10px 15px rgba(0,0,0,0.5)' }}>
                        {filteredProds.map(p => (
                          <div key={p.id_producto} onClick={() => agregarProducto(p)} style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #334155', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{p.nombre_comercial}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{p.principio_activo}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>S/ {p.precio_compra}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Stock: {p.stock_actual_unidades}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #334155' }}>
                        <th style={{ ...s.th, padding: '8px' }}>Producto</th>
                        <th style={{ ...s.th, padding: '8px', textAlign: 'center', width: '80px' }}>Cantidad</th>
                        <th style={{ ...s.th, padding: '8px', textAlign: 'right', width: '100px' }}>Precio U.</th>
                        <th style={{ ...s.th, padding: '8px', textAlign: 'right', width: '100px' }}>Subtotal</th>
                        <th style={{ ...s.th, padding: '8px', textAlign: 'center', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.detalle.map((item, idx) => (
                        <tr key={idx} style={idx % 2 === 0 ? {} : s.alternateRow}>
                          <td style={{ ...s.td, padding: '8px' }}>{item.nombre}</td>
                          <td style={{ ...s.td, padding: '8px', textAlign: 'center' }}>
                            <input type="number" min="1" style={{ ...s.input, width: '60px', padding: '4px', textAlign: 'center' }} value={item.cantidad} onChange={e => actualizarItem(idx, 'cantidad', parseInt(e.target.value) || 0)} />
                          </td>
                          <td style={{ ...s.td, padding: '8px', textAlign: 'right' }}>
                            <input type="number" step="0.01" style={{ ...s.input, width: '80px', padding: '4px', textAlign: 'right' }} value={item.precio_unitario} onChange={e => actualizarItem(idx, 'precio_unitario', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td style={{ ...s.td, padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>S/ {(item.subtotal || 0).toFixed(2)}</td>
                          <td style={{ ...s.td, padding: '8px', textAlign: 'center' }}>
                            <button type="button" onClick={() => quitarProducto(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {formData.detalle.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Agregue productos a la compra</div>
                  )}
                </div>
              </div>

              {/* Sección 3 - Resumen */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16}/> SECCIÓN 3 - RESUMEN
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>NOTAS U OBSERVACIONES</label>
                    <textarea style={{ ...s.input, height: '80px', resize: 'none' }} placeholder="Opcional..." value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} />
                  </div>
                  <div style={{ width: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#94a3b8' }}><span>Subtotal:</span><span>S/ {subtotalForm.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px', color: '#94a3b8' }}><span>IGV (18%):</span><span>S/ {igvForm.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '900', color: '#10b981', borderTop: '2px solid #334155', paddingTop: '12px' }}>
                      <span>TOTAL:</span><span>S/ {totalForm.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnGhost}>Cancelar</button>
                <button type="submit" style={s.button()}>Guardar Compra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalle Compra */}
      {showDetailModal && viewingCompra && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Detalle de Compra #ORD-{String(viewingCompra.id_compra).padStart(5, '0')}</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24}/></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', backgroundColor: '#0f1729', padding: '16px', borderRadius: '12px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>PROVEEDOR</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{viewingCompra.razon_social}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>RUC: {viewingCompra.ruc}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>FECHA Y FACTURA</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{new Date(viewingCompra.fecha_compra).toLocaleDateString()}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Fac: {viewingCompra.nro_factura || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>FORMA DE PAGO</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{viewingCompra.forma_pago}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>ESTADO</p>
                {viewingCompra.estado === 'Pendiente' && <span style={s.badge(badgeStyles.pendiente.bg, badgeStyles.pendiente.text)}>PENDIENTE</span>}
                {viewingCompra.estado === 'Pagado' && <span style={s.badge(badgeStyles.pagado.bg, badgeStyles.pagado.text)}>PAGADO</span>}
                {viewingCompra.estado === 'Anulado' && <span style={s.badge(badgeStyles.anulado.bg, badgeStyles.anulado.text)}>ANULADO</span>}
              </div>
            </div>

            <table style={{ ...s.modalTable, marginBottom: '24px' }}>
              <thead>
                <tr>
                  <th style={s.th}>Producto</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Cant.</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Precio U.</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(viewingCompra.detalle || []).map((item, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? {} : s.alternateRow}>
                    <td style={s.td}>{item.nombre_comercial}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ ...s.td, textAlign: 'right' }}>S/ {(item.precio_unitario || 0).toFixed(2)}</td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 'bold' }}>S/ {(item.subtotal || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '40px', fontSize: '13px', color: '#94a3b8' }}><span>Subtotal:</span><span>S/ {(viewingCompra.total / 1.18).toFixed(2)}</span></div>
              <div style={{ display: 'flex', gap: '40px', fontSize: '13px', color: '#94a3b8' }}><span>IGV (18%):</span><span>S/ {(viewingCompra.total - (viewingCompra.total / 1.18)).toFixed(2)}</span></div>
              <div style={{ display: 'flex', gap: '40px', fontSize: '20px', fontWeight: '900', color: '#10b981' }}><span>TOTAL:</span><span>S/ {(viewingCompra.total || 0).toFixed(2)}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {viewingCompra.estado === 'Pendiente' && (
                <button style={s.button('#10b981')} onClick={() => handleMarcarPagado(viewingCompra.id_compra)}>
                  <Check size={18}/> Marcar como Pagado
                </button>
              )}
              {viewingCompra.estado !== 'Anulado' && (
                <button style={s.button('#ef4444')} onClick={() => { setAnulandoCompra(viewingCompra); setShowAnularModal(true); }}>
                  <Trash2 size={18}/> Anular Compra
                </button>
              )}
              <button style={s.btnGhost} onClick={() => setShowDetailModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Anulación */}
      {showAnularModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px', marginInline: 'auto' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '12px' }}>¿Anular esta compra?</h2>
            <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold', marginBottom: '32px' }}>
              Advertencia: El stock será revertido.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowAnularModal(false)} style={s.btnGhost}>Cancelar</button>
              <button onClick={handleAnular} style={s.button('#ef4444')}>Anular</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compras;
