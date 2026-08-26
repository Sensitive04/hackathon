import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Leaf, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const navLink =
    "block py-2 px-3 text-gray-600 hover:text-eco-primary font-medium transition-colors";

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-eco-primary font-bold text-xl"
          >
            <Leaf className="w-7 h-7" />
            <span>GreenVerse</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={navLink}>
                  <LayoutDashboard className="w-4 h-4 inline mr-1" />
                  Dashboard
                </Link>
                <Link to="/satellite" className={navLink}>
                  Green Map
                </Link>
                <Link to="/activity" className={navLink}>
                  Activity
                </Link>
                <Link to="/recycle" className={navLink}>
                  Recycle
                </Link>
                <Link to="/marketplace" className={navLink}>
                  Marketplace
                </Link>
                <div className="ml-4 flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {user?.name}
                    {user?.role === "admin" && (
                      <span className="ml-1 text-xs bg-eco-light text-eco-primary px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={navLink}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary ml-2 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-600"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={navLink} onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link to="/satellite" className={navLink} onClick={() => setMobileOpen(false)}>
                Green Map
              </Link>
              <Link to="/activity" className={navLink} onClick={() => setMobileOpen(false)}>
                Activity
              </Link>
              <Link to="/recycle" className={navLink} onClick={() => setMobileOpen(false)}>
                Recycle
              </Link>
              <Link to="/marketplace" className={navLink} onClick={() => setMobileOpen(false)}>
                Marketplace
              </Link>
              <hr className="my-2" />
              <button onClick={handleLogout} className={navLink + " text-red-500"}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink} onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link to="/register" className={navLink} onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
