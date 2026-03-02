/* eslint-disable react/prop-types */

import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "./api/client";
import { removeToken } from "./api/token";

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
    setUser(result.user);
    return result;
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