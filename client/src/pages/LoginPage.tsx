import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-4 shadow-neu-raised">
            <Leaf className="w-7 h-7 text-eco-primary" />
          </div>
          <h1 className="text-2xl font-bold text-neu-text tracking-tight">Welcome back</h1>
          <p className="text-neu-text-secondary mt-1.5 text-sm">
            Sign in to your Smart & Green City account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 !p-6">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="input-field pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neu-text-muted hover:text-neu-text-secondary p-1 transition-colors"
              >
                {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary w-full !py-3"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-neu-text-muted pt-1">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-eco-primary font-semibold hover:text-eco-secondary transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
