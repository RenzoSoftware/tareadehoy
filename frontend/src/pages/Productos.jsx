import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Plus, Edit2, Trash2 } from 'lucide-react';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/productos');
      setProductos(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Inventario de Productos</h2>
        <button className="bg-botica-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-botica-dark transition-colors">
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar productos..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-botica-green"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Laboratorio</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.map((p) => (
                <tr key={p.ID_Producto} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{p.Codigo_Producto || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{p.Nombre_Producto}</div>
                    <div className="text-xs text-gray-500">{p.Nombre_Presentacion}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.Nombre_Categoria}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.Nombre_Laboratorio}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.Stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.Stock} {p.Nombre_Unidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="text-blue-500 hover:text-blue-700"><Edit2 size={18}/></button>
                    <button className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="text-center py-10 text-gray-500">Cargando productos...</div>}
          {!loading && productos.length === 0 && <div className="text-center py-10 text-gray-500">No se encontraron productos</div>}
        </div>
      </div>
    </div>
  );
};

export default Productos;
