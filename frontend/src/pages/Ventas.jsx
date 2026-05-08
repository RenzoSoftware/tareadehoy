/**
 * @fileoverview Ventas - Punto de venta (POS)
 *
 * Usa BuscadorProductos para búsqueda avanzada por nombre y principio activo.
 * Muestra disponibilidad de stock y precios en el buscador.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, Save } from 'lucide-react';
import BuscadorProductos from '../components/BuscadorProductos';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const Ventas = ({ user }) => {
  const { isDark } = useTheme();
  const [comprobantes, setComprobantes] = useState([]);
  const [tipoComp, setTipoComp]         = useState('1');
  const [docCliente, setDocCliente]     = useState('');
  const [cliente, setCliente]           = useState(null);
  const [carrito, setCarrito]           = useState([]);
  const [errorMsg, setErrorMsg]         = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  // Estilos dinámicos según el tema
  const s = {
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#334155' : '#EFF6FF',
    },
    text: {
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    muted: {
      color: isDark ? '#94A3B8' : '#64748B',
    },
    input: {
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      borderColor: isDark ? '#334155' : '#DBEAFE',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    tableHeader: {
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    }
  };

  useEffect(() => {
    axios.get(`${API_BASE}/ventas/comprobantes`)
      .then((res) => {
        setComprobantes(res.data);
        if (res.data.length > 0) {
          setTipoComp(String(res.data[0].id_tipo_comprobante));
        }
      })
      .catch((err) => console.error('Error al cargar comprobantes:', err));
  }, []);

  const buscarCliente = async () => {
    if (!docCliente.trim()) return;
    setErrorMsg('');
    try {
      const res = await axios.get(`${API_BASE}/clientes/buscar/${docCliente.trim()}`);
      setCliente(res.data);
    } catch {
      setErrorMsg('Cliente no encontrado. Verifique el número de documento.');
      setCliente(null);
    }
  };

  /**
   * Agrega un producto al carrito desde el BuscadorProductos.
   * @param {Object} producto - Producto seleccionado
   */
  const agregarAlCarrito = (producto) => {
    setErrorMsg('');
    const itemExistente = carrito.find((item) => item.id_producto === producto.id_producto);

    if (itemExistente) {
      setCarrito(carrito.map((item) =>
        item.id_producto === producto.id_producto
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.precio_unitario,
            }
          : item
      ));
    } else {
      setCarrito([
        ...carrito,
        {
          id_producto:       producto.id_producto,
          id_producto_precio: producto.id_producto_precio || null,
          nombre_comercial:  producto.nombre_comercial,
          precio_unitario:   parseFloat(producto.precio_unitario) || 0,
          cantidad:          1,
          subtotal:          parseFloat(producto.precio_unitario) || 0,
        },
      ]);
    }
  };

  const eliminarItem = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCarrito(carrito.map((item, i) =>
      i === index
        ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio_unitario }
        : item
    ));
  };

  const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  if (!user) {
    return (
      <div className="p-6 text-center text-sm font-bold" style={{ color: '#EF4444' }}>
        Error: sesión no válida. Por favor recarga la página.
      </div>
    );
  }

  const guardarVenta = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!cliente) {
      setErrorMsg('Seleccione un cliente antes de finalizar la venta.');
      return;
    }
    if (carrito.length === 0) {
      setErrorMsg('El carrito está vacío. Agregue al menos un producto.');
      return;
    }

    try {
      const data = {
        id_cliente:          cliente.id_cliente,
        id_usuario:          user.id_usuario,
        id_tipo_comprobante: tipoComp,
        serie_documento:     'F001',
        numero_documento:    '000001',
        total,
        detalle: carrito.map((item) => ({
          id_producto:        item.id_producto,
          id_producto_precio: item.id_producto_precio,
          cantidad:           item.cantidad,
          precio_unitario:    item.precio_unitario,
          subtotal:           item.subtotal,
        })),
      };

      await axios.post(`${API_BASE}/ventas`, data);
      setSuccessMsg('¡Venta registrada con éxito!');
      setCarrito([]);
      setCliente(null);
      setDocCliente('');
    } catch (err) {
      console.error('Error al guardar venta:', err);
      const msg = err.response?.data?.error || 'Error al guardar la venta. Intente nuevamente.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Formulario */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mensajes de estado */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-bold" role="alert">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl text-sm font-bold" role="status">
            {successMsg}
          </div>
        )}

        {/* Comprobante y cliente */}
        <div className="p-6 rounded-2xl shadow-pharma space-y-4 border" style={s.card}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={s.text} htmlFor="tipo-comprobante">
                Tipo Comprobante
              </label>
              <select
                id="tipo-comprobante"
                className="w-full border p-2.5 rounded-xl outline-none"
                style={s.input}
                value={tipoComp}
                onChange={(e) => setTipoComp(e.target.value)}
              >
                {comprobantes.map((c) => (
                  <option key={c.id_tipo_comprobante} value={c.id_tipo_comprobante}>
                    {c.nombre_documento || c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={s.text} htmlFor="doc-cliente">
                Buscar Cliente (DNI/RUC)
              </label>
              <div className="flex gap-2">
                <input
                  id="doc-cliente"
                  type="text"
                  className="flex-1 border p-2.5 rounded-xl outline-none"
                  style={s.input}
                  value={docCliente}
                  onChange={(e) => setDocCliente(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarCliente()}
                  aria-label="Número de documento del cliente"
                />
                <button
                  onClick={buscarCliente}
                  className="text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #06B6D4, #2563EB)' }}
                  aria-label="Buscar cliente"
                >
                  <Search size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {cliente && (
            <div className="p-3 rounded-xl border" style={{ backgroundColor: isDark ? '#0F172A' : '#EFF6FF', borderColor: isDark ? '#334155' : '#DBEAFE' }}>
              <p className="text-sm font-black" style={s.text}>{cliente.nombres_razon}</p>
              <p className="text-xs" style={s.muted}>Doc: {cliente.numero_documento}</p>
            </div>
          )}
        </div>

        {/* Buscador de productos avanzado */}
        <div className="p-6 rounded-2xl shadow-pharma border" style={s.card}>
          <label className="block text-sm font-bold mb-3" style={s.text}>
            Buscar Producto
          </label>
          <BuscadorProductos
            onSelect={agregarAlCarrito}
            placeholder="Nombre comercial o principio activo..."
          />
        </div>

        {/* Tabla del carrito */}
        <div className="rounded-2xl shadow-pharma border overflow-hidden" style={s.card}>
          <table className="w-full" role="table" aria-label="Carrito de venta">
            <thead style={s.tableHeader}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider" style={s.muted}>Producto</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider" style={s.muted}>Precio</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-black uppercase tracking-wider" style={s.muted}>Cant.</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider" style={s.muted}>Subtotal</th>
                <th scope="col" className="px-6 py-3" aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: isDark ? '#334155' : '#EFF6FF' }}>
              {carrito.map((item, index) => (
                <tr key={index} role="row">
                  <td className="px-6 py-4 text-sm font-bold" style={s.text}>{item.nombre_comercial}</td>
                  <td className="px-6 py-4 text-sm text-right" style={s.muted}>
                    S/ {item.precio_unitario.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                        className="w-6 h-6 rounded-lg font-black text-xs transition-colors"
                        style={{ backgroundColor: isDark ? '#0F172A' : '#EFF6FF', color: isDark ? '#F1F5F9' : '#1E293B' }}
                        aria-label={`Reducir cantidad de ${item.nombre_comercial}`}
                      >
                        −
                      </button>
                      <span className="font-black w-6 text-center" style={s.text}>{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                        className="w-6 h-6 rounded-lg font-black text-xs transition-colors"
                        style={{ backgroundColor: isDark ? '#0F172A' : '#EFF6FF', color: isDark ? '#F1F5F9' : '#1E293B' }}
                        aria-label={`Aumentar cantidad de ${item.nombre_comercial}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-black text-pharma-primary">
                    S/ {item.subtotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => eliminarItem(index)}
                      className="transition-colors p-1 rounded-lg hover:bg-red-500 hover:text-white"
                      style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                      aria-label={`Eliminar ${item.nombre_comercial} del carrito`}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
              {carrito.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center italic text-sm" style={s.muted}>
                    No hay productos en el detalle
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Columna Derecha: Resumen */}
      <div className="space-y-6">
        <div className="p-6 rounded-2xl shadow-pharma border space-y-4" style={s.card}>
          <h3 className="text-lg font-black border-b pb-3" style={{ ...s.text, borderColor: isDark ? '#334155' : '#EFF6FF' }}>Resumen</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm" style={s.muted}>
              <span>Subtotal</span>
              <span>S/ {(total / 1.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm" style={s.muted}>
              <span>IGV (18%)</span>
              <span>S/ {(total - total / 1.18).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-2xl font-black pt-2 border-t" style={{ ...s.text, borderColor: isDark ? '#334155' : '#EFF6FF' }}>
            <span>Total:</span>
            <span className="text-gradient-cyan">S/ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={guardarVenta}
            disabled={carrito.length === 0 || !cliente}
            className="w-full text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-blue hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #06B6D4, #2563EB)' }}
            aria-label="Finalizar y registrar venta"
          >
            <Save size={20} aria-hidden="true" />
            FINALIZAR VENTA
          </button>

          {!cliente && (
            <p className="text-[10px] text-pharma-muted text-center font-bold">
              Seleccione un cliente para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ventas;
