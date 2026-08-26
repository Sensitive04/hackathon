import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { AdminStats, AdminUser, MarketplaceItem } from "../types";
import toast from "react-hot-toast";
import {
  Shield,
  Users,
  Package,
  BarChart3,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Tab = "stats" | "users" | "listings" | "create";

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [listingPage, setListingPage] = useState(1);
  const [listingPages, setListingPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [listingTypeFilter, setListingTypeFilter] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch {
      toast.error("Failed to load stats");
    }
  };

  const loadUsers = async (page: number) => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers(page);
      setUsers(data.users);
      setUserPages(data.pages);
      setUserPage(page);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async (page: number, type?: string) => {
    setLoading(true);
    try {
      const data = await api.getAdminListings(page, type || undefined);
      setListings(data.items);
      setListingPages(data.pages);
      setListingPage(page);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "stats") loadStats();
    if (tab === "users") loadUsers(1);
    if (tab === "listings") loadListings(1, listingTypeFilter);
  }, [tab, listingTypeFilter]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.deleteAdminUser(id);
      toast.success("User deleted");
      loadUsers(userPage);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.updateAdminUserRole(id, role);
      toast.success("Role updated");
      loadUsers(userPage);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await api.deleteAdminListing(id);
      toast.success("Listing deleted");
      loadListings(listingPage, listingTypeFilter);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await api.createAdminAccount(newName, newEmail, newPassword);
      toast.success("Admin account created");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "stats", label: "Stats", icon: BarChart3 },
    { key: "users", label: "Users", icon: Users },
    { key: "listings", label: "Listings", icon: Package },
    { key: "create", label: "Create Admin", icon: UserPlus },
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-500">Manage users, listings, and platform settings.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              tab === t.key
                ? "bg-eco-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers, color: "bg-blue-500" },
            { label: "Admins", value: stats.adminCount, color: "bg-red-500" },
            { label: "Regular Users", value: stats.userCount, color: "bg-green-500" },
            { label: "Total Listings", value: stats.totalListings, color: "bg-amber-500" },
            { label: "Active Listings", value: stats.activeListings, color: "bg-teal-500" },
            { label: "Sold Items", value: stats.soldListings, color: "bg-blue-600" },
            { label: "Recycle Listings", value: stats.recycleListings, color: "bg-emerald-500" },
            { label: "Recycled Items", value: stats.recycledListings, color: "bg-teal-600" },
          ].map((s) => (
            <div key={s.label} className="card">
              <div className={`w-8 h-8 ${s.color} rounded-lg mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs rounded-lg border px-2 py-1"
                        disabled={u.id === user?.id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user?.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-500">
                Page {userPage} of {userPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => loadUsers(userPage - 1)}
                  disabled={userPage <= 1}
                  className="p-1 rounded disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => loadUsers(userPage + 1)}
                  disabled={userPage >= userPages}
                  className="p-1 rounded disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "listings" && (
        <div>
          <div className="flex gap-2 mb-4">
            <select
              className="input-field w-auto"
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="free">Free</option>
              <option value="recycle">Recycle</option>
            </select>
          </div>
          <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Seller</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.sellerId?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.listingType === "free"
                            ? "bg-green-100 text-green-700"
                            : item.listingType === "recycle"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.listingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.status}</td>
                    <td className="px-4 py-3">${item.price}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteListing(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {listingPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-500">
                Page {listingPage} of {listingPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => loadListings(listingPage - 1, listingTypeFilter)}
                  disabled={listingPage <= 1}
                  className="p-1 rounded disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => loadListings(listingPage + 1, listingTypeFilter)}
                  disabled={listingPage >= listingPages}
                  className="p-1 rounded disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {tab === "create" && (
        <div className="card max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold">Create Admin Account</h2>
          </div>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input-field"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Create Admin Account
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
