import { createContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const STORAGE_KEY = 'tc_auth_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user && parsed?.accessToken) {
          setUser(parsed.user);
          setAccessToken(parsed.accessToken);
        }
      }
    } catch (e) {
      console.warn('Auth bootstrap error:', e);
    } finally {
      setBootstrapped(true);
    }
  }, []);

  useEffect(() => {
    const data = JSON.stringify({ user, accessToken });
    localStorage.setItem(STORAGE_KEY, data);
  }, [user, accessToken]);

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const signup = async ({ username, email, password }) => {
    const { data } = await axios.post(
      `${baseURL}/auth/signup`,
      { username, email, password },
      { withCredentials: true }
    );
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const login = async ({ email, password }) => {
    const { data } = await axios.post(
      `${baseURL}/auth/signin`,
      { email, password },
      { withCredentials: true }
    );
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true });
    } catch {
      
    }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      bootstrapped,
      signup,
      login,
      logout,
      setUser,
      setAccessToken,
    }),
    [user, accessToken, bootstrapped]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
