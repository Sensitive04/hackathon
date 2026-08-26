import { Request } from "express";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "recycler";
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

export interface IRoute {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  ecoScore: number;
  distance: number;
  estimatedCO2: number;
  duration: number;
  polyline?: string;
}

export interface IBuildingZone {
  name: string;
  area: number;
  occupancy: number;
  temperature: number;
  sunlight: number;
  currentEnergy: number;
  suggestedEnergy: number;
  savings: number;
}

export interface IMarketplaceItem {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: "excellent" | "good" | "fair" | "poor";
  price: number;
  seller: string;
  status: "available" | "sold" | "recycled" | "expired";
  listingType: "sale" | "free" | "recycle";
  postedAt: Date;
  expiresAt: Date;
}

export interface ISatelliteAnalysis {
  _id: string;
  region: string;
  coordinates: { lat: number; lng: number };
  ndviData: number[][];
  heatIndex: number[];
  greenScore: number;
  recommendations: string[];
  analyzedAt: Date;
}
