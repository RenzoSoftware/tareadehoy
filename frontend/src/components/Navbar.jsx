import React from 'react';
import { User } from 'lucide-react';

const Navbar = ({ user }) => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">Sistema de Ventas - Botica Nova Salud</h2>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user.Nombre_Usuario}</p>
          <p className="text-xs text-gray-500">Administrador</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-botica-green flex items-center justify-center text-white">
          <User size={24} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
