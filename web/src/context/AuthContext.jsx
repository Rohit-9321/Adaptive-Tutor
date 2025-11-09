import React, { createContext, useContext, useState } from 'react';
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { const json = localStorage.getItem('user'); return json ? JSON.parse(json) : null; });
  function login(u){ setUser(u); localStorage.setItem('user', JSON.stringify(u)); }
  function logout(){ setUser(null); localStorage.removeItem('user'); localStorage.removeItem('token'); }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}
export function useAuth(){ return useContext(AuthCtx); }