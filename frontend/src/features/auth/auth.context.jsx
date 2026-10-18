import { createContext, useState } from "react";
import { logoutUser } from "./services/auth.api.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      await logoutUser(); // Backend API call
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);      // User state clear
      setLoading(false);
      window.location.href = '/login'; // Redirect to login
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, setLoading, logout }}
    >
      
      {children}
    </AuthContext.Provider>
  );
};