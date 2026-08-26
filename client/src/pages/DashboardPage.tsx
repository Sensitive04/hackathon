import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import {
  Satellite,
  ClipboardList,
  Recycle,
  MessageCircle,
  Shield,
  Leaf,
  ArrowRight,
  Lock,
} from "lucide-react";

const landingFeatures = [
  {
    icon: Satellite,
    title: "Green Map",
    desc: "Analyze NDVI and urban heat islands using satellite data. Identify optimal tree planting zones to cool cities.",
    link: "/satellite",
    color: "bg-blue-500",
  },
  {
    icon: ClipboardList,
    title: "Activity",
    desc: "Track and manage your sustainability activities with smart insights.",
    link: "/activity",
    color: "bg-amber-500",
    protected: true,
  },
  {
    icon: Recycle,
    title: "AI Recycle Suggestion",
    desc: "Get AI-powered recycling, reuse, and disposal guidance for any item.",
    link: "/recycle",
    color: "bg-green-500",
  },
  {
    icon: Recycle,
    title: "Garbage Management & Marketplace",
    desc: "AI-powered recycling guidance. List reusable items on the marketplace or schedule recycling pickups.",
    link: "/marketplace",
    color: "bg-purple-500",
  },
];

const baseActions = [
  {
    icon: Satellite,
    title: "Green Map",
    desc: "Detect urban heat islands and green zones",
    link: "/satellite",
    color: "bg-blue-500",
  },
  {
    icon: ClipboardList,
    title: "Activity",
    desc: "Track and manage your sustainability activities",
    link: "/activity",
    color: "bg-amber-500",
  },
  {
    icon: Recycle,
    title: "AI Recycle Suggestion",
    desc: "AI-powered recycling, reuse, and disposal guidance",
    link: "/recycle",
    color: "bg-green-500",
  },
  {
    icon: Recycle,
    title: "Marketplace & Garbage Management",
    desc: "Browse, list items and get recycling guides",
    link: "/marketplace",
    color: "bg-purple-500",
  },
  {
    icon: MessageCircle,
    title: "Messages",
    desc: "Chat with other users",
    link: "/messages",
    color: "bg-blue-600",
  },
];

function GuestLanding() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="w-8 h-8 text-green-300" />
              <span className="text-green-300 font-medium text-sm uppercase tracking-wider">
                Smart Sustainability Platform
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              Building a{" "}
              <span className="text-green-300">Greener Future</span>{" "}
              with AI-Powered Insights
            </h1>
            <p className="text-lg text-green-100/80 mb-8 max-w-2xl">
              Leverage satellite imagery, artificial intelligence, and smart
              technology to reduce carbon emissions, optimize energy usage, and
              build sustainable communities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-green-800 font-bold py-3 px-8 rounded-xl hover:bg-green-50 transition-all shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Everything you need to measure, reduce, and optimize your
              environmental impact
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {landingFeatures.map((f) => (
              <Link
                key={f.title}
                to={f.link}
                className="card group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-eco-primary transition-colors flex items-center gap-2">
                  {f.title}
                  {"protected" in f && f.protected && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Sign in required
                    </span>
                  )}
                </h3>
                <p className="text-gray-500 mb-4">{f.desc}</p>
                <span className="text-eco-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-eco-primary to-emerald-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Join thousands of users building a more sustainable future.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold py-3 px-8 rounded-xl hover:bg-green-50 transition-all shadow-lg"
          >
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-6 h-6 text-green-500" />
            <span className="text-white font-bold text-lg">GreenVerse</span>
          </div>
          <p className="text-sm">
            Powered by satellite data and artificial intelligence.
            Building sustainable communities.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AuthenticatedDashboard() {
  const { user } = useAuth();

  const actions = [...baseActions];

  if (user?.role === "admin") {
    actions.push({
      icon: Shield,
      title: "Admin Dashboard",
      desc: "Manage users, listings, and platform settings",
      link: "/admin",
      color: "bg-red-600",
    });
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s your sustainability dashboard
        </p>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link key={action.title} to={action.link} className="card group">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-eco-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500">{action.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#features") {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return isAuthenticated ? <AuthenticatedDashboard /> : <GuestLanding />;
}
