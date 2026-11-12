import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const Auth = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        const u = {
          id: res.data._id || res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        };
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (path, data) => {
    const r = await api.post(path, data);
    localStorage.setItem('token', r.data.token);
    localStorage.setItem('user', JSON.stringify(r.data.user));
    setUser(r.data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Auth.Provider value={{ user, setUser, login, logout, refreshUser }}>
      {children}
    </Auth.Provider>
  );
}

export const useAuth = () => useContext(Auth);
