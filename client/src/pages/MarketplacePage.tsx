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
  X,
  ImagePlus,
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
    listingType: "sale" as "sale" | "free",
  });
  const [listImages, setListImages] = useState<string[]>([]);
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
        images: listImages,
        price: listForm.listingType === "free" ? 0 : parseFloat(listForm.price) || 0,
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
      setListImages([]);
      setTab("browse");
      fetchItems(1);
    } catch (err: any) {
      toast.error(err.message || "Failed to list item");
    } finally {
      setListingLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - listImages.length;
    if (remaining <= 0) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setListImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setListImages((prev) => prev.filter((_, i) => i !== index));
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
    available: "bg-neu-accent/10 text-green-700 shadow-neu-pressed-sm",
    pending: "bg-neu-amber-light text-amber-700 shadow-neu-pressed-sm",
    sold: "bg-neu-blue-light text-blue-700 shadow-neu-pressed-sm",
    recycled: "bg-neu-accent/10 text-emerald-700 shadow-neu-pressed-sm",
    expired: "bg-neu-bg text-neu-text-muted shadow-neu-pressed-sm",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon">
            <Recycle className="w-5 h-5 text-purple-500" />
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
      <div className="flex gap-2 mb-8 overflow-x-auto">
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
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-2xl transition-all duration-200 whitespace-nowrap ${
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

      {/* Browse / Marketplace */}
      {tab === "browse" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neu-text-muted" />
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
            </select>
          </div>

          {loading && <LoadingSpinner text="Loading marketplace..." />}
          {error && <ErrorDisplay message={error} onRetry={() => fetchItems(1)} />}

          {!loading && items.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-14 h-14 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-3 shadow-neu-pressed-sm">
                <Package className="w-7 h-7 text-neu-text-muted" />
              </div>
              <p className="text-neu-text-secondary font-medium">No items found. Be the first to list!</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="card group">
                {item.images && item.images.length > 0 && (
                  <div className="mb-3 -mx-1 -mt-1 rounded-xl overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-neu-text tracking-tight group-hover:text-eco-primary transition-colors duration-200">{item.title}</h3>
                  <span
                    className={`badge ${
                      item.listingType === "free"
                        ? "bg-neu-accent/10 text-green-700 shadow-neu-pressed-sm"
                        : "bg-purple-100 text-purple-700 shadow-neu-pressed-sm"
                    }`}
                  >
                    {item.listingType === "free"
                      ? "Free"
                      : `$${item.price}`}
                  </span>
                </div>
                <p className="text-sm text-neu-text-secondary mb-3 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-neu-text-muted mb-3">
                  <span className="capitalize font-medium">{item.category}</span>
                  <span className="capitalize font-medium">{item.condition}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-neu-shadow-dark/15">
                  <span className="text-xs text-neu-text-muted">
                    by <span className="font-medium text-neu-text-secondary">{item.sellerId?.name || "Unknown"}</span>
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
                        className="p-1.5 text-neu-text-muted hover:text-eco-primary hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200"
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
                        {item.listingType === "free" ? "Claim" : "Buy"}
                      </button>
                    )}
                    {item.status === "pending" && (
                      <span className="badge text-xs !py-1 !px-2.5 bg-neu-amber-light text-amber-700 shadow-neu-pressed-sm">
                        Pending
                      </span>
                    )}
                    {item.status !== "available" && item.status !== "pending" && (
                      <span className={`badge text-xs !py-1 !px-2.5 ${
                        item.status === "sold"
                          ? "bg-neu-blue-light text-blue-700 shadow-neu-pressed-sm"
                          : item.status === "recycled"
                          ? "bg-neu-accent/10 text-emerald-700 shadow-neu-pressed-sm"
                          : "bg-neu-bg text-neu-text-muted shadow-neu-pressed-sm"
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
                className="btn-ghost text-sm !px-3 !py-1.5 shadow-neu-raised-sm disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-neu-text-secondary font-medium">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => fetchItems(page + 1)}
                disabled={page >= pages}
                className="btn-ghost text-sm !px-3 !py-1.5 shadow-neu-raised-sm disabled:opacity-30"
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
            </select>
          </div>

          {loading && <LoadingSpinner text="Loading your listings..." />}

          {!loading && myItems.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-14 h-14 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-3 shadow-neu-pressed-sm">
                <Package className="w-7 h-7 text-neu-text-muted" />
              </div>
              <p className="text-neu-text-secondary font-medium">You haven&apos;t listed any items yet.</p>
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
                {item.images && item.images.length > 0 && (
                  <div className="mb-3 -mx-1 -mt-1 rounded-xl overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-neu-text tracking-tight">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        statusColors[item.status] || "bg-neu-bg text-neu-text-muted shadow-neu-pressed-sm"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neu-text-secondary mb-3 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-neu-text-muted mb-3">
                  <span className="capitalize font-medium">{item.category}</span>
                    <span
                      className={`badge ${
                        item.listingType === "free"
                          ? "bg-neu-accent/10 text-green-700 shadow-neu-pressed-sm"
                          : "bg-purple-100 text-purple-700 shadow-neu-pressed-sm"
                      }`}
                    >
                    {item.listingType === "sale" ? `$${item.price}` : "Free"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neu-text-muted border-t border-neu-shadow-dark/15 pt-3">
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
          <h2 className="font-bold mb-4 tracking-tight text-neu-text">List an Item</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Listing Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["sale", "free"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setListForm({ ...listForm, listingType: type as any })
                    }
                    className={`p-3 rounded-2xl text-center capitalize font-semibold text-sm transition-all duration-200 active:scale-[0.97] ${
                      listForm.listingType === type
                        ? "shadow-neu-pressed bg-eco-primary text-white"
                        : "shadow-neu-raised-sm bg-neu-bg text-neu-text-secondary hover:shadow-neu-hover"
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

            <div>
              <label className="label">Photos (optional, max 5)</label>
              <div className="flex flex-wrap gap-2">
                {listImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-neu-raised-sm group">
                    <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {listImages.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-neu-shadow-dark/25 flex flex-col items-center justify-center cursor-pointer hover:border-eco-primary/50 hover:bg-eco-primary/5 transition-all duration-200">
                    <ImagePlus className="w-5 h-5 text-neu-text-muted" />
                    <span className="text-[10px] text-neu-text-muted mt-0.5 font-medium">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              {listImages.length > 0 && (
                <p className="text-[11px] text-neu-text-muted mt-1.5">{listImages.length}/5 photos added</p>
              )}
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
              <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
                <Camera className="w-4 h-4 text-purple-500" />
              </div>
              AI Recycling Guide
            </h2>
            <p className="text-sm text-neu-text-secondary mb-4 leading-relaxed">
              Describe an item and our AI will guide you on
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
              <h3 className="font-bold text-lg mb-4 tracking-tight text-neu-text">{recycleResult.itemName}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  {recycleResult.recyclable ? (
                    <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                  <span className="font-semibold text-sm text-neu-text">
                    {recycleResult.recyclable ? "Recyclable" : "Not Recyclable"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {recycleResult.reusable ? (
                    <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
                      <XCircle className="w-4 h-4 text-neu-text-muted" />
                    </div>
                  )}
                  <span className="font-semibold text-sm text-neu-text">
                    {recycleResult.reusable ? "Reusable" : "Not Reusable"}
                  </span>
                </div>
              </div>

              {recycleResult.materials?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-1.5 text-sm text-neu-text-secondary">
                    <Tag className="w-4 h-4" /> Materials
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {recycleResult.materials.map((m, i) => (
                      <span
                        key={i}
                        className="bg-neu-bg text-neu-text-secondary text-xs px-2.5 py-1 rounded-xl font-medium shadow-neu-pressed-sm"
                      >
                        {m}
                      </span>
                    ))}
                    </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm text-neu-text-secondary">Disposal Method</h4>
                <p className="text-sm text-neu-text-secondary bg-neu-bg p-3 rounded-2xl shadow-neu-pressed-sm leading-relaxed">
                  {recycleResult.disposalMethod}
                </p>
              </div>

              {recycleResult.steps?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm text-neu-text-secondary">Steps</h4>
                  <ol className="space-y-2">
                    {recycleResult.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-neu-text-secondary"
                      >
                        <span className="w-5 h-5 bg-neu-bg text-eco-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-neu-pressed-sm">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {recycleResult.environmentalImpact && (
                <div className="bg-neu-accent/10 p-4 rounded-2xl shadow-neu-pressed-sm">
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
                    <h4 className="font-semibold mb-2 text-sm text-neu-text-secondary">Reuse Ideas</h4>
                    <ul className="space-y-1.5">
                      {recycleResult.reuseIdeas.map((idea, i) => (
                        <li
                          key={i}
                          className="text-sm text-neu-text-secondary flex items-center gap-2"
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
