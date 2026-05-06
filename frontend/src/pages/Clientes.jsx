/**
 * @fileoverview Clientes - CRUD completo con tema claro/oscuro
 * Funciones: listar, crear, editar, eliminar con validaciones y confirmaciones.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Users, UserPlus, Edit, Trash2, Search, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const API_BASE = 'http://localhost:5000/api';

const FORM_INICIAL = {
  id_tipo_doc: '1', numero_documento: '', nombres_razon: '',
  direccion: '', telefono: '', email: '',
};

// ── Componente de campo de formulario ──────────────────────────
const Field = ({ label, error, required, children }) => {
  const { isDark } = useTheme();
  return (
    <div>
      <label
        className="block text-xs font-black uppercase tracking-wider mb-1.5"
        style={{ color: isDark ? '#94A3B8' : '#64748B' }}
      >
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
};

// ── Input estilizado ────────────────────────────────────────────
const Input = ({ isDark, ...props }) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border"
    style={{
      backgroundColor: isDark ? '#334155' : '#F8FAFC',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      color: isDark ? '#F1F5F9' : '#0F172A',
    }}
    onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
    onBlur={e => { e.target.style.borderColor = isDark ? '#475569' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
  />
);

const Select = ({ isDark, children, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border"
    style={{
      backgroundColor: isDark ? '#334155' : '#F8FAFC',
      borderColor: isDark ? '#475569' : '#E2E8F0',
      color: isDark ? '#F1F5F9' : '#0F172A',
    }}
    onFocus={e => { e.target.style.borderColor = '#3B82F6'; }}
    onBlur={e => { e.target.style.borderColor = isDark ? '#475569' : '#E2E8F0'; }}
  >
    {children}
  </select>
);

// ── Formulario de cliente ───────────────────────────────────────
const ClienteForm = ({ form, setForm, errores, tiposDoc, isDark }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Field label="Tipo Documento" required error={errores.id_tipo_doc}>
        <Select isDark={isDark} value={form.id_tipo_doc} onChange={e => setForm(f => ({ ...f, id_tipo_doc: e.target.value }))}>
          {tiposDoc.map(t => <option key={t.id_tipo_doc} value={t.id_tipo_doc}>{t.codigo} - {t.descripcion}</option>)}
        </Select>
      </Field>
      <Field label="Número de Documento" required error={errores.numero_documento}>
        <Input isDark={isDark} type="text" maxLength={15} placeholder="12345678"
          value={form.numero_documento} onChange={e => setForm(f => ({ ...f, numero_documento: e.target.value }))} />
      </Field>
    </div>
    <Field label="Nombre / Razón Social" required error={errores.nombres_razon}>
      <Input isDark={isDark} type="text" maxLength={200} placeholder="Juan Pérez López"
        value={form.nombres_razon} onChange={e => setForm(f => ({ ...f, nombres_razon: e.target.value }))} />
    </Field>
    <div className="grid grid-cols-2 gap-4">
      <Field label="Teléfono" error={errores.telefono}>
        <Input isDark={isDark} type="tel" maxLength={15} placeholder="987654321"
          value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
      </Field>
      <Field label="Email" error={errores.email}>
        <Input isDark={isDark} type="email" maxLength={100} placeholder="correo@ejemplo.com"
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </Field>
    </div>
    <Field label="Dirección" error={errores.direccion}>
      <Input isDark={isDark} type="text" maxLength={200} placeholder="Av. Principal 123"
        value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
    </Field>
  </div>
);

// ── Página principal ────────────────────────────────────────────
const Clientes = () => {
  const { isDark } = useTheme();
  const [clientes, setClientes]     = useState([]);
  const [tiposDoc, setTiposDoc]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editando, setEditando]     = useState(null);
  const [form, setForm]             = useState(FORM_INICIAL);
  const [errores, setErrores]       = useState({});
  const [saving, setSaving]         = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/clientes`);
      setClientes(res.data);
    } catch { showToast('Error al cargar clientes', 'error'); }
    finally { setLoading(false); }
  }, []);

  const fetchTiposDoc = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/clientes/tipos-doc`);
      setTiposDoc(res.data);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { fetchClientes(); fetchTiposDoc(); }, [fetchClientes, fetchTiposDoc]);

  const clientesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return clientes;
    const t = searchTerm.toLowerCase();
    return clientes.filter(c =>
      c.nombres_razon?.toLowerCase().includes(t) ||
      c.numero_documento?.includes(t) ||
      c.email?.toLowerCase().includes(t) ||
      c.telefono?.includes(t)
    );
  }, [clientes, searchTerm]);

  const validarForm = () => {
    const e = {};
    if (!form.nombres_razon?.trim() || form.nombres_razon.trim().length < 3)
      e.nombres_razon = 'Mínimo 3 caracteres';
    if (!form.numero_documento?.trim() || form.numero_documento.trim().length < 8)
      e.numero_documento = 'Mínimo 8 caracteres';
    if (!form.id_tipo_doc) e.id_tipo_doc = 'Requerido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Email inválido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setModalOpen(true);
  };

  const abrirEditar = (cliente) => {
    setEditando(cliente);
    setForm({
      id_tipo_doc:      String(cliente.id_tipo_doc),
      numero_documento: cliente.numero_documento || '',
      nombres_razon:    cliente.nombres_razon || '',
      direccion:        cliente.direccion || '',
      telefono:         cliente.telefono || '',
      email:            cliente.email || '',
    });
    setErrores({});
    setModalOpen(true);
  };

  const guardar = async () => {
    if (!validarForm()) return;
    setSaving(true);
    try {
      if (editando) {
        await axios.put(`${API_BASE}/clientes/${editando.id_cliente}`, form);
        showToast('Cliente actualizado correctamente');
      } else {
        await axios.post(`${API_BASE}/clientes`, form);
        showToast('Cliente creado correctamente');
      }
      setModalOpen(false);
      fetchClientes();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errores?.join(', ') || 'Error al guardar';
      showToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const confirmarEliminar = (cliente) => {
    setClienteAEliminar(cliente);
    setConfirmOpen(true);
  };

  const eliminar = async () => {
    if (!clienteAEliminar) return;
    setConfirmOpen(false);
    try {
      await axios.delete(`${API_BASE}/clientes/${clienteAEliminar.id_cliente}`);
      showToast('Cliente eliminado');
      fetchClientes();
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo eliminar', 'error');
    } finally { setClienteAEliminar(null); }
  };

  // Estilos de tema
  const cardBg    = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder= isDark ? '#334155' : '#E2E8F0';
  const textMain  = isDark ? '#F1F5F9' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const bgPage    = isDark ? '#0F172A' : '#F8FAFC';
  const inputBg   = isDark ? '#334155' : '#F8FAFC';

  return (
    <div className="space-y-6 animate-in" style={{ color: textMain }}>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-pharma-lg slide-in"
          style={{ background: toast.type === 'error' ? '#EF4444' : 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
          role="status"
        >
          {toast.msg}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: textMain }}>Clientes</h2>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: textMuted }}>
            Directorio · {clientes.length} registros
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-blue hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
        >
          <UserPlus size={17} aria-hidden="true" />
          Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div
        className="rounded-2xl p-5 border"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: textMuted }} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por nombre, documento, email o teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none border transition-all"
            style={{ backgroundColor: inputBg, borderColor: cardBorder, color: textMain }}
            onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = cardBorder; e.target.style.boxShadow = 'none'; }}
            aria-label="Buscar clientes"
          />
        </div>
      </div>

      {/* Grid de tarjetas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ backgroundColor: cardBg }} />
          ))}
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: textMuted }}>
          <Users size={48} style={{ color: isDark ? '#334155' : '#E2E8F0' }} aria-hidden="true" />
          <p className="text-sm font-bold">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map(c => (
            <div
              key={c.id_cliente}
              className="rounded-2xl p-5 border transition-all hover:shadow-pharma-md group"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="flex justify-between items-start mb-4">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
                >
                  {c.nombres_razon?.charAt(0).toUpperCase() || '?'}
                </div>
                {/* Acciones */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirEditar(c)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    style={{ color: '#3B82F6', backgroundColor: isDark ? '#1E3A8A22' : '#EFF6FF' }}
                    aria-label={`Editar ${c.nombres_razon}`}
                  >
                    <Edit size={14} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => confirmarEliminar(c)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    style={{ color: '#EF4444', backgroundColor: isDark ? '#EF444422' : '#FEF2F2' }}
                    aria-label={`Eliminar ${c.nombres_razon}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <h4 className="font-black text-sm mb-0.5 truncate" style={{ color: textMain }}>
                {c.nombres_razon}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: textMuted }}>
                {c.tipo_doc_codigo || 'DOC'}: {c.numero_documento}
              </p>

              <div className="space-y-1.5">
                {c.telefono && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                    <Phone size={12} style={{ color: '#3B82F6' }} aria-hidden="true" />
                    <span>{c.telefono}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                    <Mail size={12} style={{ color: '#3B82F6' }} aria-hidden="true" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.direccion && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                    <MapPin size={12} style={{ color: '#3B82F6' }} aria-hidden="true" />
                    <span className="truncate">{c.direccion}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="md"
      >
        <ClienteForm form={form} setForm={setForm} errores={errores} tiposDoc={tiposDoc} isDark={isDark} />

        {/* Errores del servidor */}
        {errores.server && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-bold" role="alert">
            {errores.server}
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
          <button
            onClick={() => setModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
            style={{ color: textMuted, borderColor: isDark ? '#334155' : '#E2E8F0', backgroundColor: 'transparent' }}
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
          >
            {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear Cliente'}
          </button>
        </div>
      </Modal>

      {/* Confirmación eliminar */}
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={eliminar}
        onCancel={() => { setConfirmOpen(false); setClienteAEliminar(null); }}
        title="¿Eliminar cliente?"
        message={`Se eliminará permanentemente a "${clienteAEliminar?.nombres_razon}". Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
      />
    </div>
  );
};

export default Clientes;
