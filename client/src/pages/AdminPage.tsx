import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { AdminStats, AdminUser, MarketplaceItem, RecyclePickup } from "../types";
import toast from "react-hot-toast";
import {
  Shield,
  Users,
  Package,
  BarChart3,
  Trash2,
  UserPlus,
  Recycle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeftRight,
} from "lucide-react";

type Tab = "stats" | "users" | "listings" | "create" | "pickups";

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

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "recycler">("recycler");

  // Recycle pickups state
  const [pickups, setPickups] = useState<RecyclePickup[]>([]);
  const [pickupPage, setPickupPage] = useState(1);
  const [pickupPages, setPickupPages] = useState(1);
  const [pickupStatusFilter, setPickupStatusFilter] = useState("");
  const [recyclers, setRecyclers] = useState<AdminUser[]>([]);
  const [reassignPickupId, setReassignPickupId] = useState<string | null>(null);

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

  const loadListings = async (page: number) => {
    setLoading(true);
    try {
      const data = await api.getAdminListings(page);
      setListings(data.items);
      setListingPages(data.pages);
      setListingPage(page);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const loadPickups = async (page: number) => {
    setLoading(true);
    try {
      const data = await api.adminGetAllPickups(page, pickupStatusFilter || undefined);
      setPickups(data.pickups);
      setPickupPages(data.pages);
      setPickupPage(page);
    } catch {
      toast.error("Failed to load pickups");
    } finally {
      setLoading(false);
    }
  };

  const loadRecyclers = async () => {
    try {
      const data = await api.getAdminUsers(1);
      const allUsers: AdminUser[] = data.users;
      let allRecyclers = allUsers.filter((u) => u.role === "recycler" || u.role === "admin");
      if (data.pages > 1) {
        for (let p = 2; p <= data.pages; p++) {
          const more = await api.getAdminUsers(p);
          allRecyclers = allRecyclers.concat(
            more.users.filter((u: AdminUser) => u.role === "recycler" || u.role === "admin")
          );
        }
      }
      setRecyclers(allRecyclers);
    } catch {
      // silent fail - reassign dropdown will just be empty
    }
  };

  useEffect(() => {
    if (tab === "stats") loadStats();
    if (tab === "users") loadUsers(1);
    if (tab === "listings") loadListings(1);
    if (tab === "pickups") {
      loadPickups(1);
      loadRecyclers();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "pickups") loadPickups(1);
  }, [pickupStatusFilter]);

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
      loadListings(listingPage);
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
      if (newRole === "admin") {
        await api.createAdminAccount(newName, newEmail, newPassword);
      } else {
        await api.createRecyclerAccount(newName, newEmail, newPassword);
      }
      toast.success(`${newRole === "admin" ? "Admin" : "Recycler"} account created`);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReassign = async (pickupId: string, recyclerId: string | null) => {
    try {
      await api.adminReassignPickup(pickupId, recyclerId);
      toast.success(recyclerId ? "Pickup reassigned" : "Pickup unassigned");
      setReassignPickupId(null);
      loadPickups(pickupPage);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePickup = async (id: string) => {
    if (!confirm("Delete this pickup record?")) return;
    try {
      await api.adminDeletePickup(id);
      toast.success("Pickup deleted");
      loadPickups(pickupPage);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "stats", label: "Stats", icon: BarChart3 },
    { key: "users", label: "Users", icon: Users },
    { key: "listings", label: "Listings", icon: Package },
    { key: "pickups", label: "Recycle Pickups", icon: Recycle },
    { key: "create", label: "Create Account", icon: UserPlus },
  ];

  const pickupStatusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-amber-100 text-amber-700", label: "Pending" },
    claimed: { color: "bg-blue-100 text-blue-700", label: "Claimed" },
    picked_up: { color: "bg-purple-100 text-purple-700", label: "Picked Up" },
    completed: { color: "bg-green-100 text-green-700", label: "Completed" },
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-500">Manage users, listings, recycle pickups, and platform settings.</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers, color: "bg-blue-500" },
            { label: "Admins", value: stats.adminCount, color: "bg-red-500" },
            { label: "Recyclers", value: stats.recyclerCount, color: "bg-purple-500" },
            { label: "Regular Users", value: stats.userCount, color: "bg-green-500" },
            { label: "Total Listings", value: stats.totalListings, color: "bg-amber-500" },
            { label: "Active Listings", value: stats.activeListings, color: "bg-teal-500" },
            { label: "Sold Items", value: stats.soldListings, color: "bg-blue-600" },
            { label: "Recycled Items", value: stats.recycledListings, color: "bg-emerald-600" },
            { label: "Pending Pickups", value: stats.pendingPickups, color: "bg-orange-500" },
            { label: "Completed Pickups", value: stats.completedPickups, color: "bg-green-700" },
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
                        <option value="recycler">Recycler</option>
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
                          item.listingType === "recycle"
                            ? "bg-purple-100 text-purple-700"
                            : item.listingType === "free"
                            ? "bg-green-100 text-green-700"
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
                  onClick={() => loadListings(listingPage - 1)}
                  disabled={listingPage <= 1}
                  className="p-1 rounded disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => loadListings(listingPage + 1)}
                  disabled={listingPage >= listingPages}
                  className="p-1 rounded disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "pickups" && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <select
              className="input-field w-auto"
              value={pickupStatusFilter}
              onChange={(e) => setPickupStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="claimed">Claimed</option>
              <option value="picked_up">Picked Up</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => loadPickups(pickupPage)}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : pickups.length === 0 ? (
            <div className="card text-center py-12">
              <Recycle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pickups found</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Item</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Requester</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Recycler</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pickups.map((p) => {
                      const sc = pickupStatusConfig[p.status] || pickupStatusConfig.pending;
                      return (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            {p.listingId?.title || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {p.requesterId?.name || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {p.recyclerId?.name || (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sc.color}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 relative">
                              <button
                                onClick={() =>
                                  setReassignPickupId(reassignPickupId === p._id ? null : p._id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                                title="Reassign recycler"
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePickup(p._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete pickup"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {reassignPickupId === p._id && (
                                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
                                  <p className="text-xs font-medium text-gray-600 mb-2">
                                    Assign to:
                                  </p>
                                  <button
                                    onClick={() => handleReassign(p._id, null)}
                                    className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600"
                                  >
                                    Unassign (set to pending)
                                  </button>
                                  {recyclers.map((r) => (
                                    <button
                                      key={r.id}
                                      onClick={() => handleReassign(p._id, r.id)}
                                      className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-eco-light text-gray-700"
                                    >
                                      {r.name}{" "}
                                      <span className="text-gray-400">({r.role})</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pickupPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <span className="text-sm text-gray-500">
                    Page {pickupPage} of {pickupPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadPickups(pickupPage - 1)}
                      disabled={pickupPage <= 1}
                      className="p-1 rounded disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => loadPickups(pickupPage + 1)}
                      disabled={pickupPage >= pickupPages}
                      className="p-1 rounded disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "create" && (
        <div className="card max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Recycle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold">Create New Account</h2>
          </div>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="label">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRole("admin")}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    newRole === "admin"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Shield className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole("recycler")}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    newRole === "recycler"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Recycle className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Recycler</span>
                </button>
              </div>
            </div>
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
              Create {newRole === "admin" ? "Admin" : "Recycler"} Account
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
