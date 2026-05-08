import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, Truck, Eye, 
  Phone, Mail, MapPin, X, Check, RefreshCw, 
  AlertTriangle, Globe, Briefcase, CreditCard, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const Proveedores = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  // Estados para Modales
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [viewingProveedor, setViewingProveedor] = useState(null);
  const [deletingProveedor, setDeletingProveedor] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    nombre_comercial: '',
    tipo: 'Laboratorio',
    direccion: '',
    distrito: '',
    ciudad: 'Lima',
    telefono: '',
    email: '',
    web: '',
    contacto_nombre: '',
    contacto_cargo: '',
    contacto_telefono: '',
    condicion_pago: 'Contado',
    notas: '',
    activo: true
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
    td: { padding: '14px 16px', fontSize: '13px', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    badge: (bg, text) => ({ backgroundColor: bg, color: text, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '20px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, color: isDark ? '#e2e8f0' : '#1e293b' },
    sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }
  };

  // --- Lógica de Datos ---
  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/proveedores`);
      setProveedores(res.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar proveedores. Asegúrate de que el endpoint /api/proveedores exista.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProveedores(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.ruc.length !== 11) return alert('El RUC debe tener exactamente 11 dígitos');

    try {
      if (editingProveedor) {
        await axios.put(`${API_BASE}/proveedores/${editingProveedor.id_proveedor}`, formData);
      } else {
        await axios.post(`${API_BASE}/proveedores`, formData);
      }
      fetchProveedores();
      setShowModal(false);
      setEditingProveedor(null);
    } catch (err) {
      alert('Error al guardar el proveedor');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/proveedores/${deletingProveedor.id_proveedor}`);
      fetchProveedores();
      setShowDeleteModal(false);
      setDeletingProveedor(null);
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  // --- Filtrado ---
  const filteredItems = proveedores.filter(p => {
    const matchesSearch = p.ruc?.includes(searchTerm) || p.razon_social?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'Todos' || (filtroEstado === 'Activo' ? p.activo : !p.activo);
    const matchesTipo = filtroTipo === 'Todos' || p.tipo === filtroTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  // --- Resumen ---
  const stats = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.activo).length,
    inactivos: proveedores.filter(p => !p.activo).length,
    conDeuda: proveedores.filter(p => p.deuda_pendiente > 0).length
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: '4px' }}>Proveedores</h1>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · GESTIÓN DE PROVEEDORES</p>
      </div>

      {/* Resumen */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={s.statCard('#3b82f6')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>TOTAL PROVEEDORES</span>
          <span style={{ fontSize: '24px', fontWeight: '900' }}>{stats.total}</span>
        </div>
        <div style={s.statCard('#10b981')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>ACTIVOS</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{stats.activos}</span>
        </div>
        <div style={s.statCard('#ef4444')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>INACTIVOS</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{stats.inactivos}</span>
        </div>
        <div style={s.statCard('#f59e0b')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>CON DEUDA</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{stats.conDeuda}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.card}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              style={s.input} 
              placeholder="Buscar por RUC o Razón Social..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select style={{ ...s.input, width: '160px' }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option>Todos</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <select style={{ ...s.input, width: '180px' }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option>Todos</option>
            <option>Laboratorio</option>
            <option>Distribuidora</option>
            <option>Importadora</option>
          </select>
          <button style={s.button()} onClick={() => { setEditingProveedor(null); setFormData({ruc:'', razon_social:'', nombre_comercial:'', tipo:'Laboratorio', direccion:'', distrito:'', ciudad:'Lima', telefono:'', email:'', web:'', contacto_nombre:'', contacto_cargo:'', contacto_telefono:'', condicion_pago:'Contado', notas:'', activo:true}); setShowModal(true); }}>
            <Plus size={18}/> Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={32} /></div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}><AlertTriangle size={32} style={{ marginBottom: '12px' }} /> <p>{error}</p></div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>RUC</th>
                <th style={s.th}>Razón Social</th>
                <th style={s.th}>Tipo</th>
                <th style={s.th}>Contacto</th>
                <th style={s.th}>Teléfono</th>
                <th style={s.th}>Estado</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(p => (
                <tr key={p.id_proveedor}>
                  <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#64748b' }}>{p.ruc}</span></td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 'bold' }}>{p.razon_social}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{p.nombre_comercial}</div>
                  </td>
                  <td style={s.td}>{p.tipo}</td>
                  <td style={s.td}>{p.contacto_nombre}</td>
                  <td style={s.td}>{p.telefono}</td>
                  <td style={s.td}>
                    {p.activo ? (
                      <span style={s.badge('#052e16', '#4ade80')}>ACTIVO</span>
                    ) : (
                      <span style={s.badge('#450a0a', '#f87171')}>INACTIVO</span>
                    )}
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={s.btnGhost} onClick={() => { setViewingProveedor(p); setShowDetailModal(true); }}><Eye size={16}/></button>
                      <button style={s.btnGhost} onClick={() => { setEditingProveedor(p); setFormData(p); setShowModal(true); }}><Edit2 size={16}/></button>
                      <button style={{ ...s.btnGhost, color: '#ef4444' }} onClick={() => { setDeletingProveedor(p); setShowDeleteModal(true); }}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No se encontraron proveedores</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nuevo/Editar */}
      {showModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>{editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>

            <form onSubmit={handleSave}>
              <div style={s.sectionTitle}><Info size={14}/> Datos Generales</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>RUC *</label>
                  <input required maxLength={11} style={s.input} value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>TIPO</label>
                  <select style={s.input} value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                    <option>Laboratorio</option>
                    <option>Distribuidora</option>
                    <option>Importadora</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>RAZÓN SOCIAL *</label>
                  <input required style={s.input} value={formData.razon_social} onChange={e => setFormData({...formData, razon_social: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>TELÉFONO</label>
                  <input style={s.input} value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>EMAIL</label>
                  <input type="email" style={s.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div style={s.sectionTitle}><Briefcase size={14}/> Contacto & Pagos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>NOMBRE CONTACTO</label>
                  <input style={s.input} value={formData.contacto_nombre} onChange={e => setFormData({...formData, contacto_nombre: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CONDICIÓN DE PAGO</label>
                  <select style={s.input} value={formData.condicion_pago} onChange={e => setFormData({...formData, condicion_pago: e.target.value})}>
                    <option>Contado</option>
                    <option>15 días</option>
                    <option>30 días</option>
                    <option>60 días</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <input type="checkbox" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Proveedor Activo</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnGhost}>Cancelar</button>
                <button type="submit" style={s.button()}>Guardar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalle */}
      {showDetailModal && viewingProveedor && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Detalle del Proveedor</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', backgroundColor: isDark ? '#0f1729' : '#F1F5F9', padding: '20px', borderRadius: '16px' }}>
              <div style={{ backgroundColor: '#3b82f6', color: 'white', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{viewingProveedor.razon_social}</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>RUC: {viewingProveedor.ruc}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <h4 style={s.sectionTitle}><MapPin size={14}/> Ubicación</h4>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>{viewingProveedor.direccion || 'Sin dirección'}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{viewingProveedor.distrito}, {viewingProveedor.ciudad}</p>
              </div>
              <div>
                <h4 style={s.sectionTitle}><Phone size={14}/> Contacto</h4>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>{viewingProveedor.contacto_nombre}</strong></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}><Phone size={12}/> {viewingProveedor.telefono}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginTop: '4px' }}><Mail size={12}/> {viewingProveedor.email}</div>
              </div>
            </div>

            <div style={{ marginTop: '32px', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, paddingTop: '24px' }}>
              <h4 style={s.sectionTitle}><CreditCard size={14}/> Historial de Compras</h4>
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '20px' }}>No hay compras registradas recientemente.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '12px' }}>¿Eliminar Proveedor?</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
              Esta acción no se puede deshacer. Se eliminará permanentemente a <strong>{deletingProveedor?.razon_social}</strong>.
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

export default Proveedores;
