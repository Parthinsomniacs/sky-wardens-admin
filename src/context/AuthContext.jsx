/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

const DEFAULT_SUPER_ADMIN = {
  id: "USR-001",
  name: "Super Admin",
  email: "admin@skywardens.com",
  role: "Super Admin",
  avatar: "SA",
  clearance: "Full System Access (Includes Leads)",
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("sky_wardens_auth") === "true";
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("sky_wardens_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === "Normal User") {
          parsed.role = "Normal Admin";
        }
        return parsed;
      } catch {
        return DEFAULT_SUPER_ADMIN;
      }
    }
    return DEFAULT_SUPER_ADMIN;
  });

  // Verify token on initial mount if authenticated
  useEffect(() => {
    const token = localStorage.getItem("sky_wardens_token");
    if (token) {
      authApi
        .getMe()
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem("sky_wardens_user", JSON.stringify(res.user));
          }
        })
        .catch(() => {
          console.warn("Session check fallback to cached user");
        });
    }
  }, []);

  const login = async (email, password = "SkyWardens@2026") => {
    try {
      // 1. Try real backend API
      const res = await authApi.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem("sky_wardens_token", res.token);
        localStorage.setItem("sky_wardens_auth", "true");
        localStorage.setItem("sky_wardens_user", JSON.stringify(res.user));
        setUser(res.user);
        setIsAuthenticated(true);
        return res;
      }
    } catch (err) {
      // If network fails or fallback needed
      console.warn("Backend API auth failed, falling back to local session:", err.message);
      const isSuper = email.toLowerCase().includes("admin@") || !email.includes("malhotra");
      const fallbackUser = {
        ...DEFAULT_SUPER_ADMIN,
        email,
        name: isSuper ? "Super Admin" : "Wing Cdr. Vikram Malhotra (Retd.)",
        role: isSuper ? "Super Admin" : "Normal Admin",
        clearance: isSuper ? "Full System Access (Includes Leads)" : "Operational Access (No Leads)",
        avatar: isSuper ? "SA" : "VM",
      };
      setIsAuthenticated(true);
      setUser(fallbackUser);
      localStorage.setItem("sky_wardens_auth", "true");
      localStorage.setItem("sky_wardens_user", JSON.stringify(fallbackUser));
      return { success: true, user: fallbackUser };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("sky_wardens_auth");
    localStorage.removeItem("sky_wardens_token");
    localStorage.removeItem("sky_wardens_user");
  };

  const switchRole = async (newRole) => {
    const targetRole = newRole === "Normal Admin" ? "Normal Admin" : "Super Admin";
    const targetEmail = targetRole === "Super Admin" ? "admin@skywardens.com" : "v.malhotra@skywardens.com";

    try {
      // Re-login with the respective backend account to get authentic JWT!
      const res = await authApi.login({ email: targetEmail, password: "SkyWardens@2026" });
      if (res.token) {
        localStorage.setItem("sky_wardens_token", res.token);
        localStorage.setItem("sky_wardens_user", JSON.stringify(res.user));
        setUser(res.user);
        return;
      }
    } catch {
      // Fallback
    }

    setUser((prev) => {
      const updated = {
        ...prev,
        role: targetRole,
        name: targetRole === "Super Admin" ? "Super Admin" : "Normal Admin (Officer)",
        avatar: targetRole === "Super Admin" ? "SA" : "NA",
        clearance:
          targetRole === "Super Admin"
            ? "Full System Access (Includes Leads)"
            : "Operational Access (No Leads)",
      };
      localStorage.setItem("sky_wardens_user", JSON.stringify(updated));
      return updated;
    });
  };

  const isSuperAdmin = user?.role === "Super Admin";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isSuperAdmin,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
