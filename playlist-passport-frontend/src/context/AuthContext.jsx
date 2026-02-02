import { createContext, useState, useEffect } from "react";

// Global authentication context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Persist JWT token in localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
  }, [token]);

  // Store user data and token after login
  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
  };

  // Clear auth state on logout
  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

