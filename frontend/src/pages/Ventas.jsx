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

const API_BASE = 'http://localhost:5000/api';

const Ventas = ({ user }) => {
  const [comprobantes, setComprobantes] = useState([]);
  const [tipoComp, setTipoComp]         = useState('');
  const [formaPago, setFormaPago]       = useState('CONTADO');
  const [montoRecibido, setMontoRecibido] = useState(0);
  const [docCliente, setDocCliente]     = useState('');
  const [cliente, setCliente]           = useState(null);
  const [carrito, setCarrito]           = useState([]);
  const [errorMsg, setErrorMsg]         = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/ventas/comprobantes`)
      .then((res) => {
        setComprobantes(res.data);
        if (res.data.length > 0) setTipoComp(res.data[0].id_tipo_comprobante);
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
        forma_pago:          formaPago,
        monto_recibido:      montoRecibido,
        detalle: carrito.map((item) => ({
          id_producto:        item.id_producto,
          id_producto_precio: item.id_producto_precio,
          cantidad:           item.cantidad,
        })),
      };

      const res = await axios.post(`${API_BASE}/ventas`, data);
      setSuccessMsg(res.data.mensaje || '¡Venta registrada con éxito!');
      setCarrito([]);
      setCliente(null);
      setDocCliente('');
      setMontoRecibido(0);
    } catch (err) {
      console.error('Error al guardar venta:', err);
      setErrorMsg(err.response?.data?.error || 'Error al guardar la venta. Intente nuevamente.');
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
        <div className="bg-white p-6 rounded-2xl shadow-pharma border border-blue-50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-pharma-text" htmlFor="tipo-comprobante">
                Tipo Comprobante
              </label>
              <select
                id="tipo-comprobante"
                className="w-full border border-blue-100 p-2.5 rounded-xl focus:ring-2 focus:ring-pharma-primary outline-none bg-pharma-bg"
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
              <label className="block text-sm font-bold mb-1 text-pharma-text" htmlFor="doc-cliente">
                Buscar Cliente (DNI/RUC)
              </label>
              <div className="flex gap-2">
                <input
                  id="doc-cliente"
                  type="text"
                  className="flex-1 border border-blue-100 p-2.5 rounded-xl focus:ring-2 focus:ring-pharma-primary outline-none bg-pharma-bg"
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
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-black text-pharma-text">{cliente.nombres_razon_social}</p>
              <p className="text-xs text-pharma-muted">Doc: {cliente.numero_documento}</p>
            </div>
          )}
        </div>

        {/* Buscador de productos avanzado */}
        <div className="bg-white p-6 rounded-2xl shadow-pharma border border-gray-50">
          <label className="block text-sm font-bold mb-3 text-pharma-text">
            Buscar Producto
          </label>
          <BuscadorProductos
            onSelect={agregarAlCarrito}
            placeholder="Nombre comercial o principio activo..."
          />
        </div>

        {/* Tabla del carrito */}
        <div className="bg-white rounded-2xl shadow-pharma border border-gray-50 overflow-hidden">
          <table className="w-full" role="table" aria-label="Carrito de venta">
            <thead className="bg-pharma-bg">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-black text-pharma-muted uppercase tracking-wider">Producto</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-black text-pharma-muted uppercase tracking-wider">Precio</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-black text-pharma-muted uppercase tracking-wider">Cant.</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-black text-pharma-muted uppercase tracking-wider">Subtotal</th>
                <th scope="col" className="px-6 py-3" aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {carrito.map((item, index) => (
                <tr key={index} role="row">
                  <td className="px-6 py-4 text-sm font-bold text-pharma-text">{item.nombre_comercial}</td>
                  <td className="px-6 py-4 text-sm text-right text-pharma-muted">
                    S/ {item.precio_unitario.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                        className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 text-pharma-text font-black text-xs transition-colors"
                        aria-label={`Reducir cantidad de ${item.nombre_comercial}`}
                      >
                        −
                      </button>
                      <span className="font-black w-6 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                        className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 text-pharma-text font-black text-xs transition-colors"
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
                      className="text-pharma-muted hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                      aria-label={`Eliminar ${item.nombre_comercial} del carrito`}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
              {carrito.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-pharma-muted italic text-sm">
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
        <div className="bg-white p-6 rounded-2xl shadow-pharma border border-blue-50 space-y-4">
          <h3 className="text-lg font-black text-pharma-text border-b border-blue-50 pb-3">Resumen de Pago</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-pharma-muted">
                Forma de Pago
              </label>
              <select
                className="w-full border border-blue-100 p-2.5 rounded-xl focus:ring-2 focus:ring-pharma-primary outline-none bg-pharma-bg text-sm font-bold"
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
              >
                <option value="CONTADO">Efectivo (Contado)</option>
                <option value="TARJETA">Tarjeta Débito/Crédito</option>
                <option value="TRANSFERENCIA">Transferencia / Yape / Plin</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-pharma-muted">
                Monto Recibido
              </label>
              <input
                type="number"
                className="w-full border border-blue-100 p-2.5 rounded-xl focus:ring-2 focus:ring-pharma-primary outline-none bg-pharma-bg text-sm font-bold"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-blue-50">
            <div className="flex justify-between text-sm text-pharma-muted font-bold">
              <span>Subtotal</span>
              <span>S/ {(total / 1.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-pharma-muted font-bold">
              <span>IGV (18%)</span>
              <span>S/ {(total - total / 1.18).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-2xl font-black text-pharma-text pt-2 border-t border-blue-50">
            <span>Total:</span>
            <span className="text-blue-600">S/ {total.toFixed(2)}</span>
          </div>

          {montoRecibido > total && (
            <div className="flex justify-between text-lg font-black text-green-600 pt-2">
              <span>Vuelto:</span>
              <span>S/ {(montoRecibido - total).toFixed(2)}</span>
            </div>
          )}

          <button
            onClick={guardarVenta}
            disabled={carrito.length === 0 || !cliente}
            className="w-full text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-blue hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
