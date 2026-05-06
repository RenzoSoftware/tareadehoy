import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, UserPlus, Edit, Mail, Phone } from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClientes = clientes.filter(c => {
    const nombre = c.nombres_razon_social || '';
    const documento = c.numero_documento || '';
    return nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           documento.includes(searchTerm);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Directorio de Clientes</h2>
        <button className="bg-botica-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-botica-dark transition-colors">
          <UserPlus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o documento..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-botica-green"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(filteredClientes) && filteredClientes.length > 0 ? (
            filteredClientes.map(c => (
              <div key={c.id_cliente} className="border rounded-xl p-4 hover:border-botica-green transition-colors bg-gray-50/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                    {c.nombres_razon_social ? c.nombres_razon_social.charAt(0) : '?'}
                  </div>
                  <button className="text-gray-400 hover:text-botica-green">
                    <Edit size={18} />
                  </button>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{c.nombres_razon_social || 'Sin Nombre'}</h4>
                <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">DOC: {c.numero_documento || 'N/A'}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-botica-green" />
                    <span>{c.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} className="text-botica-green" />
                    <span>{c.direccion || 'Sin dirección'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400">
              No se encontraron clientes que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clientes;
