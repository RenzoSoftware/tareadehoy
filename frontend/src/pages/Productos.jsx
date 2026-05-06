/**
 * @fileoverview Productos - CRUD completo con tema claro/oscuro
 * Funciones: listar, crear, editar, eliminar con validaciones y confirmaciones.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Package, Plus, Edit2, Trash2, Info, Filter, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import StockBadge from '../components/StockBadge';
import VencimientoBadge from '../components/VencimientoBadge';
import BuscadorProductos from '../components/BuscadorProductos';
import AlertasVencimiento from '../components/AlertasVencimiento';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const API_BASE = 'http://localhost:5000/api';

const FILTROS = [
  { key: 'todos',     label: 'Todos' },
  { key: 'criticos',  label: '🔴 Stock Crítico' },
  { key: 'porVencer', label: '⚠️ Por Vencer' },
];

const FORM_INICIAL = {
  codigo_barra: '', nombre_comercial: '', principio_activo: '',
  concentracion: '', id_laboratorio: '', id_categoria: '',
  id_presentacion: '', requiere_receta: false, descripcion: '',
};

// ── Campo de formulario ─────────────────────────────────────────
const Field = ({ label, error, required, children, isDark }) => (
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

const inputStyle = (isDark) => ({
  backgroundColor: isDark ? '#334155' : '#F8FAFC',
  borderColor: isDark ? '#475569' : '#E2E8F0',
  color: isDark ? '#F1F5F9' : '#0F172A',
});

const InputEl = ({ isDark, ...props }) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border"
    style={inputStyle(isDark)}
    onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
    onBlur={e => { e.target.style.borderColor = isDark ? '#475569' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
  />
);

const SelectEl = ({ isDark, children, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border"
    style={inputStyle(isDark)}
    onFocus={e => { e.target.style.borderColor = '#3B82F6'; }}
    onBlur={e => { e.target.style.borderColor = isDark ? '#475569' : '#E2E8F0'; }}
  >
    {children}
  </select>
);

// ── Formulario de producto ──────────────────────────────────────
const ProductoForm = ({ form, setForm, errores, catalogos, isDark }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Field label="Nombre Comercial" required error={errores.nombre_comercial} isDark={isDark}>
        <InputEl isDark={isDark} type="text" maxLength={150} placeholder="Paracetamol 500mg"
          value={form.nombre_comercial}
          onChange={e => setForm(f => ({ ...f, nombre_comercial: e.target.value }))} />
      </Field>
      <Field label="Código de Barra" error={errores.codigo_barra} isDark={isDark}>
        <InputEl isDark={isDark} type="text" maxLength={50} placeholder="7501234000001"
          value={form.codigo_barra}
          onChange={e => setForm(f => ({ ...f, codigo_barra: e.target.value }))} />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Principio Activo" error={errores.principio_activo} isDark={isDark}>
        <InputEl isDark={isDark} type="text" maxLength={150} placeholder="Paracetamol"
          value={form.principio_activo}
          onChange={e => setForm(f => ({ ...f, principio_activo: e.target.value }))} />
      </Field>
      <Field label="Concentración" error={errores.concentracion} isDark={isDark}>
        <InputEl isDark={isDark} type="text" maxLength={50} placeholder="500mg"
          value={form.concentracion}
          onChange={e => setForm(f => ({ ...f, concentracion: e.target.value }))} />
      </Field>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <Field label="Categoría" required error={errores.id_categoria} isDark={isDark}>
        <SelectEl isDark={isDark} value={form.id_categoria}
          onChange={e => setForm(f => ({ ...f, id_categoria: e.target.value }))}>
          <option value="">Seleccionar...</option>
          {catalogos.categorias?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </SelectEl>
      </Field>
      <Field label="Laboratorio" required error={errores.id_laboratorio} isDark={isDark}>
        <SelectEl isDark={isDark} value={form.id_laboratorio}
          onChange={e => setForm(f => ({ ...f, id_laboratorio: e.target.value }))}>
          <option value="">Seleccionar...</option>
          {catalogos.laboratorios?.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </SelectEl>
      </Field>
      <Field label="Presentación" required error={errores.id_presentacion} isDark={isDark}>
        <SelectEl isDark={isDark} value={form.id_presentacion}
          onChange={e => setForm(f => ({ ...f, id_presentacion: e.target.value }))}>
          <option value="">Seleccionar...</option>
          {catalogos.presentaciones?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </SelectEl>
      </Field>
    </div>

    <Field label="Descripción" error={errores.descripcion} isDark={isDark}>
      <textarea
        maxLength={500} rows={2} placeholder="Descripción opcional..."
        value={form.descripcion}
        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border resize-none"
        style={inputStyle(isDark)}
        onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = isDark ? '#475569' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
      />
    </Field>

    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={form.requiere_receta}
        onChange={e => setForm(f => ({ ...f, requiere_receta: e.target.checked }))}
        className="w-4 h-4 rounded accent-blue-600"
      />
      <span className="text-sm font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
        Requiere receta médica
      </span>
    </label>
  </div>
);

// ── Página principal ────────────────────────────────────────────
const Productos = () => {
  const { isDark } = useTheme();
  const [productos, setProductos]         = useState([]);
  const [porVencer, setPorVencer]         = useState([]);
  const [catalogos, setCatalogos]         = useState({ categorias: [], laboratorios: [], presentaciones: [] });
  const [loading, setLoading]             = useState(true);
  const [loadingVencer, setLoadingVencer] = useState(true);
  const [filtro, setFiltro]               = useState('todos');
  const [searchTerm, setSearchTerm]       = useState('');
  const [error, setError]                 = useState(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [editando, setEditando]           = useState(null);
  const [form, setForm]                   = useState(FORM_INICIAL);
  const [errores, setErrores]             = useState({});
  const [saving, setSaving]               = useState(false);
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast]                 = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProductos = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_BASE}/productos`);
      setProductos(res.data);
    } catch { setError('No se pudo cargar el inventario.'); }
    finally { setLoading(false); }
  }, []);

  const fetchPorVencer = useCallback(async () => {
    setLoadingVencer(true);
    try {
      const res = await axios.get(`${API_BASE}/productos/por-vencer`);
      setPorVencer(res.data);
    } catch { /* silencioso */ }
    finally { setLoadingVencer(false); }
  }, []);

  const fetchCatalogos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/productos/catalogos`);
      setCatalogos(res.data);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => {
    fetchProductos(); fetchPorVencer(); fetchCatalogos();
  }, [fetchProductos, fetchPorVencer, fetchCatalogos]);

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];
    if (filtro === 'criticos')
      lista = lista.filter(p => (Number(p.stock_total) || 0) <= (Number(p.stock_minimo) || 0));
    else if (filtro === 'porVencer') {
      const ids = new Set(porVencer.map(p => p.id_producto));
      lista = lista.filter(p => ids.has(p.id_producto));
    }
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      lista = lista.filter(p =>
        p.nombre_comercial?.toLowerCase().includes(t) ||
        p.principio_activo?.toLowerCase().includes(t) ||
        p.nombre_categoria?.toLowerCase().includes(t)
      );
    }
    return lista.sort((a, b) => {
      const pa = (a.principio_activo || '').toLowerCase();
      const pb = (b.principio_activo || '').toLowerCase();
      return pa < pb ? -1 : pa > pb ? 1 : a.nombre_comercial.localeCompare(b.nombre_comercial);
    });
  }, [productos, porVencer, filtro, searchTerm]);

  const countCriticos = useMemo(
    () => productos.filter(p => (Number(p.stock_total) || 0) <= (Number(p.stock_minimo) || 0)).length,
    [productos]
  );

  const validarForm = () => {
    const e = {};
    if (!form.nombre_comercial?.trim() || form.nombre_comercial.trim().length < 2)
      e.nombre_comercial = 'Mínimo 2 caracteres';
    if (!form.id_laboratorio) e.id_laboratorio = 'Requerido';
    if (!form.id_categoria)   e.id_categoria   = 'Requerido';
    if (!form.id_presentacion) e.id_presentacion = 'Requerido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setModalOpen(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({
      codigo_barra:     p.codigo_barra || '',
      nombre_comercial: p.nombre_comercial || '',
      principio_activo: p.principio_activo || '',
      concentracion:    p.concentracion || '',
      id_laboratorio:   String(p.id_laboratorio || ''),
      id_categoria:     String(p.id_categoria || ''),
      id_presentacion:  String(p.id_presentacion || ''),
      requiere_receta:  Boolean(p.requiere_receta),
      descripcion:      p.descripcion || '',
    });
    setErrores({});
    setModalOpen(true);
  };

  const guardar = async () => {
    if (!validarForm()) return;
    setSaving(true);
    try {
      if (editando) {
        await axios.put(`${API_BASE}/productos/${editando.id_producto}`, form);
        showToast('Producto actualizado correctamente');
      } else {
        await axios.post(`${API_BASE}/productos`, form);
        showToast('Producto creado correctamente');
      }
      setModalOpen(false);
      fetchProductos();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errores?.join(', ') || 'Error al guardar';
      showToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const confirmarEliminar = (p) => {
    setProductoAEliminar(p);
    setConfirmOpen(true);
  };

  const eliminar = async () => {
    if (!productoAEliminar) return;
    setConfirmOpen(false);
    try {
      const res = await axios.delete(`${API_BASE}/productos/${productoAEliminar.id_producto}`);
      if (res.data.tipo === 'fisico') {
        showToast('Producto eliminado');
      } else {
        showToast('Producto desactivado (tiene ventas asociadas)');
      }
      fetchProductos();
    } catch (err) {
      // Si tiene ventas, ofrecer baja lógica
      if (err.response?.data?.canSoftDelete) {
        try {
          await axios.patch(`${API_BASE}/productos/${productoAEliminar.id_producto}/desactivar`);
          showToast('Producto desactivado del inventario');
          fetchProductos();
        } catch { showToast('No se pudo desactivar el producto', 'error'); }
      } else {
        showToast(err.response?.data?.error || 'No se pudo eliminar', 'error');
      }
    } finally { setProductoAEliminar(null); }
  };

  // Estilos de tema
  const cardBg    = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder= isDark ? '#334155' : '#E2E8F0';
  const textMain  = isDark ? '#F1F5F9' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const inputBg   = isDark ? '#334155' : '#F8FAFC';
  const theadBg   = isDark ? '#0F172A' : '#F8FAFC';
  const rowHover  = isDark ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.03)';
  const groupBg   = isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)';

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
          <h2 className="text-2xl font-black tracking-tight" style={{ color: textMain }}>Inventario</h2>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: textMuted }}>
            Gestión Global de Stock
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-blue hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
        >
          <Plus size={17} aria-hidden="true" />
          Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tabla principal */}
        <div className="xl:col-span-2 space-y-4">
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            {/* Buscador */}
            <BuscadorProductos
              placeholder="Buscar por marca, principio activo o categoría..."
              onSelect={p => setSearchTerm(p.nombre_comercial)}
              className="mb-4"
            />

            {/* Filtros */}
            <div className="flex gap-2 mb-4 flex-wrap items-center">
              {FILTROS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key)}
                  className="px-3.5 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5"
                  style={filtro === f.key
                    ? { background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)', color: '#fff', borderColor: 'transparent' }
                    : { backgroundColor: isDark ? '#334155' : '#F8FAFC', color: textMuted, borderColor: cardBorder }
                  }
                  aria-pressed={filtro === f.key}
                >
                  {f.label}
                  {f.key === 'criticos' && countCriticos > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {countCriticos}
                    </span>
                  )}
                  {f.key === 'porVencer' && porVencer.length > 0 && (
                    <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {porVencer.length}
                    </span>
                  )}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <Filter size={13} style={{ color: textMuted }} aria-hidden="true" />
                <input
                  type="text" placeholder="Filtrar..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="text-xs rounded-xl px-3 py-2 outline-none border w-32 transition-all"
                  style={{ backgroundColor: inputBg, borderColor: cardBorder, color: textMain }}
                  onFocus={e => { e.target.style.borderColor = '#3B82F6'; }}
                  onBlur={e => { e.target.style.borderColor = cardBorder; }}
                  aria-label="Filtrar por texto"
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: cardBorder }}>
              <table className="w-full" role="table">
                <thead style={{ backgroundColor: theadBg }}>
                  <tr>
                    {['Producto / Composición', 'Categoría / Lab', 'Existencias', 'Vencimiento', 'Gestión'].map((h, i) => (
                      <th key={i} scope="col"
                        className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em]"
                        style={{
                          color: textMuted,
                          textAlign: i === 0 ? 'left' : i === 4 ? 'right' : 'center',
                          borderBottom: `1px solid ${cardBorder}`,
                        }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((p, idx) => {
                    const prevActive = idx > 0 ? productosFiltrados[idx - 1].principio_activo : null;
                    const showGroup  = p.principio_activo && p.principio_activo !== prevActive;
                    return (
                      <React.Fragment key={p.id_producto}>
                        {showGroup && (
                          <tr style={{ backgroundColor: groupBg }}>
                            <td colSpan="5" className="px-5 py-2"
                              style={{ borderBottom: `1px solid ${cardBorder}` }}>
                              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#3B82F6' }}>
                                Grupo: {p.principio_activo}
                              </span>
                            </td>
                          </tr>
                        )}
                        <tr
                          className="group transition-colors"
                          style={{ borderBottom: `1px solid ${cardBorder}` }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = rowHover}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-black truncate" style={{ color: textMain }}>
                              {p.nombre_comercial}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                              {p.nombre_presentacion} · {p.concentracion}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1"
                              style={{ backgroundColor: isDark ? '#1E3A8A33' : '#EFF6FF', color: '#3B82F6' }}
                            >
                              {p.nombre_categoria}
                            </span>
                            <p className="text-xs font-bold ml-0.5" style={{ color: textMuted }}>
                              {p.nombre_laboratorio}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <StockBadge stockActual={p.stock_total} stockMinimo={p.stock_minimo} />
                          </td>
                          <td className="px-5 py-4 text-center">
                            <VencimientoBadge diasParaVencer={p.dias_para_vencer} fechaVencimiento={p.proximo_vencimiento} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => abrirEditar(p)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                                style={{ color: '#3B82F6', backgroundColor: isDark ? '#1E3A8A22' : '#EFF6FF' }}
                                aria-label={`Editar ${p.nombre_comercial}`}
                              >
                                <Edit2 size={14} aria-hidden="true" />
                              </button>
                              <button
                                onClick={() => confirmarEliminar(p)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                                style={{ color: '#EF4444', backgroundColor: isDark ? '#EF444422' : '#FEF2F2' }}
                                aria-label={`Eliminar ${p.nombre_comercial}`}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3" role="status">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  <p className="text-sm" style={{ color: textMuted }}>Cargando inventario...</p>
                </div>
              )}
              {!loading && error && (
                <div className="text-center py-12 flex flex-col items-center gap-2" role="alert">
                  <Package size={44} style={{ color: isDark ? '#334155' : '#E2E8F0' }} aria-hidden="true" />
                  <p className="font-bold text-sm text-red-500">{error}</p>
                </div>
              )}
              {!loading && !error && productosFiltrados.length === 0 && (
                <div className="text-center py-16 flex flex-col items-center gap-2" role="status">
                  <Package size={44} style={{ color: isDark ? '#334155' : '#E2E8F0' }} aria-hidden="true" />
                  <p className="text-sm" style={{ color: textMuted }}>No se encontraron productos</p>
                </div>
              )}
            </div>

            {!loading && productosFiltrados.length > 0 && (
              <p className="text-xs font-bold mt-3 text-right" style={{ color: textMuted }}>
                {productosFiltrados.length} de {productos.length} productos
              </p>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="xl:col-span-1">
          <AlertasVencimiento productos={porVencer} loading={loadingVencer} />
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductoForm form={form} setForm={setForm} errores={errores} catalogos={catalogos} isDark={isDark} />

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
            {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear Producto'}
          </button>
        </div>
      </Modal>

      {/* Confirmación eliminar */}
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={eliminar}
        onCancel={() => { setConfirmOpen(false); setProductoAEliminar(null); }}
        title="¿Eliminar producto?"
        message={`Se eliminará "${productoAEliminar?.nombre_comercial}". Si tiene ventas asociadas, se realizará una baja lógica.`}
        confirmLabel="Sí, eliminar"
      />
    </div>
  );
};

export default Productos;
