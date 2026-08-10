import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, login as loginApi } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user already has a valid login session
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getProfile()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await loginApi({
      email,
      password,
    });

    // Backend response:
    // {
    //   success: true,
    //   message: "Login successful",
    //   data: {
    //      token: "...",
    //      user: {...}
    //   }
    // }

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}