import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import {
  Recycle,
  Search,
  Plus,
  ShoppingCart,
  Camera,
  Tag,
  CheckCircle,
  XCircle,
  Package,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { MarketplaceItem, RecyclingAnalysis } from "../types";

type Tab = "browse" | "list" | "recycle" | "my-listings";

export default function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [myItems, setMyItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [myStatusFilter, setMyStatusFilter] = useState("");
  const [myTypeFilter, setMyTypeFilter] = useState("");

  const [listForm, setListForm] = useState({
    title: "",
    description: "",
    category: "electronics",
    condition: "good",
    price: "",
    listingType: "sale" as "sale" | "free" | "recycle",
  });
  const [listingLoading, setListingLoading] = useState(false);

  const [recycleDesc, setRecycleDesc] = useState("");
  const [recycleResult, setRecycleResult] = useState<RecyclingAnalysis | null>(null);
  const [recycleLoading, setRecycleLoading] = useState(false);

  const fetchItems = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      params.status = "all";
      if (categoryFilter) params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;
      if (listingTypeFilter) params.listingType = listingTypeFilter;
      params.page = String(pageNum);
      const data = await api.getMarketplace(params);
      setItems(data.items);
      setPages(data.pages);
      setPage(data.page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (myStatusFilter) params.status = myStatusFilter;
      if (myTypeFilter) params.listingType = myTypeFilter;
      const data = await api.getMyListings(params);
      setMyItems(data);
    } catch (err: any) {
      toast.error("Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "browse") fetchItems(1);
    if (tab === "my-listings") fetchMyListings();
  }, [categoryFilter, listingTypeFilter, tab, myStatusFilter, myTypeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems(1);
  };

  const handleMessageSeller = async (sellerId: string, listingId: string) => {
    if (!user) {
      toast.error("Sign in to message sellers");
      navigate("/login");
      return;
    }
    try {
      const convo = await api.createConversation(sellerId, listingId);
      navigate(`/messages?conversation=${convo.id}`);
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to list items");
      navigate("/login");
      return;
    }
    setListingLoading(true);
    try {
      await api.listItem({
        ...listForm,
        price: listForm.listingType === "free" || listForm.listingType === "recycle" ? 0 : parseFloat(listForm.price) || 0,
      });
      toast.success("Item listed successfully!");
      setListForm({
        title: "",
        description: "",
        category: "electronics",
        condition: "good",
        price: "",
        listingType: "sale",
      });
      setTab("browse");
      fetchItems(1);
    } catch (err: any) {
      toast.error(err.message || "Failed to list item");
    } finally {
      setListingLoading(false);
    }
  };

  const handleRecycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recycleDesc.trim()) return;
    setRecycleLoading(true);
    try {
      const result = await api.analyzeItem(recycleDesc);
      setRecycleResult(result);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setRecycleLoading(false);
    }
  };

  const handlePurchase = async (id: string) => {
    if (!user) {
      toast.error("Sign in to buy items");
      navigate("/login");
      return;
    }
    try {
      const result = await api.purchaseItem(id);
      toast.success("Item purchased!");
      fetchItems(page);
      if (result.item?.sellerId?._id) {
        try {
          const convo = await api.createConversation(result.item.sellerId._id, id);
          navigate(`/messages?conversation=${convo.id}`);
        } catch {
          // conversation creation failed, but purchase was successful
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Purchase failed");
    }
  };

  const handleContactSeller = async (sellerId: string, listingId: string) => {
    if (!user) {
      toast.error("Sign in to contact sellers");
      navigate("/login");
      return;
    }
    try {
      await api.contactSeller(listingId);
      const convo = await api.createConversation(sellerId, listingId);
      toast.success("Seller notified! You can now message them.");
      fetchItems(page);
      navigate(`/messages?conversation=${convo.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to contact seller");
    }
  };

  const categories = [
    "electronics", "furniture", "clothing", "books", "appliances", "other",
  ];

  const statusColors: Record<string, string> = {
    available: "bg-green-50 text-green-700 border border-green-200/60",
    pending: "bg-amber-50 text-amber-700 border border-amber-200/60",
    sold: "bg-blue-50 text-blue-700 border border-blue-200/60",
    recycled: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    expired: "bg-gray-50 text-gray-500 border border-gray-200/60",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon bg-gradient-to-br from-purple-500 to-violet-500 shadow-sm">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <h1 className="page-header-title">
            Garbage Management & Marketplace
          </h1>
        </div>
        <p className="page-header-desc">
          AI-powered recycling guidance, item reuse marketplace, and waste management.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-slate-200 overflow-x-auto -mb-px">
        {[
          { key: "browse", label: "Marketplace", icon: ShoppingCart },
          ...(user ? [
            { key: "my-listings", label: "My Listings", icon: Package },
            { key: "list", label: "List Item", icon: Plus },
          ] : []),
          { key: "recycle", label: "Recycle Guide", icon: Recycle },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all duration-200 whitespace-nowrap ${
              tab === t.key
                ? "border-eco-primary text-eco-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Browse / Marketplace */}
      {tab === "browse" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>
            <select
              className="input-field w-auto min-w-[140px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <select
              className="input-field w-auto min-w-[120px]"
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="free">Free</option>
              <option value="recycle">Recycle</option>
            </select>
          </div>

          {loading && <LoadingSpinner text="Loading marketplace..." />}
          {error && <ErrorDisplay message={error} onRetry={() => fetchItems(1)} />}

          {!loading && items.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No items found. Be the first to list!</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 tracking-tight group-hover:text-eco-primary transition-colors duration-200">{item.title}</h3>
                  <span
                    className={`badge ${
                      item.listingType === "free"
                        ? "bg-green-50 text-green-700 border border-green-200/60"
                        : item.listingType === "recycle"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-purple-50 text-purple-700 border border-purple-200/60"
                    }`}
                  >
                    {item.listingType === "free"
                      ? "Free"
                      : item.listingType === "recycle"
                      ? "Recycle"
                      : `$${item.price}`}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="capitalize font-medium">{item.category}</span>
                  <span className="capitalize font-medium">{item.condition}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    by <span className="font-medium text-gray-500">{item.sellerId?.name || "Unknown"}</span>
                  </span>
                  <div className="flex gap-2">
                    {item.sellerId && user && item.sellerId._id !== user.id && (
                      <button
                        onClick={() =>
                          handleMessageSeller(
                            item.sellerId._id,
                            item._id
                          )
                        }
                        className="p-1.5 text-gray-400 hover:text-eco-primary hover:bg-eco-light/50 rounded-lg transition-all duration-200"
                        title="Message Seller"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    {item.status === "available" && item.listingType === "sale" && (
                      <button
                        onClick={() =>
                          handleContactSeller(
                            item.sellerId._id,
                            item._id
                          )
                        }
                        className="btn-primary text-xs !py-1.5 !px-3"
                      >
                        Contact Seller
                      </button>
                    )}
                    {item.status === "available" && item.listingType !== "sale" && (
                      <button
                        onClick={() => handlePurchase(item._id)}
                        className="btn-primary text-xs !py-1.5 !px-3"
                      >
                        {item.listingType === "free" ? "Claim" : "Recycle"}
                      </button>
                    )}
                    {item.status === "pending" && (
                      <span className="badge text-xs !py-1 !px-2.5 bg-amber-50 text-amber-700 border border-amber-200/60">
                        Pending
                      </span>
                    )}
                    {item.status !== "available" && item.status !== "pending" && (
                      <span className={`badge text-xs !py-1 !px-2.5 ${
                        item.status === "sold"
                          ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                          : item.status === "recycled"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-gray-50 text-gray-500 border border-gray-200/60"
                      }`}>
                        {item.status === "sold" ? "Sold" : item.status === "recycled" ? "Recycled" : "Expired"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => fetchItems(page - 1)}
                disabled={page <= 1}
                className="btn-ghost text-sm !px-3 !py-1.5 border border-gray-200 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 font-medium">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => fetchItems(page + 1)}
                disabled={page >= pages}
                className="btn-ghost text-sm !px-3 !py-1.5 border border-gray-200 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Listings */}
      {tab === "my-listings" && (
        <div>
          <div className="flex gap-2 mb-4">
            <select
              className="input-field w-auto min-w-[130px]"
              value={myStatusFilter}
              onChange={(e) => setMyStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="recycled">Recycled</option>
              <option value="expired">Expired</option>
            </select>
            <select
              className="input-field w-auto min-w-[120px]"
              value={myTypeFilter}
              onChange={(e) => setMyTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="free">Free</option>
              <option value="recycle">Recycle</option>
            </select>
          </div>

          {loading && <LoadingSpinner text="Loading your listings..." />}

          {!loading && myItems.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">You haven&apos;t listed any items yet.</p>
              <button
                onClick={() => setTab("list")}
                className="btn-primary mt-4 text-sm"
              >
                List Your First Item
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myItems.map((item) => (
              <div key={item._id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 tracking-tight">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        statusColors[item.status] || "bg-gray-50 text-gray-500 border border-gray-200/60"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="capitalize font-medium">{item.category}</span>
                    <span
                      className={`badge ${
                        item.listingType === "free"
                          ? "bg-green-50 text-green-700 border border-green-200/60"
                          : item.listingType === "recycle"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-purple-50 text-purple-700 border border-purple-200/60"
                      }`}
                    >
                    {item.listingType === "sale" ? `$${item.price}` : item.listingType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => navigate(`/messages?listing=${item._id}`)}
                    className="flex items-center gap-1.5 text-eco-primary hover:text-eco-secondary font-medium transition-colors duration-200"
                    title="View conversations about this listing"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Messages
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List Item */}
      {tab === "list" && (
        <form onSubmit={handleList} className="card w-full animate-fade-in">
          <h2 className="font-bold mb-4 tracking-tight text-gray-900">List an Item</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Listing Type</label>
              <div className="grid grid-cols-3 gap-2">
                {["sale", "free", "recycle"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setListForm({ ...listForm, listingType: type as any })
                    }
                    className={`p-3 rounded-xl border-2 text-center capitalize font-semibold text-sm transition-all duration-200 active:scale-[0.97] ${
                      listForm.listingType === type
                        ? "border-eco-primary bg-eco-light text-eco-primary shadow-sm"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Title</label>
              <input
                className="input-field"
                placeholder="Item name"
                value={listForm.title}
                onChange={(e) =>
                  setListForm({ ...listForm, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Describe the item..."
                value={listForm.description}
                onChange={(e) =>
                  setListForm({ ...listForm, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select
                  className="input-field"
                  value={listForm.category}
                  onChange={(e) =>
                    setListForm({ ...listForm, category: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Condition</label>
                <select
                  className="input-field"
                  value={listForm.condition}
                  onChange={(e) =>
                    setListForm({ ...listForm, condition: e.target.value })
                  }
                >
                  {["excellent", "good", "fair", "poor"].map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {listForm.listingType === "sale" && (
              <div>
                <label className="label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                  value={listForm.price}
                  onChange={(e) =>
                    setListForm({ ...listForm, price: e.target.value })
                  }
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full !py-3"
              disabled={listingLoading}
            >
              {listingLoading ? "Listing..." : "List Item"}
            </button>
          </div>
        </form>
      )}

      {/* Recycle Guide */}
      {tab === "recycle" && (
        <div className="w-full">
          <form onSubmit={handleRecycle} className="card mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2 tracking-tight">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-purple-500" />
              </div>
              AI Recycling Guide
            </h2>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Describe an item (or upload a photo) and our AI will guide you on
              how to properly recycle, reuse, or dispose of it.
            </p>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describe the item... e.g. 'Old laptop with cracked screen'"
              value={recycleDesc}
              onChange={(e) => setRecycleDesc(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn-primary mt-3"
              disabled={recycleLoading}
            >
              {recycleLoading ? "Analyzing..." : "Get Recycling Guide"}
            </button>
          </form>

          {recycleLoading && (
            <LoadingSpinner text="AI analyzing item..." />
          )}

          {recycleResult && !recycleLoading && (
            <div className="card animate-fade-in">
              <h3 className="font-bold text-lg mb-4 tracking-tight">{recycleResult.itemName}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  {recycleResult.recyclable ? (
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                  <span className="font-semibold text-sm">
                    {recycleResult.recyclable ? "Recyclable" : "Not Recyclable"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {recycleResult.reusable ? (
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <span className="font-semibold text-sm">
                    {recycleResult.reusable ? "Reusable" : "Not Reusable"}
                  </span>
                </div>
              </div>

              {recycleResult.materials?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-1.5 text-sm">
                    <Tag className="w-4 h-4" /> Materials
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {recycleResult.materials.map((m, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium"
                      >
                        {m}
                      </span>
                    ))}
                    </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Disposal Method</h4>
                <p className="text-sm text-gray-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  {recycleResult.disposalMethod}
                </p>
              </div>

              {recycleResult.steps?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm">Steps</h4>
                  <ol className="space-y-2">
                    {recycleResult.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-gray-600"
                      >
                        <span className="w-5 h-5 bg-eco-light text-eco-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {recycleResult.environmentalImpact && (
                <div className="bg-green-50/80 p-4 rounded-xl border border-green-200/60">
                  <h4 className="font-semibold text-green-800 mb-1 text-sm">
                    Environmental Impact
                  </h4>
                  <p className="text-sm text-green-700 leading-relaxed">
                    {recycleResult.environmentalImpact}
                  </p>
                </div>
              )}

              {recycleResult.reusable &&
                recycleResult.reuseIdeas?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">Reuse Ideas</h4>
                    <ul className="space-y-1.5">
                      {recycleResult.reuseIdeas.map((idea, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-eco-primary rounded-full flex-shrink-0" />
                          <span className="leading-relaxed">{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
