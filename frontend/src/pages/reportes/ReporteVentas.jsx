import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart2, Filter, Download, Eye,
  Printer, X, RefreshCw, ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const ReporteVentas = () => {
  const { isDark } = useTheme();

  const [ventas, setVentas]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [resumen, setResumen]     = useState({ hoy: 0, mes: 0, ticketPromedio: 0, totalTransacciones: 0 });
  const [vendedores, setVendedores]   = useState([]);
  const [comprobantes, setComprobantes] = useState([]);

  const [filtros, setFiltros] = useState({
    desde: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
    tipo: 'Todos',
    usuario: 'Todos',
  });

  const [currentPage, setCurrentPage]       = useState(1);
  const itemsPerPage = 10;
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVenta, setSelectedVenta]     = useState(null);

  // ── Estilos dinámicos ──────────────────────────────────────
  const s = {
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor:     isDark ? '#334155' : '#EFF6FF',
    },
    text:  { color: isDark ? '#F1F5F9' : '#1E293B' },
    muted: { color: isDark ? '#94A3B8' : '#64748B' },
    input: {
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      borderColor:     isDark ? '#334155' : '#DBEAFE',
      color:           isDark ? '#F1F5F9' : '#1E293B',
    },
    tableHeader: { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
    divider:     { borderColor: isDark ? '#334155' : '#EFF6FF' },
    modalBg:     { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
    footerBg:    { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
  };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = `desde=${filtros.desde}&hasta=${filtros.hasta}&tipo=${filtros.tipo}&usuario=${filtros.usuario}`;
      const [ventasRes, resumenRes, comprobantesRes] = await Promise.all([
        axios.get(`${API_BASE}/ventas?${query}`),
        axios.get(`${API_BASE}/ventas/resumen`),
        axios.get(`${API_BASE}/ventas/comprobantes`),
      ]);

      const data = Array.isArray(ventasRes.data) ? ventasRes.data : [];
      setVentas(data);
      const r = resumenRes.data || {};
      setResumen({
        hoy:               parseFloat(r.hoy)               || 0,
        mes:               parseFloat(r.mes)               || 0,
        ticketPromedio:    parseFloat(r.ticketPromedio)    || 0,
        totalTransacciones: parseInt(r.totalTransacciones) || 0,
      });
      setComprobantes(comprobantesRes.data || []);
      setVendedores([...new Set(data.map(v => v.vendedor))].filter(Boolean));
      setCurrentPage(1);
    } catch {
      setError('Error al cargar el reporte de ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerDetalle = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/ventas/${id}`);
      setSelectedVenta(res.data);
      setShowDetailModal(true);
    } catch {
      alert('Error al cargar detalle de venta');
    }
  };

  // ── Paginación ─────────────────────────────────────────────
  const indexOfLast  = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentVentas = ventas.slice(indexOfFirst, indexOfLast);
  const totalPages    = Math.ceil(ventas.length / itemsPerPage);

  // ── Totales ────────────────────────────────────────────────
  const granTotal     = ventas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
  const subtotalTotal = granTotal / 1.18;
  const igvTotal      = granTotal - subtotalTotal;

  // ── Gráfico por día ────────────────────────────────────────
  const dailyVentas = ventas.reduce((acc, v) => {
    const date = new Date(v.fecha_hora).toLocaleDateString('es-PE');
    acc[date] = (acc[date] || 0) + parseFloat(v.total || 0);
    return acc;
  }, {});
  const maxVenta = Math.max(...Object.values(dailyVentas), 1);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={s.text}>Reporte de Ventas</h1>
        <p className="text-xs font-bold tracking-widest mt-1" style={s.muted}>
          BOTICA NOVA SALUD · ANÁLISIS DE VENTAS
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'VENTAS DEL DÍA',      value: `S/ ${(resumen.hoy || 0).toFixed(2)}`,            color: '#3B82F6' },
          { label: 'VENTAS DEL MES',      value: `S/ ${(resumen.mes || 0).toFixed(2)}`,            color: '#10B981' },
          { label: 'TICKET PROMEDIO',     value: `S/ ${(resumen.ticketPromedio || 0).toFixed(2)}`, color: '#F59E0B' },
          { label: 'TOTAL TRANSACCIONES', value: resumen.totalTransacciones || 0,                  color: '#6366F1' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-5 rounded-2xl shadow-pharma border"
            style={{ ...s.card, borderLeft: `4px solid ${color}` }}
          >
            <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={s.muted}>{label}</p>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="p-5 rounded-2xl shadow-pharma border" style={s.card}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {[
            { label: 'DESDE', key: 'desde', type: 'date' },
            { label: 'HASTA', key: 'hasta', type: 'date' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-[11px] font-bold mb-1.5" style={s.muted}>{label}</label>
              <input
                type={type}
                className="w-full border p-2.5 rounded-xl outline-none text-sm"
                style={s.input}
                value={filtros[key]}
                onChange={e => setFiltros({ ...filtros, [key]: e.target.value })}
              />
            </div>
          ))}

          <div>
            <label className="block text-[11px] font-bold mb-1.5" style={s.muted}>COMPROBANTE</label>
            <select
              className="w-full border p-2.5 rounded-xl outline-none text-sm"
              style={s.input}
              value={filtros.tipo}
              onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
            >
              <option>Todos</option>
              {comprobantes.map(c => (
                <option key={c.id_tipo_comprobante}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold mb-1.5" style={s.muted}>VENDEDOR</label>
            <select
              className="w-full border p-2.5 rounded-xl outline-none text-sm"
              style={s.input}
              value={filtros.usuario}
              onChange={e => setFiltros({ ...filtros, usuario: e.target.value })}
            >
              <option>Todos</option>
              {vendedores.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="flex-1 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #2563EB)' }}
            >
              <Filter size={16} /> Filtrar
            </button>
            <button
              onClick={() => alert('Exportación PDF en desarrollo')}
              className="text-white font-black py-2.5 px-4 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico por día */}
      <div className="p-5 rounded-2xl shadow-pharma border" style={s.card}>
        <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={s.text}>
          <BarChart2 size={18} color="#3B82F6" aria-hidden="true" /> VENTAS POR DÍA
        </h3>
        <div className="flex items-end gap-2 h-40 border-b pb-2" style={s.divider}>
          {Object.entries(dailyVentas).map(([date, amount]) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t"
                style={{ height: `${(amount / maxVenta) * 120}px`, backgroundColor: '#3B82F6' }}
                title={`S/ ${amount.toFixed(2)}`}
              />
              <span className="text-[9px] font-bold" style={s.muted}>
                {date.split('/')[0]}/{date.split('/')[1]}
              </span>
            </div>
          ))}
          {Object.keys(dailyVentas).length === 0 && (
            <p className="w-full text-center text-sm" style={s.muted}>Sin datos para el gráfico</p>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl shadow-pharma border overflow-hidden" style={s.card}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="animate-spin" size={32} color="#3B82F6" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 font-bold">{error}</div>
        ) : (
          <>
            <table className="w-full" role="table" aria-label="Reporte de ventas">
              <thead style={s.tableHeader}>
                <tr>
                  {['Fecha', 'N° Comprobante', 'Tipo', 'Cliente', 'Items', 'Subtotal', 'IGV', 'Total', 'Vendedor', ''].map(h => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                      style={s.muted}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={s.divider}>
                {currentVentas.map(v => (
                  <tr key={v.id_venta}>
                    <td className="px-4 py-3 text-sm" style={s.text}>
                      {new Date(v.fecha_hora).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-4 py-3 text-sm font-black" style={s.text}>{v.numero_completo}</td>
                    <td className="px-4 py-3 text-sm" style={s.muted}>{v.tipo_comprobante}</td>
                    <td className="px-4 py-3 text-sm" style={s.text}>{v.cliente_nombre || 'Público General'}</td>
                    <td className="px-4 py-3 text-sm text-center" style={s.muted}>{v.cantidad_items}</td>
                    <td className="px-4 py-3 text-sm" style={s.muted}>S/ {(parseFloat(v.total) / 1.18).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm" style={s.muted}>S/ {(parseFloat(v.total) - parseFloat(v.total) / 1.18).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-black text-pharma-primary">S/ {parseFloat(v.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm" style={s.muted}>{v.vendedor}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleVerDetalle(v.id_venta)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-blue-500 hover:text-white"
                        style={s.muted}
                        aria-label={`Ver detalle venta ${v.numero_completo}`}
                      >
                        <Eye size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
                {currentVentas.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-4 py-12 text-center italic text-sm" style={s.muted}>
                      No hay ventas para el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totales al pie */}
            <div className="px-6 py-4 flex justify-end gap-10 border-t" style={{ ...s.footerBg, ...s.divider }}>
              {[
                { label: 'SUBTOTAL', value: subtotalTotal },
                { label: 'IGV (18%)',  value: igvTotal },
                { label: 'GRAN TOTAL', value: granTotal, highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-wider mb-1" style={s.muted}>{label}</p>
                  <p
                    className={`font-black ${highlight ? 'text-xl text-pharma-primary' : 'text-base'}`}
                    style={highlight ? {} : s.text}
                  >
                    S/ {value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <div className="px-6 py-3 flex justify-between items-center border-t" style={s.divider}>
              <span className="text-sm" style={s.muted}>
                Mostrando {ventas.length === 0 ? 0 : indexOfFirst + 1}–{Math.min(indexOfLast, ventas.length)} de {ventas.length} registros
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg border transition-colors disabled:opacity-40"
                  style={s.card}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} style={s.muted} />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg border transition-colors disabled:opacity-40"
                  style={s.card}
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={16} style={s.muted} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detalle */}
      {showDetailModal && selectedVenta && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de venta"
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-8 shadow-pharma-lg"
            style={{ ...s.modalBg, borderColor: isDark ? '#334155' : '#EFF6FF' }}
          >
            {/* Cabecera modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black" style={s.text}>Detalle de Venta</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                style={s.muted}
                aria-label="Cerrar modal"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            {/* Info general */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl mb-6" style={s.tableHeader}>
              {[
                { label: 'FECHA',       value: new Date(selectedVenta.fecha_hora).toLocaleString('es-PE') },
                { label: 'COMPROBANTE', value: selectedVenta.numero_completo },
                { label: 'CLIENTE',     value: selectedVenta.cliente_nombre || 'Público General' },
                { label: 'VENDEDOR',    value: selectedVenta.vendedor },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] font-black uppercase tracking-wider mb-1" style={s.muted}>{label}</p>
                  <p className="text-sm font-black" style={s.text}>{value}</p>
                </div>
              ))}
            </div>

            {/* Detalle productos */}
            <table className="w-full mb-6" role="table">
              <thead>
                <tr className="border-b-2" style={s.divider}>
                  {['Producto', 'Cant.', 'Precio U.', 'Subtotal'].map(h => (
                    <th key={h} className="pb-2 text-[11px] font-black uppercase tracking-wider text-left" style={s.muted}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={s.divider}>
                {selectedVenta.detalle?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-sm" style={s.text}>{item.nombre_comercial}</td>
                    <td className="py-2 text-sm text-center" style={s.muted}>{item.cantidad}</td>
                    <td className="py-2 text-sm text-right" style={s.muted}>S/ {parseFloat(item.precio_unitario).toFixed(2)}</td>
                    <td className="py-2 text-sm text-right font-black" style={s.text}>S/ {parseFloat(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales modal */}
            <div className="flex flex-col items-end gap-2 mb-6">
              <div className="flex gap-10 text-sm" style={s.muted}>
                <span>Subtotal:</span>
                <span>S/ {(parseFloat(selectedVenta.total) / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex gap-10 text-sm" style={s.muted}>
                <span>IGV (18%):</span>
                <span>S/ {(parseFloat(selectedVenta.total) - parseFloat(selectedVenta.total) / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex gap-10 text-xl font-black text-pharma-primary">
                <span>TOTAL:</span>
                <span>S/ {parseFloat(selectedVenta.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Acciones modal */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="text-white font-black py-2.5 px-5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
              >
                <Printer size={18} aria-hidden="true" /> Imprimir
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="py-2.5 px-5 rounded-xl border font-black transition-colors hover:opacity-80"
                style={{ ...s.card, ...s.text }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteVentas;
