import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Satellite, Search, AlertTriangle, TreePine, Wind, MapPin, Loader2 } from "lucide-react";
import { searchCity, getCityAirData, CityAirData, ZoneData } from "../services/airQuality";
import LoadingSpinner from "../components/common/LoadingSpinner";
import "leaflet/dist/leaflet.css";

function getMarkerColor(status: ZoneData["status"]) {
  if (status === "critical") return "#ef4444";
  if (status === "moderate") return "#eab308";
  return "#22c55e";
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  return "Unhealthy";
}

function getCO2Label(co2: number): string {
  if (co2 < 390) return "Safe";
  if (co2 < 430) return "Moderate";
  return "Critical";
}

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 11, { duration: 1.5 });
  }, [center, map]);
  return null;
}

const DEFAULT_CITY = "Mandalay, Mandalay City";
const DEFAULT_LAT = 21.9588;
const DEFAULT_LNG = 96.0891;

export default function SatellitePage() {
  const [searchQuery, setSearchQuery] = useState(DEFAULT_CITY);
  const [suggestions, setSuggestions] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [airData, setAirData] = useState<CityAirData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG]);
  const [mapZoom, setMapZoom] = useState(11);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const progressRef = useRef<ReturnType<typeof setInterval>>();

  const startProgress = useCallback(() => {
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      const remaining = 95 - p;
      const step = Math.max(0.5, remaining * 0.08) * (0.6 + Math.random() * 0.8);
      p = Math.min(p + step, 95);
      setProgress(Math.floor(p));
    }, 350);
  }, []);

  const finishProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 400);
  }, []);

  useEffect(() => {
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setHasSearched(true);
      startProgress();
      try {
        const data = await getCityAirData(DEFAULT_CITY, DEFAULT_LAT, DEFAULT_LNG);
        setAirData(data);
      } catch {
        setAirData(null);
      } finally {
        finishProgress();
        setLoading(false);
      }
    })();
  }, []);

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchCity(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);
  }, []);

  const handleSelectCity = useCallback(async (name: string, lat: number, lng: number) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    setLoading(true);
    setHasSearched(true);
    setMapCenter([lat, lng]);
    setMapZoom(11);
    startProgress();
    try {
      const data = await getCityAirData(name, lat, lng);
      setAirData(data);
    } catch {
      setAirData(null);
    } finally {
      finishProgress();
      setLoading(false);
    }
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      const s = suggestions[0];
      handleSelectCity(s.name, s.lat, s.lng);
      return;
    }
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    startProgress();
    try {
      const results = await searchCity(searchQuery);
      if (results.length > 0) {
        const r = results[0];
        setSearchQuery(r.name);
        setMapCenter([r.lat, r.lng]);
        setMapZoom(11);
        const data = await getCityAirData(r.name, r.lat, r.lng);
        setAirData(data);
      } else {
        setAirData(null);
      }
    } catch {
      setAirData(null);
    } finally {
      finishProgress();
      setLoading(false);
    }
  };

  const criticalZones = airData?.zones.filter(z => z.status === "critical") ?? [];
  const treesNeeded = criticalZones.reduce((sum, z) => {
    const excess = Math.max(0, z.co2 - 400);
    return sum + Math.ceil(excess / 0.022) ;
  }, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon">
            <Satellite className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="page-header-title">Green Map</h1>
        </div>
        <p className="page-header-desc">
          Search any city to view real-time CO&#8322; levels, air quality, and AI-powered tree planting suggestions.
        </p>
      </div>

      <div className="relative mb-6" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neu-text-muted" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search for a city (e.g. Delhi, London, Tokyo...)"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">{loading ? "Analyzing..." : "Search"}</span>
          </button>
        </form>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-neu-bg rounded-2xl shadow-neu-raised-lg overflow-hidden animate-fade-in-down">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-3 hover:shadow-neu-pressed-sm transition-all flex items-center gap-3 border-b border-neu-shadow-dark/10 last:border-0"
                onClick={() => handleSelectCity(s.name, s.lat, s.lng)}
              >
                <MapPin className="w-4 h-4 text-neu-text-muted flex-shrink-0" />
                <span className="text-sm text-neu-text font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text={`Fetching air quality data... ${progress}%`} progress={progress} />}

      {!loading && !hasSearched && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-4 shadow-neu-pressed">
            <Satellite className="w-8 h-8 text-neu-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-neu-text-muted mb-2 tracking-tight">Search a city to get started</h3>
          <p className="text-sm text-neu-text-muted max-w-lg mx-auto leading-relaxed">
            Enter any city name above to view its CO&#8322; concentration levels, air quality index, and personalized tree planting recommendations.
          </p>
        </div>
      )}

      {!loading && hasSearched && !airData && (
        <div className="card text-center py-12">
          <div className="w-14 h-14 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-3 shadow-neu-pressed-sm">
            <MapPin className="w-7 h-7 text-neu-text-muted" />
          </div>
          <p className="text-neu-text-secondary font-medium">No data found for this city. Try another search.</p>
        </div>
      )}

      {airData && !loading && (
        <div className="animate-fade-in">
          <div className="card overflow-hidden !p-0" style={{ height: "500px" }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFlyTo center={mapCenter} />
              {airData.zones.map((zone, i) => (
                <CircleMarker
                  key={i}
                  center={[zone.lat, zone.lng]}
                  radius={zone.status === "critical" ? 14 : zone.status === "moderate" ? 11 : 9}
                  fillColor={getMarkerColor(zone.status)}
                  color={getMarkerColor(zone.status)}
                  weight={2}
                  opacity={0.9}
                  fillOpacity={0.5}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold text-gray-900">{zone.name}</div>
                      <div className="mt-1">CO&#8322;: <span className="font-semibold">{zone.co2} ppm</span></div>
                      <div>AQI: <span className="font-semibold">{zone.aqi}</span> ({getAqiLabel(zone.aqi)})</div>
                      <div className="mt-1">
                        Status: <span className="font-semibold" style={{ color: getMarkerColor(zone.status) }}>
                          {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-neu-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block shadow-neu-raised-sm"></span> Low CO&#8322;
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block shadow-neu-raised-sm"></span> Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-neu-raised-sm"></span> Critical
            </span>
            <span className="ml-auto italic text-neu-text-muted">
              {airData.source === "live" ? "Live data (WAQI)" : "Simulated data"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="card flex flex-col">
              <h3 className="font-bold text-neu-text mb-3 flex items-center gap-2 tracking-tight text-sm">
                <div className="w-7 h-7 bg-neu-bg rounded-full flex items-center justify-center flex-shrink-0 shadow-neu-pressed-sm">
                  <Wind className="w-3.5 h-3.5 text-blue-500" />
                </div>
                {airData.city} Air Summary
              </h3>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between p-3 bg-neu-bg rounded-2xl shadow-neu-pressed-sm">
                  <span className="text-sm text-neu-text-secondary">Avg CO&#8322;</span>
                  <span className={`text-lg font-bold tracking-tight ${getCO2Label(airData.avgCO2) === "Critical" ? "text-red-600" : getCO2Label(airData.avgCO2) === "Moderate" ? "text-yellow-600" : "text-green-600"}`}>
                    {airData.avgCO2} ppm
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neu-bg rounded-2xl shadow-neu-pressed-sm">
                  <span className="text-sm text-neu-text-secondary">Avg AQI</span>
                  <span className={`text-lg font-bold tracking-tight ${airData.avgAqi > 100 ? "text-red-600" : airData.avgAqi > 50 ? "text-yellow-600" : "text-green-600"}`}>
                    {airData.avgAqi}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neu-bg rounded-2xl shadow-neu-pressed-sm">
                  <span className="text-sm text-neu-text-secondary">Zones Monitored</span>
                  <span className="text-lg font-bold text-neu-text tracking-tight">{airData.zones.length}</span>
                </div>
              </div>
            </div>

            {criticalZones.length > 0 && (
              <div className="card bg-neu-red-light/50 flex flex-col">
                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2 text-sm tracking-tight">
                  <div className="w-7 h-7 bg-neu-bg rounded-full flex items-center justify-center flex-shrink-0 shadow-neu-pressed-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  Critical Zones Detected
                </h3>
                <div className="space-y-2 mb-3 flex-1">
                  {criticalZones.map((z, i) => (
                    <div key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>
                        <strong>{z.name}</strong> &mdash; {z.co2} ppm CO&#8322;, AQI {z.aqi}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-neu-bg rounded-2xl p-3 shadow-neu-pressed-sm mt-auto">
                  <p className="text-sm text-red-800 font-semibold">
                    Immediate tree plantation recommended in {criticalZones.length} zone{criticalZones.length > 1 ? "s" : ""}!
                  </p>
                </div>
              </div>
            )}

            <div className="card bg-neu-accent/10 flex flex-col">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2 text-sm tracking-tight">
                <div className="w-7 h-7 bg-neu-bg rounded-full flex items-center justify-center flex-shrink-0 shadow-neu-pressed-sm">
                  <TreePine className="w-3.5 h-3.5 text-green-700" />
                </div>
                Planting Target
              </h3>
              <p className="text-sm text-green-700 mb-2 leading-relaxed flex-1">
                To offset emissions in critical zones, sponsor or plant approximately:
              </p>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-green-900 mb-2 tracking-tight">
                  ~{treesNeeded.toLocaleString()} trees
                </div>
                <p className="text-xs text-green-600 leading-relaxed">
                  Based on CO&#8322; excess above 400 ppm threshold across {criticalZones.length} critical zone{criticalZones.length > 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            <div className="card flex flex-col">
              <h3 className="font-bold text-neu-text mb-2 text-sm tracking-tight">Zone Breakdown</h3>
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {airData.zones.map((z, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-neu-raised-sm" style={{ backgroundColor: getMarkerColor(z.status) }}></span>
                    <span className="flex-1 text-neu-text-secondary truncate font-medium">{z.name}</span>
                    <span className="text-neu-text-muted">{z.co2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
