import { createContext, useState, useEffect } from "react";
import { getMe, logoutUser } from "./services/auth.api.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const data = await getMe();
        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

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