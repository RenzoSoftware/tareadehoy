import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Edit2, Trash2, Eye, 
  Search, Check, X, RefreshCw, Lock, 
  Unlock, Shield, User, Clock, Phone,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const Usuarios = () => {
  const { isDark } = useTheme();
  
  // --- Estados ---
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedProduct] = useState(null); // Usado para detalle y eliminación

  // Formulario
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'Cajero',
    turno: 'Mañana 6am-2pm',
    colegiatura: '',
    telefono: '',
    activo: true
  });
  const [showPassword, setShowPassword] = useState(false);

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
    avatar: (color) => ({
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: color,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px'
    }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '20px', width: '95%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }
  };

  const getRolStyles = (rol) => {
    switch (rol) {
      case 'Administrador': return { bg: '#0c1a3a', text: '#60a5fa', avatar: '#3b82f6' };
      case 'Farmacéutico': return { bg: '#052e16', text: '#4ade80', avatar: '#10b981' };
      case 'Cajero': return { bg: '#422006', text: '#f59e0b', avatar: '#eab308' };
      case 'Supervisor': return { bg: '#1e1b4b', text: '#a78bfa', avatar: '#8b5cf6' };
      default: return { bg: '#334155', text: '#94a3b8', avatar: '#64748b' };
    }
  };

  // --- Lógica de Datos ---
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/usuarios`);
      setUsuarios(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleToggleEstado = async (id, currentEstado) => {
    try {
      await axios.put(`${API_BASE}/usuarios/${id}/estado`, { activo: !currentEstado });
      fetchUsuarios();
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert('Las contraseñas no coinciden');
    if (!editingUser && formData.password.length < 8) return alert('La contraseña debe tener al menos 8 caracteres');

    try {
      if (editingUser) {
        await axios.put(`${API_BASE}/usuarios/${editingUser.id_usuario}`, formData);
      } else {
        await axios.post(`${API_BASE}/usuarios`, formData);
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (err) {
      alert('Error al guardar usuario');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/usuarios/${selectedUser.id_usuario}`);
      setShowDeleteModal(false);
      fetchUsuarios();
    } catch (err) {
      alert('Error al eliminar usuario');
    }
  };

  const handleVerDetalle = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/usuarios/${id}`);
      setSelectedProduct(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert('Error al obtener detalle');
    }
  };

  // Filtrado
  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRol = filtroRol === 'Todos' || u.rol === filtroRol;
    const matchesEstado = filtroEstado === 'Todos' || (filtroEstado === 'Activo' ? u.activo : !u.activo);
    return matchesSearch && matchesRol && matchesEstado;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  // Estadísticas
  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    inactivos: usuarios.filter(u => !u.activo).length,
    admins: usuarios.filter(u => u.rol === 'Administrador').length
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: '4px' }}>Usuarios</h1>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BOTICA NOVA SALUD · GESTIÓN DE USUARIOS</p>
      </div>

      {/* Resumen */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={s.statCard('#3b82f6')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>TOTAL USUARIOS</span>
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
        <div style={s.statCard('#6366f1')}>
          <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>ADMINISTRADORES</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#6366f1' }}>{stats.admins}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.card}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              style={{ ...s.input, paddingLeft: '40px' }} 
              placeholder="Buscar por nombre o email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select style={{ ...s.input, width: '160px' }} value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
            <option>Todos</option>
            <option>Administrador</option>
            <option>Farmacéutico</option>
            <option>Cajero</option>
            <option>Supervisor</option>
          </select>
          <select style={{ ...s.input, width: '140px' }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option>Todos</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <button style={s.button()} onClick={() => { setEditingUser(null); setFormData({nombre_completo:'', email:'', password:'', confirmPassword:'', rol:'Cajero', turno:'Mañana 6am-2pm', colegiatura:'', telefono:'', activo:true}); setShowModal(true); }}>
            <UserPlus size={18}/> Nuevo Usuario
          </button>
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
                  <th style={s.th}>Usuario</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Rol</th>
                  <th style={s.th}>Turno</th>
                  <th style={s.th}>Último Acceso</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {currentUsuarios.map(u => {
                  const rolStyle = getRolStyles(u.rol);
                  return (
                    <tr key={u.id_usuario}>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={s.avatar(rolStyle.avatar)}>{u.nombre_completo?.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 'bold' }}>{u.nombre_completo}</span>
                        </div>
                      </td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>
                        <span style={s.badge(rolStyle.bg, rolStyle.text)}>{u.rol}</span>
                      </td>
                      <td style={s.td}>{u.turno}</td>
                      <td style={s.td}>{u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString() : 'Nunca'}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div 
                            onClick={() => handleToggleEstado(u.id_usuario, u.activo)}
                            style={{ 
                              width: '36px', height: '18px', borderRadius: '10px', 
                              backgroundColor: u.activo ? '#10b981' : '#ef4444',
                              position: 'relative', cursor: 'pointer', transition: '0.3s'
                            }}
                          >
                            <div style={{ 
                              width: '14px', height: '14px', backgroundColor: '#fff', borderRadius: '50%',
                              position: 'absolute', top: '2px', left: u.activo ? '20px' : '2px', transition: '0.3s'
                            }} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: u.activo ? '#10b981' : '#ef4444' }}>
                            {u.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={s.btnGhost} onClick={() => handleVerDetalle(u.id_usuario)}><Eye size={16}/></button>
                          <button style={s.btnGhost} onClick={() => { setEditingUser(u); setFormData({...u, password: '', confirmPassword: ''}); setShowModal(true); }}><Edit2 size={16}/></button>
                          <button style={{ ...s.btnGhost, color: '#ef4444' }} onClick={() => { setSelectedProduct(u); setShowDeleteModal(true); }}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsuarios.length)} de {filteredUsuarios.length}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={s.btnGhost} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18}/></button>
                <button style={s.btnGhost} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Nuevo / Editar */}
      {showModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>NOMBRE COMPLETO *</label>
                <input required style={s.input} value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>EMAIL *</label>
                <input type="email" required style={s.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              {!editingUser && (
                <>
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CONTRASEÑA *</label>
                    <input type={showPassword ? 'text' : 'password'} required style={s.input} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '32px', background: 'none', border: 'none', color: '#64748b' }}>
                      {showPassword ? <Unlock size={16}/> : <Lock size={16}/>}
                    </button>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>CONFIRMAR CONTRASEÑA *</label>
                    <input type="password" required style={s.input} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>ROL</label>
                <select style={s.input} value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                  <option>Administrador</option>
                  <option>Farmacéutico</option>
                  <option>Cajero</option>
                  <option>Supervisor</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>TURNO</label>
                <select style={s.input} value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value})}>
                  <option>Mañana 6am-2pm</option>
                  <option>Tarde 2pm-10pm</option>
                  <option>Noche 10pm-6am</option>
                </select>
              </div>

              {formData.rol === 'Farmacéutico' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>NÚMERO COLEGIATURA</label>
                  <input style={s.input} value={formData.colegiatura} onChange={e => setFormData({...formData, colegiatura: e.target.value})} />
                </div>
              )}

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>TELÉFONO</label>
                <input style={s.input} value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                <input type="checkbox" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Usuario Activo</label>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnGhost}><X size={18}/> Cancelar</button>
                <button type="submit" style={s.button()}><Check size={18}/> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedUser && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Perfil de Usuario</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ ...s.avatar(getRolStyles(selectedUser.rol).avatar), width: '80px', height: '80px', fontSize: '32px' }}>
                {selectedUser.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900' }}>{selectedUser.nombre_completo}</h3>
                <span style={s.badge(getRolStyles(selectedUser.rol).bg, getRolStyles(selectedUser.rol).text)}>{selectedUser.rol}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>EMAIL</label>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{selectedUser.email}</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>TURNO</label>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{selectedUser.turno}</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>TELÉFONO</label>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{selectedUser.telefono || 'No registrado'}</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>COLEGIATURA</label>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{selectedUser.colegiatura || 'N/A'}</p>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, paddingTop: '24px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#3b82f6', marginBottom: '16px' }}>ÚLTIMAS ACCIONES</h4>
              <table style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr style={{ color: '#64748b' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Fecha</th>
                    <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Acción</th>
                    <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Módulo</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedUser.historial || []).map((h, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 0' }}>{new Date(h.fecha).toLocaleString()}</td>
                      <td style={{ padding: '8px 0' }}>{h.accion}</td>
                      <td style={{ padding: '8px 0' }}><span style={s.badge('#0c1a3a', '#60a5fa')}>{h.modulo}</span></td>
                    </tr>
                  ))}
                  {(!selectedUser.historial || selectedUser.historial.length === 0) && (
                    <tr><td colSpan="3" style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>Sin actividad reciente</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button style={s.button()} onClick={() => { setEditingUser(selectedUser); setFormData({...selectedUser, password: '', confirmPassword: ''}); setShowDetailModal(false); setShowModal(true); }}><Edit2 size={18}/> Editar</button>
              <button style={s.btnGhost} onClick={() => setShowDetailModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#450a0a', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={32} color="#f87171" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '12px' }}>¿Eliminar Usuario?</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
              Esta acción no se puede deshacer. Se eliminará permanentemente a <strong>{selectedUser?.nombre_completo}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowDeleteModal(false)} style={s.btnGhost}>Cancelar</button>
              <button onClick={handleDelete} style={s.button('#ef4444')}><Trash2 size={18}/> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
