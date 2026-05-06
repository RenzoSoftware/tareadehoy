import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalVentas: 0, cantidadVentas: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/ventas/resumen-hoy');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Ventas del Día', value: `S/ ${stats.totalVentas || 0}`, icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Transacciones', value: stats.cantidadVentas || 0, icon: ShoppingBag, color: 'bg-botica-green' },
    { label: 'Crecimiento', value: '+12.5%', icon: TrendingUp, color: 'bg-orange-500' },
    { label: 'Clientes Nuevos', value: '4', icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold mb-4">Ventas Recientes</h3>
          <div className="text-gray-400 text-center py-20 italic">No hay ventas registradas recientemente</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold mb-4">Stock Crítico</h3>
          <div className="text-gray-400 text-center py-20 italic">Todos los productos tienen stock suficiente</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
