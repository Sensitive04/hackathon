import { getChatCompletion } from "../config/ai.js";

const SYSTEM_PROMPT = [
  "You are GreenVerse AI, an expert environmental sustainability assistant.",
  "You specialize in carbon emissions analysis, urban greening strategies,",
  "energy optimization, and waste management/recycling guidance.",
  "Always provide data-driven, actionable recommendations.",
  "Format responses as structured JSON when possible.",
].join(" ");

async function generateContent(prompt: string): Promise<string> {
  return getChatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);
}

function extractJSON(text: string): any {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) return JSON.parse(jsonMatch[1]);
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function analyzeSatelliteData(region: string, coordinates: { lat: number; lng: number }) {
  const prompt = [
    `Analyze the urban area of "${region}" at coordinates (${coordinates.lat}, ${coordinates.lng}).`,
    "Provide a comprehensive urban heat and greening analysis including:",
    "1. NDVI (Normalized Difference Vegetation Index) data for a 5x5 grid simulating satellite imagery",
    "2. Heat vulnerability index for different zones",
    "3. A green score (0-100) representing current vegetation coverage",
    "4. Specific recommendations for where to plant trees to most effectively lower temperatures",
    "Return ONLY valid JSON with keys: ndviData (5x5 number array, values -1 to 1), heatIndex (array of 5 numbers 0-100), greenScore (number 0-100), recommendations (array of strings)",
  ].join(" ");

  const response = await generateContent(prompt);
  return extractJSON(response);
}

export async function analyzeRecycling(imageDescription: string) {
  const prompt = [
    `A user has submitted an item for recycling analysis. Description: "${imageDescription}"`,
    "Provide a comprehensive recycling guidance including:",
    "- Item identification and material composition",
    "- Whether it can be recycled, reused, or needs special disposal",
    "- Step-by-step recycling instructions",
    "- Environmental impact of proper recycling",
    "- If still usable, suggest reuse ideas or marketplace listing",
    "Return ONLY valid JSON with keys: itemName, materials (array), recyclable (boolean), disposalMethod, steps (array), environmentalImpact, reusable (boolean), reuseIdeas (array), suggestedPrice (number, 0 if not sellable)",
  ].join(" ");

  const response = await generateContent(prompt);
  return extractJSON(response);
}
