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

  // List form
  const [listForm, setListForm] = useState({
    title: "",
    description: "",
    category: "electronics",
    condition: "good",
    price: "",
    listingType: "sale" as "sale" | "free" | "recycle",
  });
  const [listingLoading, setListingLoading] = useState(false);

  // Recycle form
  const [recycleDesc, setRecycleDesc] = useState("");
  const [recycleResult, setRecycleResult] = useState<RecyclingAnalysis | null>(null);
  const [recycleLoading, setRecycleLoading] = useState(false);

  const fetchItems = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
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
      await api.purchaseItem(id);
      toast.success("Item purchased!");
      fetchItems(page);
    } catch (err: any) {
      toast.error(err.message || "Purchase failed");
    }
  };

  const categories = [
    "electronics", "furniture", "clothing", "books", "appliances", "other",
  ];

  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    sold: "bg-blue-100 text-blue-700",
    recycled: "bg-emerald-100 text-emerald-700",
    expired: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Garbage Management & Marketplace
          </h1>
        </div>
        <p className="text-gray-500">
          AI-powered recycling guidance, item reuse marketplace, and waste management.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
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
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              tab === t.key
                ? "border-eco-primary text-eco-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
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
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-9"
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
              className="input-field w-auto"
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

          {loading && <LoadingSpinner text="Loading marketplace..." />}
          {error && <ErrorDisplay message={error} onRetry={fetchItems} />}

          {!loading && items.length === 0 && (
            <div className="card text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No items found. Be the first to list!</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.listingType === "free"
                        ? "bg-green-100 text-green-700"
                        : item.listingType === "recycle"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {item.listingType === "free"
                      ? "Free"
                      : item.listingType === "recycle"
                      ? "Recycle"
                      : `$${item.price}`}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="capitalize">{item.category}</span>
                  <span className="capitalize">{item.condition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    by {item.sellerId?.name || "Unknown"}
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
                        className="text-gray-400 hover:text-eco-primary transition-colors"
                        title="Message Seller"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    {item.status === "available" && (
                      <button
                        onClick={() => handlePurchase(item._id)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        {item.listingType === "free" ? "Claim" : item.listingType === "recycle" ? "Recycle" : "Buy"}
                      </button>
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
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => fetchItems(page + 1)}
                disabled={page >= pages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
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
              className="input-field w-auto"
              value={myStatusFilter}
              onChange={(e) => setMyStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="recycled">Recycled</option>
              <option value="expired">Expired</option>
            </select>
            <select
              className="input-field w-auto"
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
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You haven't listed any items yet.</p>
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
              <div key={item._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        statusColors[item.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="capitalize">{item.category}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        item.listingType === "free"
                          ? "bg-green-100 text-green-700"
                          : item.listingType === "recycle"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                    {item.listingType === "sale" ? `$${item.price}` : item.listingType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                  <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleMessageSeller(user!.id, item._id)}
                    className="flex items-center gap-1 text-eco-primary hover:text-eco-primary/80 transition-colors"
                    title="View conversations about this listing"
                  >
                    <MessageCircle className="w-3 h-3" />
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
        <form onSubmit={handleList} className="card max-w-2xl">
          <h2 className="font-bold mb-4">List an Item</h2>
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
                    className={`p-3 rounded-xl border-2 text-center capitalize font-medium text-sm transition-all ${
                      listForm.listingType === type
                        ? "border-eco-primary bg-eco-light text-eco-primary"
                        : "border-gray-200 text-gray-500"
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
              className="btn-primary"
              disabled={listingLoading}
            >
              {listingLoading ? "Listing..." : "List Item"}
            </button>
          </div>
        </form>
      )}

      {/* Recycle Guide */}
      {tab === "recycle" && (
        <div className="max-w-2xl">
          <form onSubmit={handleRecycle} className="card mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-500" />
              AI Recycling Guide
            </h2>
            <p className="text-sm text-gray-500 mb-4">
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
            <div className="card">
              <h3 className="font-bold text-lg mb-4">{recycleResult.itemName}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {recycleResult.recyclable ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {recycleResult.recyclable ? "Recyclable" : "Not Recyclable"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {recycleResult.reusable ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-medium">
                    {recycleResult.reusable ? "Reusable" : "Not Reusable"}
                  </span>
                </div>
              </div>

              {recycleResult.materials?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" /> Materials
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recycleResult.materials.map((m, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {m}
                      </span>
                    ))}
                    </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-medium mb-2">Disposal Method</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                  {recycleResult.disposalMethod}
                </p>
              </div>

              {recycleResult.steps?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Steps</h4>
                  <ol className="space-y-2">
                    {recycleResult.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="w-5 h-5 bg-eco-light text-eco-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {recycleResult.environmentalImpact && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-medium text-green-800 mb-1">
                    Environmental Impact
                  </h4>
                  <p className="text-sm text-green-700">
                    {recycleResult.environmentalImpact}
                  </p>
                </div>
              )}

              {recycleResult.reusable &&
                recycleResult.reuseIdeas?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Reuse Ideas</h4>
                    <ul className="space-y-1">
                      {recycleResult.reuseIdeas.map((idea, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {idea}
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
