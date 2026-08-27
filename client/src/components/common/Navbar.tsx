import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Leaf, LogOut, Menu, X, MessageCircle, Shield, BookOpen } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const scrollToFeatures = () => {
    setMobileOpen(false);
    if (location.pathname === "/") {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#features");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLink = (path: string) =>
    `relative block py-2 px-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive(path)
        ? "text-eco-primary shadow-neu-pressed-sm bg-neu-bg"
        : "text-neu-text-secondary hover:text-eco-primary hover:shadow-neu-raised-sm"
    }`;

  const mobileNavLink = (path: string) =>
    `block py-2.5 px-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive(path)
        ? "text-eco-primary shadow-neu-pressed-sm bg-neu-bg"
        : "text-neu-text-secondary hover:text-eco-primary hover:shadow-neu-raised-sm"
    }`;

  return (
    <nav className="bg-neu-bg shadow-nav sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-eco-primary font-bold text-xl tracking-tight group"
          >
            <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-raised-sm group-hover:shadow-neu-hover transition-shadow duration-300">
              <Leaf className="w-4.5 h-4.5 text-eco-primary" />
            </div>
            <span>Smart & Green City Platform</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/satellite" className={navLink("/satellite")}>
                  Green Map
                </Link>
                <Link to="/activity" className={navLink("/activity")}>
                  Activity
                </Link>
                <Link to="/recycle" className={navLink("/recycle")}>
                  Recycle
                </Link>
                <Link to="/knowledge" className={navLink("/knowledge")}>
                  <BookOpen className="w-4 h-4 inline mr-1 -mt-0.5" />
                  Knowledge
                </Link>
                <Link to="/marketplace" className={navLink("/marketplace")}>
                  Marketplace
                </Link>
                <Link to="/messages" className={navLink("/messages")}>
                  <MessageCircle className="w-4 h-4 inline mr-1 -mt-0.5" />
                  Messages
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className={navLink("/admin")}>
                    <Shield className="w-4 h-4 inline mr-1 -mt-0.5" />
                    Admin
                  </Link>
                )}
                <div className="ml-3 pl-3 border-l border-neu-shadow-dark/30 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-neu-bg rounded-full flex items-center justify-center text-eco-primary text-[11px] font-bold shadow-neu-raised-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm text-neu-text-secondary font-medium">
                      {user?.name}
                      {user?.role === "admin" && (
                        <span className="ml-1.5 text-[10px] bg-neu-red-light text-neu-red px-2 py-0.5 rounded-xl font-semibold shadow-neu-pressed-sm">
                          Admin
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-neu-text-muted hover:text-neu-red hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={scrollToFeatures} className="text-sm font-medium text-neu-text-secondary hover:text-eco-primary px-3 py-2 rounded-xl transition-colors duration-200 hover:shadow-neu-raised-sm">
                  Features
                </button>
                <Link to="/satellite" className={navLink("/satellite")}>
                  Green Map
                </Link>
                <Link to="/activity" className={navLink("/activity")}>
                  Activity
                </Link>
                <Link to="/marketplace" className={navLink("/marketplace")}>
                  Marketplace
                </Link>
                <Link to="/recycle" className={navLink("/recycle")}>
                  Recycle
                </Link>
                <Link to="/knowledge" className={navLink("/knowledge")}>
                  <BookOpen className="w-4 h-4 inline mr-1 -mt-0.5" />
                  Knowledge
                </Link>
                <div className="ml-3 pl-3 border-l border-neu-shadow-dark/30 flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium text-neu-text-secondary hover:text-neu-text px-3 py-2 rounded-xl transition-colors duration-200 hover:shadow-neu-raised-sm">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-neu-text-secondary hover:text-neu-text hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-neu-bg shadow-neu-raised-lg mx-4 mb-4 rounded-2xl px-4 py-3 animate-fade-in-down">
          {isAuthenticated ? (
            <div className="space-y-1">
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center text-eco-primary text-xs font-bold shadow-neu-raised-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neu-text">{user?.name}</p>
                    {user?.role === "admin" && (
                      <span className="text-[10px] bg-neu-red-light text-neu-red px-2 py-0.5 rounded-xl font-semibold shadow-neu-pressed-sm">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link to="/satellite" className={mobileNavLink("/satellite")} onClick={() => setMobileOpen(false)}>
                Green Map
              </Link>
              <Link to="/activity" className={mobileNavLink("/activity")} onClick={() => setMobileOpen(false)}>
                Activity
              </Link>
              <Link to="/recycle" className={mobileNavLink("/recycle")} onClick={() => setMobileOpen(false)}>
                Recycle
              </Link>
              <Link to="/knowledge" className={mobileNavLink("/knowledge")} onClick={() => setMobileOpen(false)}>
                Knowledge
              </Link>
              <Link to="/marketplace" className={mobileNavLink("/marketplace")} onClick={() => setMobileOpen(false)}>
                Marketplace
              </Link>
              <Link to="/messages" className={mobileNavLink("/messages")} onClick={() => setMobileOpen(false)}>
                Messages
              </Link>
              {user?.role === "admin" && (
                <Link to="/admin" className={mobileNavLink("/admin")} onClick={() => setMobileOpen(false)}>
                  Admin
                </Link>
              )}
              <div className="pt-2 mt-2 border-t border-neu-shadow-dark/20">
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 text-sm font-medium text-neu-red hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <button onClick={scrollToFeatures} className="block w-full text-left py-2.5 px-3 text-sm font-medium text-neu-text-secondary hover:text-eco-primary hover:shadow-neu-raised-sm rounded-xl transition-all duration-200">
                Features
              </button>
              <Link to="/satellite" className={mobileNavLink("/satellite")} onClick={() => setMobileOpen(false)}>
                Green Map
              </Link>
              <Link to="/activity" className={mobileNavLink("/activity")} onClick={() => setMobileOpen(false)}>
                Activity
              </Link>
              <Link to="/marketplace" className={mobileNavLink("/marketplace")} onClick={() => setMobileOpen(false)}>
                Marketplace
              </Link>
              <Link to="/recycle" className={mobileNavLink("/recycle")} onClick={() => setMobileOpen(false)}>
                Recycle
              </Link>
              <Link to="/knowledge" className={mobileNavLink("/knowledge")} onClick={() => setMobileOpen(false)}>
                Knowledge
              </Link>
              <div className="pt-2 mt-2 border-t border-neu-shadow-dark/20 flex flex-col gap-2">
                <Link to="/login" className={mobileNavLink("/login")} onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm w-full text-center" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
