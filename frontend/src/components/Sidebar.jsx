import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, PlusSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
    { icon: Package, label: 'Productos', path: '/productos' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
  ];

  return (
    <aside className="w-64 bg-botica-dark text-white flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <PlusSquare className="text-botica-green" size={32} />
        <h1 className="text-xl font-bold">Nova Salud</h1>
      </div>
      
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-6 py-4 transition-colors",
              location.pathname === item.path 
                ? "bg-botica-green text-white" 
                : "text-gray-300 hover:bg-white/10"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-6 py-4 text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
      >
        <LogOut size={20} />
        <span className="font-medium">Cerrar Sesión</span>
      </button>
    </aside>
  );
};

export default Sidebar;
