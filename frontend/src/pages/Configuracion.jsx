import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Settings, Eye, EyeOff, Check, LogOut, Shield, Database, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Configuracion = ({ user, onLogout }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('perfil');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Estilos inline dinámicos según el tema
  const s = {
    container: { backgroundColor: isDark ? '#0f1729' : '#F8FAFC', minHeight: '100%', padding: '24px', color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif', transition: 'all 0.2s' },
    card: { backgroundColor: isDark ? '#1e293b' : '#FFFFFF', borderRadius: '16px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, padding: '24px', marginBottom: '24px', boxShadow: isDark ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    tabBar: { display: 'flex', gap: '8px', backgroundColor: isDark ? '#1e293b' : '#FFFFFF', padding: '8px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` },
    tab: (active) => ({
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s',
      backgroundColor: active ? (isDark ? '#0f1729' : '#F1F5F9') : 'transparent',
      color: active ? '#3b82f6' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: 'none'
    }),
    title: { fontSize: '24px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.025em', color: isDark ? '#F1F5F9' : '#0F172A' },
    label: { display: 'block', fontSize: '12px', fontWeight: '900', color: isDark ? '#64748b' : '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' },
    input: { width: '100%', backgroundColor: isDark ? '#0f1729' : '#F8FAFC', border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`, borderRadius: '8px', padding: '12px', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
    button: { backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'filter 0.2s' },
    btnGhost: { backgroundColor: 'transparent', color: isDark ? '#64748b' : '#475569', border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' },
    success: { backgroundColor: isDark ? '#065f46' : '#DCFCE7', color: isDark ? '#34d399' : '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
    error: { backgroundColor: isDark ? '#7f1d1d' : '#FEE2E2', color: isDark ? '#f87171' : '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
    toggleContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }
  };

  // Componente Toggle interno
  const Toggle = ({ active, onToggle }) => (
    <div 
      onClick={onToggle}
      style={{
        width: '44px', height: '22px', backgroundColor: active ? '#3b82f6' : (isDark ? '#334155' : '#CBD5E1'),
        borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
      }}
    >
      <div style={{
        width: '18px', height: '18px', backgroundColor: '#ffffff', borderRadius: '50%',
        position: 'absolute', top: '2px', left: active ? '24px' : '2px', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </div>
  );

  // Estados de los formularios
  const [profile, setProfile] = useState({ nombre: user?.username || '', apellido: '', email: '', telefono: '', rol: 'Administrador' });
  const [notif, setNotif] = useState({ stock: true, vencer: true, ventas: false, reporte: true, email: false, sonido: true });
  const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' });
  const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirmar: false });
  const [general, setGeneral] = useState({ dark: true, backup: true, igv: true, stockMin: 10, diasVence: 30, decimales: '2', moneda: 'PEN' });

  const handleSaveProfile = () => {
    // Simulamos guardado actualizando el localStorage para que el cambio sea visible
    const updatedUser = { ...user, username: profile.nombre };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setSuccessMsg('Perfil actualizado correctamente. Refresca para ver los cambios en todo el sistema.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSavePassword = () => {
    if (!pass.actual || !pass.nueva || !pass.confirmar) {
      alert('Por favor completa todos los campos de contraseña');
      return;
    }
    if (pass.nueva !== pass.confirmar) {
      alert('La nueva contraseña y la confirmación no coinciden');
      return;
    }
    if (pass.nueva.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    setSuccessMsg('Contraseña actualizada correctamente');
    setPass({ actual: '', nueva: '', confirmar: '' });
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getPassStrength = () => {
    let score = 0;
    if (pass.nueva.length >= 8) score++;
    if (/[A-Z]/.test(pass.nueva)) score++;
    if (/[0-9]/.test(pass.nueva)) score++;
    if (/[^A-Za-z0-9]/.test(pass.nueva)) score++;
    return score;
  };

  const renderStrengthBar = () => {
    const score = getPassStrength();
    const colors = ['#7f1d1d', '#b45309', '#1d4ed8', '#065f46'];
    const labels = ['Muy Débil', 'Regular', 'Buena', 'Fuerte'];
    if (!pass.nueva) return null;
    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '8px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, backgroundColor: i <= score ? colors[score-1] : (isDark ? '#334155' : '#E2E8F0'), borderRadius: '2px' }} />
          ))}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: colors[score-1] }}>{labels[score-1]}</span>
      </div>
    );
  };

  return (
    <div style={s.container}>
      <h1 style={s.title}>Configuración del Sistema</h1>

      {/* Tab Bar */}
      <div style={s.tabBar}>
        <button onClick={() => setActiveTab('perfil')} style={s.tab(activeTab === 'perfil')}><User size={18}/> Perfil</button>
        <button onClick={() => setActiveTab('notificaciones')} style={s.tab(activeTab === 'notificaciones')}><Bell size={18}/> Notificaciones</button>
        <button onClick={() => setActiveTab('password')} style={s.tab(activeTab === 'password')}><Lock size={18}/> Contraseña</button>
        <button onClick={() => setActiveTab('general')} style={s.tab(activeTab === 'general')}><Settings size={18}/> General</button>
      </div>

      {successMsg && <div style={s.success}><Check size={18}/> {successMsg}</div>}

      {/* Pestaña Perfil */}
      {activeTab === 'perfil' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white', justifyContent: 'center' }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{user?.username || 'Usuario'}</h2>
                <p style={{ color: isDark ? '#64748b' : '#64748b', fontSize: '14px' }}>Gestiona tu información personal y de cuenta</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={s.label}>Nombre</label>
                <input style={s.input} value={profile.nombre} onChange={e => setProfile({...profile, nombre: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Apellido</label>
                <input style={s.input} value={profile.apellido} onChange={e => setProfile({...profile, apellido: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Email</label>
                <input style={s.input} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Teléfono</label>
                <input style={s.input} value={profile.telefono} onChange={e => setProfile({...profile, telefono: e.target.value})} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={s.label}>Rol de Usuario</label>
                <select style={s.input} value={profile.rol} onChange={e => setProfile({...profile, rol: e.target.value})}>
                  <option>Administrador</option>
                  <option>Farmacéutico</option>
                  <option>Cajero</option>
                  <option>Supervisor</option>
                </select>
              </div>
            </div>
            <button style={s.button} onClick={handleSaveProfile}>Guardar cambios</button>
          </div>

          <div style={s.card}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#60a5fa"/> Sesión Activa
            </h3>
            <div style={{ backgroundColor: isDark ? '#0f1729' : '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${isDark ? 'transparent' : '#E2E8F0'}` }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Windows 11 - Chrome</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Lima, Perú • Activa ahora</p>
            </div>
            <button style={{ ...s.btnGhost, color: '#f87171', borderColor: isDark ? '#7f1d1d' : '#FCA5A5', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LogOut size={16}/> Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Pestaña Notificaciones */}
      {activeTab === 'notificaciones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          <div style={s.card}>
            <h3 style={{ marginBottom: '20px' }}>Preferencias de Alerta</h3>
            <div style={s.toggleContainer}>
              <span>Stock Crítico</span>
              <Toggle active={notif.stock} onToggle={() => setNotif({...notif, stock: !notif.stock})} />
            </div>
            <div style={s.toggleContainer}>
              <span>Productos por vencer (30 días)</span>
              <Toggle active={notif.vencer} onToggle={() => setNotif({...notif, vencer: !notif.vencer})} />
            </div>
            <div style={s.toggleContainer}>
              <span>Nuevas ventas realizadas</span>
              <Toggle active={notif.ventas} onToggle={() => setNotif({...notif, ventas: !notif.ventas})} />
            </div>
            <div style={s.toggleContainer}>
              <span>Reporte diario de caja</span>
              <Toggle active={notif.reporte} onToggle={() => setNotif({...notif, reporte: !notif.reporte})} />
            </div>
            <div style={s.toggleContainer}>
              <span>Notificaciones por Email</span>
              <Toggle active={notif.email} onToggle={() => setNotif({...notif, email: !notif.email})} />
            </div>
            <div style={{ ...s.toggleContainer, border: 'none' }}>
              <span>Sonido de alerta</span>
              <Toggle active={notif.sonido} onToggle={() => setNotif({...notif, sonido: !notif.sonido})} />
            </div>
          </div>

          <div style={s.card}>
            <h3 style={{ marginBottom: '20px' }}>Centro de Mensajes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { type: 'danger', t: 'Stock Agotado', d: 'Paracetamol 500mg se ha agotado.', h: '10:30 AM', new: true },
                { type: 'warn', t: 'Vencimiento Próximo', d: 'Lote de Amoxicilina vence en 15 días.', h: '9:15 AM', new: true },
                { type: 'info', t: 'Backup Exitoso', d: 'Se completó la copia de seguridad diaria.', h: '03:00 AM', new: false }
              ].map((n, i) => (
                <div key={i} style={{ backgroundColor: isDark ? '#0f1729' : '#F8FAFC', padding: '12px', borderRadius: '12px', display: 'flex', gap: '12px', position: 'relative', border: `1px solid ${isDark ? 'transparent' : '#E2E8F0'}` }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: n.type === 'danger' ? '#ef4444' : n.type === 'warn' ? '#f59e0b' : '#3b82f6', marginTop: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{n.t}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{n.h}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{n.d}</p>
                  </div>
                  {n.new && <div style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', position: 'absolute', right: '12px', top: '24px' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pestaña Contraseña */}
      {activeTab === 'password' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={s.card}>
            <div style={{ marginBottom: '24px' }}>
              <label style={s.label}>Contraseña Actual</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass.actual ? 'text' : 'password'} style={s.input} value={pass.actual} onChange={e => setPass({...pass, actual: e.target.value})} />
                <button type="button" onClick={() => setShowPass({...showPass, actual: !showPass.actual})} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {showPass.actual ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={s.label}>Nueva Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass.nueva ? 'text' : 'password'} style={s.input} value={pass.nueva} onChange={e => setPass({...pass, nueva: e.target.value})} />
                <button type="button" onClick={() => setShowPass({...showPass, nueva: !showPass.nueva})} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {showPass.nueva ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              {renderStrengthBar()}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={s.label}>Confirmar Nueva Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass.confirmar ? 'text' : 'password'} style={s.input} value={pass.confirmar} onChange={e => setPass({...pass, confirmar: e.target.value})} />
                <button type="button" onClick={() => setShowPass({...showPass, confirmar: !showPass.confirmar})} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {showPass.confirmar ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: isDark ? '#0f1729' : '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${isDark ? 'transparent' : '#E2E8F0'}` }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px', color: '#64748b' }}>REQUISITOS:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: pass.nueva.length >= 8 ? '#34d399' : '#64748b' }}>
                  <Check size={14}/> Mínimo 8 caracteres
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: /[A-Z]/.test(pass.nueva) ? '#34d399' : '#64748b' }}>
                  <Check size={14}/> Al menos una mayúscula
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: /[0-9]/.test(pass.nueva) ? '#34d399' : '#64748b' }}>
                  <Check size={14}/> Al menos un número
                </div>
              </div>
            </div>
            <button style={s.button} onClick={handleSavePassword}>Cambiar Contraseña</button>
          </div>
        </div>
      )}

      {/* Pestaña General */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          <div style={s.card}>
            <h3 style={{ marginBottom: '20px' }}>Preferencias de Visualización</h3>
            <div style={s.toggleContainer}>
              <span>Modo Oscuro</span>
              <Toggle active={general.dark} onToggle={() => setGeneral({...general, dark: !general.dark})} />
            </div>
            <div style={s.toggleContainer}>
              <span>Backup automático al cerrar</span>
              <Toggle active={general.backup} onToggle={() => setGeneral({...general, backup: !general.backup})} />
            </div>
            <div style={s.toggleContainer}>
              <span>Mostrar precios con IGV incluido</span>
              <Toggle active={general.igv} onToggle={() => setGeneral({...general, igv: !general.igv})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
              <div>
                <label style={s.label}>Stock Mínimo Global</label>
                <input type="number" style={s.input} value={general.stockMin} onChange={e => setGeneral({...general, stockMin: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Alerta Vencimiento (días)</label>
                <input type="number" style={s.input} value={general.diasVence} onChange={e => setGeneral({...general, diasVence: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Decimales en Precios</label>
                <select style={s.input} value={general.decimales} onChange={e => setGeneral({...general, decimales: e.target.value})}>
                  <option value="0">0 decimales</option>
                  <option value="2">2 decimales</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Moneda Principal</label>
                <select style={s.input} value={general.moneda} onChange={e => setGeneral({...general, moneda: e.target.value})}>
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={s.card}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#60a5fa"/> Sistema
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>Versión del Software</span>
                <span style={{ fontSize: '12px', backgroundColor: isDark ? '#065f46' : '#DCFCE7', color: isDark ? '#34d399' : '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>v2.4.0</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Última actualización: 07 May 2026</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{ ...s.btnGhost, display: 'flex', alignItems: 'center', gap: '8px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                <Download size={16}/> Exportar todos los datos
              </button>
              <button style={{ ...s.btnGhost, display: 'flex', alignItems: 'center', gap: '8px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                <RefreshCcw size={16}/> Realizar Backup manual
              </button>
              <button style={{ ...s.btnGhost, display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', borderColor: isDark ? '#7f1d1d' : '#FCA5A5' }}>
                Limpiar Caché del sistema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
