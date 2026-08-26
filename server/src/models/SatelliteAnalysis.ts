import mongoose, { Schema, Document } from "mongoose";

export interface SatelliteAnalysisDocument extends Document {
  userId: mongoose.Types.ObjectId;
  region: string;
  coordinates: { lat: number; lng: number };
  ndviData: number[][];
  heatIndex: number[];
  greenScore: number;
  recommendations: string[];
  satelliteSource: string;
}

const satelliteAnalysisSchema = new Schema<SatelliteAnalysisDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    region: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    ndviData: [[Number]],
    heatIndex: [Number],
    greenScore: { type: Number, min: 0, max: 100, default: 0 },
    recommendations: [String],
    satelliteSource: {
      type: String,
      default: "sentinel-2",
    },
  },
  { timestamps: true }
);

export default mongoose.model<SatelliteAnalysisDocument>(
  "SatelliteAnalysis",
  satelliteAnalysisSchema
);
