import React, { useState, useEffect, createContext, useContext } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const isAuthenticated = status === "authorized";

  const login = async ({ email, password }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login error");
      }

      if (!data.token) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem("token", data.token);

      const decoded = jwtDecode(data.token);

      setToken(data.token); 
      setUser(decoded);
      setStatus("authorized");

      return { success: true };
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setStatus("unauthenticated");

      return { success: false, error: error.message };
    }
  };

  const register = async ({ username, email, password }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Register error");
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null); 
    setStatus("unauthenticated");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setStatus("unauthenticated");
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);

      setToken(storedToken); 
      setUser(decoded);
      setStatus("authorized");
    } catch (err) {
      logout();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        isAuthenticated,
        token, 
        login,
        register,
        logout,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);