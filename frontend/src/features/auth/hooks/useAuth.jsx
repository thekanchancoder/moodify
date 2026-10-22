
import {
  loginUser,
  getMe,
  registerUser,
  logoutUser
} from "../services/auth.api.jsx";

import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";

const useAuth = () => {
  const { user, setUser, loading, setLoading } =
    useContext(AuthContext);

  const login = async ({ email, password,username }) => {
    setLoading(true);

    try {
      const data = await loginUser({ email, password,username });
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ username, email, password }) => {
    setLoading(true);

    try {
      const data = await registerUser({
        username,
        email,
        password
      });

      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout request finished with error:", err);
    } finally {
      setUser(null);
      setLoading(false);
      window.location.href = "/login";
    }
  };

  const getMeApi = async () => {
    setLoading(true);

    try {
      const data = await getMe();
      setUser(data.user);
      return data;
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    getMeApi
  };
};

export default useAuth;
