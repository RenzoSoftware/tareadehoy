/**
 * @fileoverview UserContext - Estado global del usuario autenticado
 */

import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children, initialUser, onLogout }) => {
  const [user, setUser] = useState(initialUser);

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, onLogout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider');
  return ctx;
};
