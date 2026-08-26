import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Satellite, ClipboardList, Recycle } from "lucide-react";

const quickActions = [
  {
    icon: Satellite,
    title: "Green Map",
    desc: "Detect urban heat islands and green zones",
    link: "/satellite",
    color: "bg-blue-500",
  },
  {
    icon: ClipboardList,
    title: "Activity Tracker",
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
    desc: "Browse, list, buy items and get recycling guides",
    link: "/marketplace",
    color: "bg-purple-500",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

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
        {quickActions.map((action) => (
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
