
import {
  loginUser,
  getMe,
  registerUser,
  logoutUser
} from "../services/auth.api";

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
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getMeApi = async () => {
    setLoading(true);

    try {
      const data = await getMe();
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };


useEffect(()=>{
   getMeApi ()
},[])

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
