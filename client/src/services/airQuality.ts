export interface ZoneData {
  name: string;
  lat: number;
  lng: number;
  co2: number;
  aqi: number;
  status: "good" | "moderate" | "critical";
}

export interface CityAirData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  avgCO2: number;
  avgAqi: number;
  zones: ZoneData[];
  source: "live" | "mock";
}

const WAQI_TOKEN = "demo";

const FALLBACK_DATA: Record<string, CityAirData> = {
  "new york": {
    city: "New York",
    country: "US",
    lat: 40.7128,
    lng: -74.006,
    avgCO2: 415,
    avgAqi: 68,
    source: "mock",
    zones: [
      { name: "Manhattan", lat: 40.7831, lng: -73.9712, co2: 430, aqi: 78, status: "critical" },
      { name: "Brooklyn", lat: 40.6782, lng: -73.9442, co2: 405, aqi: 62, status: "moderate" },
      { name: "Queens", lat: 40.7282, lng: -73.7949, co2: 395, aqi: 55, status: "good" },
      { name: "Bronx", lat: 40.8448, lng: -73.8648, co2: 410, aqi: 70, status: "moderate" },
      { name: "Staten Island", lat: 40.5795, lng: -74.1502, co2: 380, aqi: 42, status: "good" },
      { name: "Central Park", lat: 40.7829, lng: -73.9654, co2: 360, aqi: 35, status: "good" },
      { name: "Times Square", lat: 40.758, lng: -73.9855, co2: 445, aqi: 85, status: "critical" },
      { name: "Harlem", lat: 40.8116, lng: -73.9465, co2: 420, aqi: 72, status: "critical" },
    ],
  },
  london: {
    city: "London",
    country: "GB",
    lat: 51.5074,
    lng: -0.1278,
    avgCO2: 405,
    avgAqi: 58,
    source: "mock",
    zones: [
      { name: "Westminster", lat: 51.4975, lng: -0.1357, co2: 425, aqi: 72, status: "critical" },
      { name: "Camden", lat: 51.529, lng: -0.1255, co2: 400, aqi: 60, status: "moderate" },
      { name: "Greenwich", lat: 51.4769, lng: -0.0005, co2: 385, aqi: 45, status: "good" },
      { name: "Hackney", lat: 51.5459, lng: -0.0553, co2: 395, aqi: 52, status: "moderate" },
      { name: "Islington", lat: 51.5362, lng: -0.1033, co2: 410, aqi: 65, status: "moderate" },
      { name: "Hyde Park", lat: 51.5073, lng: -0.1657, co2: 350, aqi: 30, status: "good" },
    ],
  },
  tokyo: {
    city: "Tokyo",
    country: "JP",
    lat: 35.6762,
    lng: 139.6503,
    avgCO2: 420,
    avgAqi: 72,
    source: "mock",
    zones: [
      { name: "Shinjuku", lat: 35.6938, lng: 139.7034, co2: 440, aqi: 82, status: "critical" },
      { name: "Shibuya", lat: 35.658, lng: 139.7016, co2: 430, aqi: 76, status: "critical" },
      { name: "Chiyoda", lat: 35.694, lng: 139.7536, co2: 415, aqi: 68, status: "moderate" },
      { name: "Minato", lat: 35.6581, lng: 139.7514, co2: 410, aqi: 65, status: "moderate" },
      { name: "Sumida", lat: 35.7107, lng: 139.8015, co2: 395, aqi: 55, status: "moderate" },
      { name: "Ueno Park", lat: 35.7141, lng: 139.7741, co2: 365, aqi: 38, status: "good" },
    ],
  },
  delhi: {
    city: "Delhi",
    country: "IN",
    lat: 28.7041,
    lng: 77.1025,
    avgCO2: 460,
    avgAqi: 155,
    source: "mock",
    zones: [
      { name: "Connaught Place", lat: 28.6315, lng: 77.2167, co2: 480, aqi: 175, status: "critical" },
      { name: "Karol Bagh", lat: 28.6519, lng: 77.1903, co2: 470, aqi: 165, status: "critical" },
      { name: "Dwarka", lat: 28.5921, lng: 77.046, co2: 440, aqi: 140, status: "critical" },
      { name: "Lajpat Nagar", lat: 28.5693, lng: 77.2385, co2: 455, aqi: 152, status: "critical" },
      { name: "Rohini", lat: 28.7495, lng: 77.0654, co2: 435, aqi: 135, status: "critical" },
      { name: "Lodhi Garden", lat: 28.5931, lng: 77.2197, co2: 390, aqi: 95, status: "moderate" },
    ],
  },
  paris: {
    city: "Paris",
    country: "FR",
    lat: 48.8566,
    lng: 2.3522,
    avgCO2: 395,
    avgAqi: 52,
    source: "mock",
    zones: [
      { name: "Le Marais", lat: 48.8566, lng: 2.3622, co2: 410, aqi: 62, status: "moderate" },
      { name: "Montmartre", lat: 48.8867, lng: 2.3431, co2: 400, aqi: 56, status: "moderate" },
      { name: "Belleville", lat: 48.872, lng: 2.3835, co2: 415, aqi: 65, status: "critical" },
      { name: "Bois de Boulogne", lat: 48.8628, lng: 2.2494, co2: 355, aqi: 28, status: "good" },
      { name: "Latin Quarter", lat: 48.8503, lng: 2.3469, co2: 395, aqi: 50, status: "moderate" },
      { name: "Tuileries Garden", lat: 48.8634, lng: 2.3275, co2: 365, aqi: 32, status: "good" },
    ],
  },
};

const KNOWN_CITIES: Record<string, { lat: number; lng: number; country: string }> = {
  "new york": { lat: 40.7128, lng: -74.006, country: "US" },
  london: { lat: 51.5074, lng: -0.1278, country: "GB" },
  tokyo: { lat: 35.6762, lng: 139.6503, country: "JP" },
  delhi: { lat: 28.7041, lng: 77.1025, country: "IN" },
  paris: { lat: 48.8566, lng: 2.3522, country: "FR" },
  berlin: { lat: 52.52, lng: 13.405, country: "DE" },
  sydney: { lat: -33.8688, lng: 151.2093, country: "AU" },
  beijing: { lat: 39.9042, lng: 116.4074, country: "CN" },
  mumbai: { lat: 19.076, lng: 72.8777, country: "IN" },
  cairo: { lat: 30.0444, lng: 31.2357, country: "EG" },
  "sao paulo": { lat: -23.5505, lng: -46.6333, country: "BR" },
  moscow: { lat: 55.7558, lng: 37.6173, country: "RU" },
  toronto: { lat: 43.6532, lng: -79.3832, country: "CA" },
  dubai: { lat: 25.2048, lng: 55.2708, country: "AE" },
  singapore: { lat: 1.3521, lng: 103.8198, country: "SG" },
  bangkok: { lat: 13.7563, lng: 100.5018, country: "TH" },
  rome: { lat: 41.9028, lng: 12.4964, country: "IT" },
  barcelona: { lat: 41.3874, lng: 2.1686, country: "ES" },
  amsterdam: { lat: 52.3676, lng: 4.9041, country: "NL" },
  "los angeles": { lat: 34.0522, lng: -118.2437, country: "US" },
  chicago: { lat: 41.8781, lng: -87.6298, country: "US" },
  seoul: { lat: 37.5665, lng: 126.978, country: "KR" },
  istanbul: { lat: 41.0082, lng: 28.9784, country: "TR" },
  lagos: { lat: 6.5244, lng: 3.3792, country: "NG" },
  nairobi: { lat: -1.2921, lng: 36.8219, country: "KE" },
  "buenos aires": { lat: -34.6037, lng: -58.3816, country: "AR" },
  lima: { lat: -12.0464, lng: -77.0428, country: "PE" },
  bogota: { lat: 4.711, lng: -74.0721, country: "CO" },
  johannesburg: { lat: -26.2041, lng: 28.0473, country: "ZA" },
  "hong kong": { lat: 22.3193, lng: 114.1694, country: "HK" },
};

function generateMockData(cityName: string, lat: number, lng: number): CityAirData {
  const zones: ZoneData[] = [];
  const zoneNames = [
    "Downtown", "North District", "South District", "East Side",
    "West Side", "Central Park", "Industrial Zone", "Residential Area",
  ];

  const numZones = 6 + Math.floor(Math.random() * 3);
  let totalCO2 = 0;
  let totalAqi = 0;

  for (let i = 0; i < numZones; i++) {
    const offsetLat = (Math.random() - 0.5) * 0.06;
    const offsetLng = (Math.random() - 0.5) * 0.06;
    const co2 = 350 + Math.floor(Math.random() * 120);
    const aqi = 25 + Math.floor(Math.random() * 160);
    let status: "good" | "moderate" | "critical" = "good";
    if (co2 > 430 || aqi > 100) status = "critical";
    else if (co2 > 390 || aqi > 50) status = "moderate";

    zones.push({
      name: zoneNames[i % zoneNames.length],
      lat: lat + offsetLat,
      lng: lng + offsetLng,
      co2,
      aqi,
      status,
    });
    totalCO2 += co2;
    totalAqi += aqi;
  }

  return {
    city: cityName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    country: "",
    lat,
    lng,
    avgCO2: Math.round(totalCO2 / zones.length),
    avgAqi: Math.round(totalAqi / zones.length),
    zones,
    source: "mock",
  };
}

async function fetchWAQIByCity(city: string): Promise<CityAirData | null> {
  try {
    const res = await fetch(
      `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${WAQI_TOKEN}`
    );
    const data = await res.json();
    if (data.status !== "ok" || !data.data) return null;

    const d = data.data;
    const cityLat = d.city?.geo?.[0] ?? 0;
    const cityLng = d.city?.geo?.[1] ?? 0;
    const aqi = d.aqi ?? 50;

    const co2Estimate = 350 + Math.round(aqi * 1.2);

    const zones: ZoneData[] = [];
    if (d.city?.geo) {
      const numZones = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numZones; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.05;
        const offsetLng = (Math.random() - 0.5) * 0.05;
        const zoneAqi = Math.max(10, aqi + Math.floor((Math.random() - 0.5) * 60));
        const zoneCO2 = 350 + Math.round(zoneAqi * 1.1);
        let status: "good" | "moderate" | "critical" = "good";
        if (zoneCO2 > 430 || zoneAqi > 100) status = "critical";
        else if (zoneCO2 > 390 || zoneAqi > 50) status = "moderate";

        zones.push({
          name: `Zone ${i + 1}`,
          lat: cityLat + offsetLat,
          lng: cityLng + offsetLng,
          co2: zoneCO2,
          aqi: zoneAqi,
          status,
        });
      }
    }

    return {
      city: d.city?.name?.split(" ").slice(0, 3).join(" ") ?? city,
      country: "",
      lat: cityLat,
      lng: cityLng,
      avgCO2: co2Estimate,
      avgAqi: aqi,
      zones,
      source: "live",
    };
  } catch {
    return null;
  }
}

export async function searchCity(query: string): Promise<{ name: string; lat: number; lng: number }[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const matches = Object.entries(KNOWN_CITIES)
    .filter(([name]) => name.includes(q))
    .map(([name, c]) => ({
      name: name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      lat: c.lat,
      lng: c.lng,
    }));

  if (matches.length > 0) return matches.slice(0, 5);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
    );
    const results = await res.json();
    return results.map((r: any) => ({
      name: r.display_name.split(",").slice(0, 2).join(","),
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }));
  } catch {
    return [];
  }
}

export async function getCityAirData(cityName: string, lat: number, lng: number): Promise<CityAirData> {
  const fallbackKey = cityName.toLowerCase().trim();
  const fallback = FALLBACK_DATA[fallbackKey];

  const liveData = await fetchWAQIByCity(cityName);
  if (liveData) return liveData;

  if (fallback) return fallback;

  return generateMockData(cityName, lat, lng);
}
