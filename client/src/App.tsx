import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SatellitePage from "./pages/SatellitePage";
import ActivityPage from "./pages/ActivityPage";
import RecycleSuggestPage from "./pages/RecycleSuggestPage";
import MarketplacePage from "./pages/MarketplacePage";
import AdminPage from "./pages/AdminPage";
import MessagesPage from "./pages/MessagesPage";
import RecycleQueuePage from "./pages/RecycleQueuePage";
import AdminRoute from "./components/common/AdminRoute";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/satellite"
            element={
              <ProtectedRoute>
                <SatellitePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recycle"
            element={
              <ProtectedRoute>
                <RecycleSuggestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recycle-queue"
            element={
              <ProtectedRoute>
                <RecycleQueuePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
