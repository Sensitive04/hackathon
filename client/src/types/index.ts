export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
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
  isSystem: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  recycledListings: number;
  recycleListings: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Post {
  _id: string;
  userId: { _id: string; name: string; avatar?: string };
  content: string;
  images: string[];
  hashtags: string[];
  likes: string[];
  campaignStatus?: "proposed" | "started" | "completed" | "ended";
  volunteerNeeded: number;
  volunteers: { _id: string; name: string; avatar?: string }[];
  conversationId?: string;
  createdAt: string;
}

export interface ChatConversation {
  _id: string;
  title: string;
  participants: { _id: string; name: string; avatar?: string; role?: string }[];
  postId?: { _id: string; content: string; campaignStatus?: string };
  lastMessage: string;
  lastMessageAt: string;
}

export interface TypingUser {
  conversationId: string;
  userId: string;
}

export interface Comment {
  _id: string;
  text: string;
  postId: string;
  userId: { _id: string; name: string; avatar?: string };
  createdAt: string;
}
