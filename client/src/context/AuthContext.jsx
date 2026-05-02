import { createContext, useEffect, useState } from "react";
import { apiRequest } from "../api/http.js";

export const AuthContext = createContext(null);

const STORAGE_KEY = "task-orbit-auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).token : null;
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).user : null;
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, user]);

  async function authenticate(path, payload) {
    setAuthLoading(true);

    try {
      const data = await apiRequest(path, {
        method: "POST",
        body: payload
      });

      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setAuthLoading(false);
    }
  }

  async function signup(payload) {
    return authenticate("/auth/signup", payload);
  }

  async function login(payload) {
    return authenticate("/auth/login", payload);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        isAuthenticated: Boolean(token && user),
        token,
        user,
        login,
        logout,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

