import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SatellitePage from "./pages/SatellitePage";
import ActivityPage from "./pages/ActivityPage";
import RecycleSuggestPage from "./pages/RecycleSuggestPage";
import MarketplacePage from "./pages/MarketplacePage";
import AdminPage from "./pages/AdminPage";
import MessagesPage from "./pages/MessagesPage";
import KnowledgePage from "./pages/KnowledgePage";
import AdminRoute from "./components/common/AdminRoute";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neu-bg">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/satellite" element={<SatellitePage />} />
          <Route path="/recycle" element={<RecycleSuggestPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route
            path="/activity"
            element={<ProtectedRoute><ActivityPage /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminRoute><AdminPage /></AdminRoute></ProtectedRoute>}
          />
          <Route
            path="/messages"
            element={<ProtectedRoute><MessagesPage /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  );
}
