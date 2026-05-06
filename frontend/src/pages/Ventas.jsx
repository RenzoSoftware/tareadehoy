import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Save, UserPlus } from 'lucide-react';

const Ventas = ({ user }) => {
  const [comprobantes, setComprobantes] = useState([]);
  const [tipoComp, setTipoComp] = useState('1');
  const [docCliente, setDocCliente] = useState('');
  const [cliente, setCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productosBusqueda, setProductosBusqueda] = useState([]);
  const [carrito, setCarrito] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:5000/api/ventas/comprobantes')
      .then(res => setComprobantes(res.data));
  }, []);

  const buscarCliente = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clientes/buscar/${docCliente}`);
      setCliente(res.data);
    } catch (err) {
      alert('Cliente no encontrado');
      setCliente(null);
    }
  };

  const buscarProductos = async (val) => {
    setSearchTerm(val);
    if (val.length > 2) {
      const res = await axios.get(`http://localhost:5000/api/productos/search?term=${val}`);
      setProductosBusqueda(res.data);
    } else {
      setProductosBusqueda([]);
    }
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id_producto === producto.id_producto);
    
    if (itemExistente) {
      setCarrito(carrito.map(item => 
        (item.id_producto === producto.id_producto)
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id_producto: producto.id_producto,
        id_producto_precio: producto.id_producto_precio || null,
        nombre_comercial: producto.nombre_comercial,
        precio_unitario: producto.precio_unitario || 0,
        cantidad: 1,
        subtotal: producto.precio_unitario || 0
      }]);
    }
    setSearchTerm('');
    setProductosBusqueda([]);
  };

  const eliminarItem = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const guardarVenta = async () => {
    if (!cliente) return alert('Seleccione un cliente');
    if (carrito.length === 0) return alert('El carrito está vacío');

    try {
      const data = {
        id_cliente: cliente.id_cliente,
        id_usuario: user.id_usuario,
        id_tipo_comprobante: tipoComp,
        serie_documento: 'F001', // Valor por defecto para prueba
        numero_documento: '000001', // Valor por defecto para prueba
        total,
        detalle: carrito.map(item => ({
          id_producto: item.id_producto,
          id_producto_precio: item.id_producto_precio,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
        }))
      };
      
      await axios.post('http://localhost:5000/api/ventas', data);
      alert('Venta realizada con éxito');
      setCarrito([]);
      setCliente(null);
      setDocCliente('');
    } catch (err) {
      alert('Error al guardar la venta');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Formulario */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo Comprobante</label>
              <select 
                className="w-full border p-2 rounded-lg"
                value={tipoComp}
                onChange={(e) => setTipoComp(e.target.value)}
              >
                {comprobantes.map(c => <option key={c.id_tipo_comprobante} value={c.id_tipo_comprobante}>{c.nombre_documento}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Buscar Cliente (DNI/RUC)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 border p-2 rounded-lg"
                  value={docCliente}
                  onChange={(e) => setDocCliente(e.target.value)}
                />
                <button onClick={buscarCliente} className="bg-botica-green text-white p-2 rounded-lg"><Search size={20}/></button>
              </div>
            </div>
          </div>
          {cliente && (
            <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm font-bold text-botica-dark">{cliente.nombres_razon_social}</p>
              <p className="text-xs text-gray-500">Doc: {cliente.numero_documento}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm relative">
          <label className="block text-sm font-medium mb-2">Buscar Producto</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Nombre del producto..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-botica-green"
              value={searchTerm}
              onChange={(e) => buscarProductos(e.target.value)}
            />
          </div>
          
          {productosBusqueda.length > 0 && (
            <div className="absolute left-6 right-6 mt-1 bg-white border rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
              {productosBusqueda.map(p => (
                <div key={p.id_producto} className="p-3 border-b hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold">{p.nombre_comercial}</p>
                    <p className="text-xs text-gray-500">Stock: {p.stock_actual_unidades}</p>
                  </div>
                  <button onClick={() => agregarAlCarrito(p)} className="bg-botica-green text-white px-3 py-1 rounded-lg text-sm">
                    S/ {p.precio_unitario || '0.00'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {carrito.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium">{item.nombre_comercial}</td>
                  <td className="px-6 py-4 text-sm text-right">S/ {item.precio_unitario.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-center">{item.cantidad}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold">S/ {item.subtotal.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => eliminarItem(index)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {carrito.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">No hay productos en el detalle</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">Resumen</h3>
          <div className="flex justify-between text-2xl font-bold text-botica-dark pt-2">
            <span>Total:</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
          <button 
            onClick={guardarVenta}
            className="w-full bg-botica-green text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-botica-dark transition-colors shadow-lg"
          >
            <Save size={20} />
            FINALIZAR VENTA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ventas;
