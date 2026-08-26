import { Request } from "express";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  avatar?: string;
  carbonFootprint: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export interface SocketPostEvent {
  _id: string;
  userId: { _id: string; name: string; avatar?: string };
  content: string;
  images: string[];
  hashtags: string[];
  likes: string[];
  campaignStatus?: "proposed" | "started" | "completed";
  volunteerNeeded: number;
  volunteers: { _id: string; name: string; avatar?: string }[];
  createdAt: string;
}

export interface SocketLikeEvent {
  postId: string;
  likes: string[];
}

export interface SocketDeleteEvent {
  postId: string;
}

export interface SocketCampaignCreatedEvent {
  conversation: {
    _id: string;
    title: string;
    participants: { _id: string; name: string; avatar?: string; role?: string }[];
    postId: { _id: string; content: string; campaignStatus?: string };
    lastMessage: string;
    lastMessageAt: string;
  };
}

export interface SocketTypingEvent {
  conversationId: string;
  userId: string;
}

export interface SocketChatMessageEvent {
  conversationId: string;
  message: {
    _id: string;
    senderId: { _id: string; name: string; avatar?: string };
    content: string;
    createdAt: string;
  };
}
