import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, Eye, EyeOff, Users, Recycle } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-eco-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-eco-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-500 mt-1">
            Join the green revolution
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">I want to join as</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "user", label: "User", icon: Leaf },
                { value: "admin", label: "Admin", icon: Users },
                { value: "recycler", label: "Recycler", icon: Recycle },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    role === opt.value
                      ? "border-eco-primary bg-eco-light text-eco-primary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <opt.icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPw ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-eco-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
