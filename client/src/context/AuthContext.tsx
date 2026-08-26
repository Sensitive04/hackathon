import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("greentech_token")
  );

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("greentech_token");
          setToken(null);
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem("greentech_token", data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success("Welcome back!");
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }

    const data = await res.json();
    localStorage.setItem("greentech_token", data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success("Account created!");
  };

  const logout = () => {
    localStorage.removeItem("greentech_token");
    setToken(null);
    setUser(null);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
