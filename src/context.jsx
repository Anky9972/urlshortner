/* eslint-disable react/prop-types */

import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "./api/client";
import { removeToken, setToken } from "./api/token";

const UrlContext = createContext();

const UrlProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const result = await authApi.login({ email, password });
    if (result.user) setUser(result.user);
    return result;
  };

  const completeTwoFactorLogin = async (userId, token) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/api/2fa/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '2FA verification failed');
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const result = await authApi.register({ name, email, password });
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if server call fails, clear local auth state
    }
    removeToken();
    setUser(null);
  };

  const isAuthenticated = !!user;

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UrlContext.Provider value={{
      user,
      fetchUser,
      loading,
      isAuthenticated,
      login,
      completeTwoFactorLogin,
      register,
      logout
    }}>
      {children}
    </UrlContext.Provider>
  );
};

export const UrlState = () => {
  return useContext(UrlContext);
};

export default UrlProvider;