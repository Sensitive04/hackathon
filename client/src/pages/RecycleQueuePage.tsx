import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { RecyclePickup } from "../types";
import toast from "react-hot-toast";
import {
  Recycle,
  MapPin,
  CheckCircle,
  Truck,
  Clock,
  Package,
} from "lucide-react";

type Tab = "pending" | "my-pickups";

export default function RecycleQueuePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<RecyclePickup[]>([]);
  const [myPickups, setMyPickups] = useState<RecyclePickup[]>([]);
  const [loading, setLoading] = useState(false);

  const isRecycler = user?.role === "recycler" || user?.role === "admin";

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingPickups();
      setPending(data);
    } catch {
      toast.error("Failed to load pending pickups");
    } finally {
      setLoading(false);
    }
  };

  const loadMyPickups = async () => {
    setLoading(true);
    try {
      const data = await api.getMyPickups();
      setMyPickups(data);
    } catch {
      toast.error("Failed to load your pickups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "pending") loadPending();
    if (tab === "my-pickups") loadMyPickups();
  }, [tab]);

  const handleClaim = async (listingId: string) => {
    try {
      await api.claimPickup(listingId);
      toast.success("Pickup claimed!");
      loadPending();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updatePickupStatus(id, status);
      toast.success("Status updated");
      loadMyPickups();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const statusConfig: Record<
    string,
    { color: string; icon: any; label: string }
  > = {
    pending: {
      color: "bg-amber-100 text-amber-700",
      icon: Clock,
      label: "Pending",
    },
    claimed: {
      color: "bg-blue-100 text-blue-700",
      icon: MapPin,
      label: "Claimed",
    },
    picked_up: {
      color: "bg-purple-100 text-purple-700",
      icon: Truck,
      label: "Picked Up",
    },
    completed: {
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
      label: "Completed",
    },
  };

  const nextStatus: Record<string, string> = {
    claimed: "picked_up",
    picked_up: "completed",
  };

  const renderPickupCard = (pickup: RecyclePickup, showActions = false) => {
    const sc = statusConfig[pickup.status];
    const StatusIcon = sc.icon;
    const next = nextStatus[pickup.status];

    return (
      <div key={pickup._id} className="card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-900">
              {pickup.listingId?.title || "Unknown Item"}
            </h3>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${sc.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {sc.label}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-2">
          {pickup.listingId?.description?.slice(0, 150)}
          {pickup.listingId?.description?.length > 150 ? "..." : ""}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span>Category: {pickup.listingId?.category}</span>
          <span>Condition: {pickup.listingId?.condition}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <span>
            Listed by: {pickup.requesterId?.name || "Unknown"}
          </span>
          {pickup.recyclerId && (
            <span>
              Recycler: {pickup.recyclerId.name}
            </span>
          )}
          <span>{new Date(pickup.createdAt).toLocaleDateString()}</span>
        </div>

        {showActions && isRecycler && (
          <div className="mt-3 flex gap-2">
            {pickup.status === "pending" && (
              <button
                onClick={() => handleClaim(pickup.listingId._id)}
                className="btn-primary text-sm py-1.5"
              >
                Claim for Pickup
              </button>
            )}
            {next && (
              <button
                onClick={() => handleStatusUpdate(pickup._id, next)}
                className="btn-secondary text-sm py-1.5"
              >
                Mark as{" "}
                {next === "picked_up" ? "Picked Up" : "Completed"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isRecycler) {
    return (
      <div className="page-container">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Recycle Queue</h1>
          </div>
          <p className="text-gray-500">View items available for recycling pickup.</p>
        </div>
        <div className="card text-center py-12">
          <Recycle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Access Restricted</p>
          <p className="text-sm text-gray-400 mt-1">
            Only recyclers and admins can access the recycle queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Recycle Queue</h1>
        </div>
        <p className="text-gray-500">
          Collect and process items for proper recycling.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            tab === "pending"
              ? "bg-eco-primary text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          Pending Pickups ({pending.length})
        </button>
        <button
          onClick={() => setTab("my-pickups")}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            tab === "my-pickups"
              ? "bg-eco-primary text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          My Pickups ({myPickups.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tab === "pending" &&
            (pending.length === 0 ? (
              <div className="col-span-2 card text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending pickups</p>
              </div>
            ) : (
              pending.map((p) => renderPickupCard(p, true))
            ))}
          {tab === "my-pickups" &&
            (myPickups.length === 0 ? (
              <div className="col-span-2 card text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pickups yet</p>
              </div>
            ) : (
              myPickups.map((p) => renderPickupCard(p, true))
            ))}
        </div>
      )}
    </div>
  );
}
