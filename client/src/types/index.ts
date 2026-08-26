export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "recycler";
  carbonFootprint: number;
  avatar?: string;
}

export interface MarketplaceItem {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: string;
  price: number;
  listingType: "sale" | "free" | "recycle";
  sellerId: { _id: string; name: string; avatar?: string };
  status: string;
  createdAt: string;
}

export interface RecyclingAnalysis {
  itemName: string;
  materials: string[];
  recyclable: boolean;
  disposalMethod: string;
  steps: string[];
  environmentalImpact: string;
  reusable: boolean;
  reuseIdeas: string[];
  suggestedPrice: number;
  raw?: string;
}

export interface Conversation {
  id: string;
  otherUser: { _id: string; name: string; avatar?: string; role: string };
  listing?: { _id: string; title: string; images: string[]; listingType: string };
  lastMessage: string;
  lastMessageAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: { _id: string; name: string; avatar?: string };
  content: string;
  read: boolean;
  createdAt: string;
}

export interface RecyclePickup {
  _id: string;
  listingId: {
    _id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    condition: string;
  };
  requesterId: { _id: string; name: string; avatar?: string };
  recyclerId?: { _id: string; name: string; avatar?: string };
  status: "pending" | "claimed" | "picked_up" | "completed";
  notes: string;
  scheduledDate?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  recyclerCount: number;
  userCount: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  recycledListings: number;
  pendingPickups: number;
  completedPickups: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "recycler";
  createdAt: string;
}
