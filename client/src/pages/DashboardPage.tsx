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
  Sparkles,
  TrendingUp,
  Globe,
} from "lucide-react";

const landingFeatures = [
  {
    icon: Satellite,
    title: "Green Map",
    desc: "Analyze NDVI and urban heat islands using satellite data. Identify optimal tree planting zones to cool cities.",
    link: "/satellite",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: ClipboardList,
    title: "Activity",
    desc: "Track and manage your sustainability activities with smart insights.",
    link: "/activity",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    protected: true,
  },
  {
    icon: Recycle,
    title: "AI Recycle Suggestion",
    desc: "Get AI-powered recycling, reuse, and disposal guidance for any item.",
    link: "/recycle",
    color: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50",
  },
  {
    icon: Recycle,
    title: "Garbage Management & Marketplace",
    desc: "AI-powered recycling guidance. List reusable items on the marketplace or schedule recycling pickups.",
    link: "/marketplace",
    color: "from-purple-500 to-violet-500",
    bgLight: "bg-purple-50",
  },
];

const baseActions = [
  {
    icon: Satellite,
    title: "Green Map",
    desc: "Detect urban heat islands and green zones",
    link: "/satellite",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: ClipboardList,
    title: "Activity",
    desc: "Track and manage your sustainability activities",
    link: "/activity",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
  },
  {
    icon: Recycle,
    title: "AI Recycle Suggestion",
    desc: "AI-powered recycling, reuse, and disposal guidance",
    link: "/recycle",
    color: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50",
  },
  {
    icon: Recycle,
    title: "Marketplace & Garbage Management",
    desc: "Browse, list items and get recycling guides",
    link: "/marketplace",
    color: "from-purple-500 to-violet-500",
    bgLight: "bg-purple-50",
  },
  {
    icon: MessageCircle,
    title: "Messages",
    desc: "Chat with other users",
    link: "/messages",
    color: "from-blue-600 to-indigo-600",
    bgLight: "bg-blue-50",
  },
];

function GuestLanding() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-pulse-gentle" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-pulse-gentle" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 relative z-10">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <Leaf className="w-4 h-4 text-green-300" />
              <span className="text-green-200 font-medium text-xs uppercase tracking-wider">
                Smart Sustainability Platform
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Building a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                Greener Future
              </span>{" "}
              with AI-Powered Insights
            </h1>
            <p className="text-lg text-green-100/70 mb-10 max-w-3xl leading-relaxed">
              Leverage satellite imagery, artificial intelligence, and smart
              technology to reduce carbon emissions, optimize energy usage, and
              build sustainable communities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 bg-white text-green-800 font-bold py-3.5 px-8 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Stats bar */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-float border border-slate-100 p-6 grid grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {[
              { icon: Globe, value: "Real-time", label: "Satellite Data" },
              { icon: Sparkles, value: "AI-Powered", label: "Smart Analysis" },
              { icon: TrendingUp, value: "Track & Reduce", label: "Carbon Footprint" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-eco-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-eco-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 tracking-tight">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-eco-primary uppercase tracking-widest mb-3">Features</span>
            <h2 className="section-title mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Everything you need to measure, reduce, and optimize your
              environmental impact
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {landingFeatures.map((f, i) => (
              <Link
                key={f.title}
                to={f.link}
                className="card-interactive group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-eco-primary transition-colors duration-200 tracking-tight flex items-center gap-2">
                  {f.title}
                  {"protected" in f && f.protected && (
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-200/60 !text-[10px]">
                      <Lock className="w-2.5 h-2.5" />
                      Sign in required
                    </span>
                  )}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <span className="text-eco-primary font-semibold text-sm inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-eco-primary via-emerald-500 to-teal-500 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
            Ready to Make a Difference?
          </h2>
          <p className="text-green-100 mb-10 text-lg leading-relaxed">
            Join thousands of users building a more sustainable future.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 bg-white text-green-700 font-bold py-3.5 px-8 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-7 h-7 bg-gradient-to-br from-eco-primary to-emerald-400 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">GreenVerse</span>
          </div>
          <p className="text-sm leading-relaxed">
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
      color: "from-red-500 to-red-600",
      bgLight: "bg-red-50",
    });
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-header-title">
          Welcome, {user?.name}!
        </h1>
        <p className="page-header-desc">
          Here&apos;s your sustainability dashboard
        </p>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link key={action.title} to={action.link} className="card-interactive group">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-eco-primary transition-colors duration-200 tracking-tight">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{action.desc}</p>
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
