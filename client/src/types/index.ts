export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "recycler";
  carbonFootprint: number;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SatelliteAnalysis {
  ndviData: number[][];
  heatIndex: number[];
  greenScore: number;
  recommendations: string[];
  raw?: string;
}

export interface BuildingZone {
  name: string;
  suggestedLighting: number;
  suggestedHVAC: number;
  savingsPercent: number;
  reasoning: string;
}

export interface CarbonSummary {
  daily: number;
  weekly: number;
  monthly: number;
  logs: CarbonLog[];
  comparison: {
    averageDaily: number;
    message: string;
  };
}

export interface CarbonLog {
  _id: string;
  category: string;
  description: string;
  co2Amount: number;
  date: string;
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
  sellerId: { name: string; avatar?: string };
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
