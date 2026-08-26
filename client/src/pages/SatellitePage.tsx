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

export default function SatellitePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [airData, setAirData] = useState<CityAirData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    try {
      const data = await getCityAirData(name, lat, lng);
      setAirData(data);
    } catch {
      setAirData(null);
    } finally {
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Satellite className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Green Map</h1>
        </div>
        <p className="text-gray-500">
          Search any city to view real-time CO&#8322; levels, air quality, and AI-powered tree planting suggestions.
        </p>
      </div>

      <div className="relative mb-6" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search for a city (e.g. Delhi, London, Tokyo...)"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Search"}
          </button>
        </form>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-3"
                onClick={() => handleSelectCity(s.name, s.lat, s.lng)}
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Fetching air quality data..." />}

      {!loading && !hasSearched && (
        <div className="card text-center py-16">
          <Satellite className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">Search a city to get started</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Enter any city name above to view its CO&#8322; concentration levels, air quality index, and personalized tree planting recommendations.
          </p>
        </div>
      )}

      {!loading && hasSearched && !airData && (
        <div className="card text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No data found for this city. Try another search.</p>
        </div>
      )}

      {airData && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card overflow-hidden" style={{ height: "500px" }}>
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
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Low CO&#8322;
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Moderate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Critical
              </span>
              <span className="ml-auto italic">
                {airData.source === "live" ? "Live data (WAQI)" : "Simulated data"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-500" />
                {airData.city} Air Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Avg CO&#8322;</span>
                  <span className={`text-lg font-bold ${getCO2Label(airData.avgCO2) === "Critical" ? "text-red-600" : getCO2Label(airData.avgCO2) === "Moderate" ? "text-yellow-600" : "text-green-600"}`}>
                    {airData.avgCO2} ppm
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Avg AQI</span>
                  <span className={`text-lg font-bold ${airData.avgAqi > 100 ? "text-red-600" : airData.avgAqi > 50 ? "text-yellow-600" : "text-green-600"}`}>
                    {airData.avgAqi}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Zones Monitored</span>
                  <span className="text-lg font-bold text-gray-900">{airData.zones.length}</span>
                </div>
              </div>
            </div>

            {criticalZones.length > 0 && (
              <div className="card bg-red-50 border-red-200">
                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Zones Detected
                </h3>
                <div className="space-y-2 mb-3">
                  {criticalZones.map((z, i) => (
                    <div key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>
                        <strong>{z.name}</strong> &mdash; {z.co2} ppm CO&#8322;, AQI {z.aqi}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-3 border border-red-200">
                  <p className="text-sm text-red-800 font-medium">
                    Immediate tree plantation recommended in {criticalZones.length} zone{criticalZones.length > 1 ? "s" : ""}!
                  </p>
                </div>
              </div>
            )}

            <div className="card bg-green-50 border-green-200">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <TreePine className="w-4 h-4" />
                Planting Target
              </h3>
              <p className="text-sm text-green-700 mb-2">
                To offset emissions in critical zones, sponsor or plant approximately:
              </p>
              <div className="text-3xl font-bold text-green-900 mb-2">
                ~{treesNeeded.toLocaleString()} trees
              </div>
              <p className="text-xs text-green-600">
                Based on CO&#8322; excess above 400 ppm threshold across {criticalZones.length} critical zone{criticalZones.length > 1 ? "s" : ""}.
              </p>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Zone Breakdown</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {airData.zones.map((z, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getMarkerColor(z.status) }}></span>
                    <span className="flex-1 text-gray-700 truncate">{z.name}</span>
                    <span className="text-gray-500">{z.co2}</span>
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
