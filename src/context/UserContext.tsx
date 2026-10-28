"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile, UserContextType } from "@/types/user";

const UserContext = createContext<UserContextType>(null!);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoad, setIsLoad] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API || "/api";

  // Single atomic authentication check on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!savedToken) {
        setToken(null);
        setUserData(null);
        setIsLoad(true);
        return;
      }

      setToken(savedToken);
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
        } else {
          localStorage.removeItem("token");
          setToken(null);
          setUserData(null);
        }
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUserData(null);
      } finally {
        setIsLoad(true);
      }
    };

    initAuth();
  }, [API_URL]);

  const refreshUserData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
      }
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lele_mock_profile");
    sessionStorage.clear();
    setToken(null);
    setUserData(null);
    setIsLoad(true);
  };

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
        userData,
        setUserData,
        isLoad,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
