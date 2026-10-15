import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserFromToken, isTokenExpired } from '../utils/helpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, email, name }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);  // loading auth state from storage

  // On mount, restore auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Parse failed, derive from token
          const tokenUser = getUserFromToken(storedToken);
          setUser(tokenUser);
        }
      } else {
        const tokenUser = getUserFromToken(storedToken);
        setUser(tokenUser);
      }
    } else if (storedToken) {
      // Token is expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    setLoading(false);
  }, []);

  /**
   * Called after successful login.
   * @param {string} jwtToken — raw JWT string from backend
   * @param {object} userData — { id, name, email } from signup/stored
   */
  const login = useCallback((jwtToken, userData) => {
    localStorage.setItem('authToken', jwtToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Update stored user info (e.g. after signup we get the name).
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('authUser', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
