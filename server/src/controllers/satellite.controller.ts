import { Response } from "express";
import { IAuthRequest } from "../types/index.js";
import * as aiService from "../services/ai.service.js";
import SatelliteAnalysis from "../models/SatelliteAnalysis.js";

export const analyzeRegion = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { region, coordinates } = req.body;

    if (!region || !coordinates?.lat || !coordinates?.lng) {
      res.status(400).json({ error: "Region and coordinates are required" });
      return;
    }

    const analysis = await aiService.analyzeSatelliteData(region, coordinates);

    const saved = await SatelliteAnalysis.create({
      userId: req.user!.id,
      region,
      coordinates,
      ndviData: analysis.ndviData || [],
      heatIndex: analysis.heatIndex || [],
      greenScore: analysis.greenScore || 0,
      recommendations: analysis.recommendations || [],
    });

    res.json({ analysis, id: saved._id });
  } catch (error) {
    console.error("Satellite analysis error:", error);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
};

export const getHistory = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const analyses = await SatelliteAnalysis.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(analyses);
  } catch {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
