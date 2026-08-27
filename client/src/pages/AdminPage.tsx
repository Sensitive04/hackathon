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
  Megaphone,
  Flag,
} from "lucide-react";

interface AdminPost {
  _id: string;
  content: string;
  images: string[];
  hashtags: string[];
  likes: string[];
  campaignStatus?: "proposed" | "started" | "completed" | "ended";
  volunteerNeeded: number;
  volunteers: { _id: string; name: string }[];
  userId: { _id: string; name: string; email: string };
  createdAt: string;
}

type Tab = "stats" | "users" | "listings" | "posts" | "create";

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

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postPage, setPostPage] = useState(1);
  const [postPages, setPostPages] = useState(1);
  const [postTypeFilter, setPostTypeFilter] = useState("");

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

  const loadPosts = async (page: number, type?: string) => {
    setLoading(true);
    try {
      const data = await api.getAdminPosts(page, type || undefined);
      setPosts(data.posts);
      setPostPages(data.pages);
      setPostPage(page);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "stats") loadStats();
    if (tab === "users") loadUsers(1);
    if (tab === "listings") loadListings(1, listingTypeFilter);
    if (tab === "posts") loadPosts(1, postTypeFilter);
  }, [tab, listingTypeFilter, postTypeFilter]);

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

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.deleteAdminPost(id);
      toast.success("Post deleted");
      loadPosts(postPage, postTypeFilter);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCampaignStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminCampaignStatus(id, status);
      toast.success("Campaign status updated");
      loadPosts(postPage, postTypeFilter);
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
    { key: "posts", label: "Posts & Campaigns", icon: Megaphone },
    { key: "create", label: "Create Admin", icon: UserPlus },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon">
            <Shield className="w-5 h-5 text-neu-red" />
          </div>
          <h1 className="page-header-title">Admin Dashboard</h1>
        </div>
        <p className="page-header-desc">Manage users, listings, and platform settings.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
              tab === t.key
                ? "neu-tab-active"
                : "neu-tab-inactive"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {[
            { label: "Total Users", value: stats.totalUsers, color: "text-blue-500" },
            { label: "Admins", value: stats.adminCount, color: "text-neu-red" },
            { label: "Total Listings", value: stats.totalListings, color: "text-amber-500" },
            { label: "Active Listings", value: stats.activeListings, color: "text-teal-500" },
            { label: "Sold Items", value: stats.soldListings, color: "text-indigo-500" },
            { label: "Recycle Listings", value: stats.recycleListings, color: "text-emerald-500" },
            { label: "Recycled Items", value: stats.recycledListings, color: "text-cyan-600" },
          ].map((s) => (
            <div key={s.label} className="card group hover:-translate-y-0.5">
              <div className={`w-10 h-10 bg-neu-bg rounded-full flex items-center justify-center mb-3 shadow-neu-pressed-sm group-hover:shadow-neu-hover transition-shadow duration-300`}>
                <BarChart3 className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-neu-text tracking-tight">{s.value}</p>
              <p className="text-sm text-neu-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neu-bg border-b border-neu-shadow-dark/15">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neu-shadow-dark/10">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neu-shadow-dark/5 transition-colors duration-150">
                    <td className="px-4 py-3 font-semibold text-neu-text">{u.name}</td>
                    <td className="px-4 py-3 text-neu-text-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs font-medium rounded-xl bg-neu-bg text-neu-text shadow-neu-pressed-sm px-2.5 py-1.5 focus:shadow-neu-pressed focus:ring-1 focus:ring-eco-primary/20 outline-none transition-all duration-200"
                        disabled={u.id === user?.id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-neu-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user?.id}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-neu-shadow-dark/15 bg-neu-bg/50">
              <span className="text-sm text-neu-text-secondary font-medium">
                Page {userPage} of {userPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => loadUsers(userPage - 1)}
                  disabled={userPage <= 1}
                  className="p-1.5 rounded-xl bg-neu-bg shadow-neu-raised-sm hover:shadow-neu-hover disabled:opacity-30 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-neu-text-secondary" />
                </button>
                <button
                  onClick={() => loadUsers(userPage + 1)}
                  disabled={userPage >= userPages}
                  className="p-1.5 rounded-xl bg-neu-bg shadow-neu-raised-sm hover:shadow-neu-hover disabled:opacity-30 transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-neu-text-secondary" />
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
              className="input-field w-auto min-w-[130px]"
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="free">Free</option>
              <option value="recycle">Recycle</option>
            </select>
          </div>
          <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neu-bg border-b border-neu-shadow-dark/15">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Seller</th>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neu-shadow-dark/10">
                {listings.map((item) => (
                  <tr key={item._id} className="hover:bg-neu-shadow-dark/5 transition-colors duration-150">
                    <td className="px-4 py-3 font-semibold text-neu-text">{item.title}</td>
                    <td className="px-4 py-3 text-neu-text-secondary">
                      {item.sellerId?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          item.listingType === "free"
                            ? "bg-neu-accent/10 text-green-700 shadow-neu-pressed-sm"
                            : item.listingType === "recycle"
                            ? "bg-neu-accent/10 text-emerald-700 shadow-neu-pressed-sm"
                            : "bg-neu-blue-light text-blue-700 shadow-neu-pressed-sm"
                        }`}
                      >
                        {item.listingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neu-text-secondary font-medium">{item.status}</td>
                    <td className="px-4 py-3 font-semibold text-neu-text">${item.price}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteListing(item._id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200"
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-neu-shadow-dark/15 bg-neu-bg/50">
              <span className="text-sm text-neu-text-secondary font-medium">
                Page {listingPage} of {listingPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => loadListings(listingPage - 1, listingTypeFilter)}
                  disabled={listingPage <= 1}
                  className="p-1.5 rounded-xl bg-neu-bg shadow-neu-raised-sm hover:shadow-neu-hover disabled:opacity-30 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-neu-text-secondary" />
                </button>
                <button
                  onClick={() => loadListings(listingPage + 1, listingTypeFilter)}
                  disabled={listingPage >= listingPages}
                  className="p-1.5 rounded-xl bg-neu-bg shadow-neu-raised-sm hover:shadow-neu-hover disabled:opacity-30 transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-neu-text-secondary" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {tab === "posts" && (
        <div>
          <div className="flex gap-2 mb-4">
            <select
              className="input-field w-auto min-w-[150px]"
              value={postTypeFilter}
              onChange={(e) => setPostTypeFilter(e.target.value)}
            >
              <option value="">All Posts</option>
              <option value="campaign">Campaigns Only</option>
              <option value="regular">Regular Posts Only</option>
            </select>
          </div>

          {loading && <p className="text-sm text-neu-text-muted py-4">Loading posts...</p>}

          {!loading && posts.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-14 h-14 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-3 shadow-neu-pressed-sm">
                <Megaphone className="w-7 h-7 text-neu-text-muted" />
              </div>
              <p className="text-neu-text-secondary font-medium">No posts found.</p>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="card overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neu-bg border-b border-neu-shadow-dark/15">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Author</th>
                      <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Content</th>
                      <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Likes</th>
                      <th className="text-left px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Date</th>
                      <th className="text-right px-4 py-3 font-semibold text-neu-text-muted text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neu-shadow-dark/10">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-neu-shadow-dark/5 transition-colors duration-150">
                        <td className="px-4 py-3 font-semibold text-neu-text whitespace-nowrap">
                          {post.userId?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-neu-text-secondary max-w-[250px] truncate">
                          {post.content}
                          {post.images.length > 0 && (
                            <span className="ml-1.5 text-[10px] text-neu-text-muted">({post.images.length} img)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {post.campaignStatus ? (
                            <span className="badge bg-eco-primary/10 text-eco-primary shadow-neu-pressed-sm">
                              <Flag className="w-3 h-3 inline mr-1" />
                              Campaign
                            </span>
                          ) : (
                            <span className="badge bg-neu-bg text-neu-text-muted shadow-neu-pressed-sm">Post</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {post.campaignStatus ? (
                            <select
                              value={post.campaignStatus}
                              onChange={(e) => handleCampaignStatus(post._id, e.target.value)}
                              className="text-xs font-medium rounded-xl bg-neu-bg text-neu-text shadow-neu-pressed-sm px-2 py-1.5 focus:shadow-neu-pressed focus:ring-1 focus:ring-eco-primary/20 outline-none transition-all duration-200"
                            >
                              <option value="proposed">Proposed</option>
                              <option value="started">Started</option>
                              <option value="completed">Completed</option>
                              <option value="ended">Ended</option>
                            </select>
                          ) : (
                            <span className="text-neu-text-muted text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neu-text-secondary font-medium">{post.likes.length}</td>
                        <td className="px-4 py-3 text-neu-text-secondary whitespace-nowrap">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {postPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-neu-shadow-dark/15 bg-neu-bg/50">
                  <span className="text-sm text-neu-text-secondary font-medium">
                    Page {postPage} of {postPages}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => loadPosts(postPage - 1, postTypeFilter)}
                      disabled={postPage <= 1}
                      className="p-1.5 rounded-xl bg-neu-bg shadow-neu-raised-sm hover:shadow-neu-hover disabled:opacity-30 transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5 text-neu-text-secondary" />
                    </button>
                    <button
                      onClick={() => loadPosts(postPage + 1, postTypeFilter)}
                      disabled={postPage >= postPages}
                      className="p-1.5 rounded-xl bg-neu-bg shadow-neu-raised-sm hover:shadow-neu-hover disabled:opacity-30 transition-all duration-200"
                    >
                      <ChevronRight className="w-5 h-5 text-neu-text-secondary" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "create" && (
        <div className="card max-w-lg animate-fade-in">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
              <Shield className="w-4 h-4 text-neu-red" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neu-text">Create Admin Account</h2>
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
            <button type="submit" className="btn-primary w-full !py-3">
              Create Admin Account
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
