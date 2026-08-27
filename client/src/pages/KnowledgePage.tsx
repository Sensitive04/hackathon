import { useState, useMemo } from "react";
import {
  BookOpen,
  Thermometer,
  Wind,
  TreePine,
  MapPin,
  Info,
} from "lucide-react";
import EcoChatBot from "../components/chat/EcoChatBot";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getMetrics(pollution: number, years: number) {
  const severity = pollution / 100;
  const timeFactor = years / 100;
  const combined = clamp(severity * (0.3 + 0.7 * timeFactor), 0, 1);

  const tempIncrease = clamp(combined * 8.5, 0, 8.5);
  const aqi = Math.round(clamp(20 + combined * 480, 20, 500));
  const forestLoss = clamp(combined * 92, 0, 92);
  const habitableArea = clamp(100 - combined * 75, 25, 100);

  return {
    tempIncrease: Math.round(tempIncrease * 10) / 10,
    aqi,
    forestLoss: Math.round(forestLoss * 10) / 10,
    habitableArea: Math.round(habitableArea * 10) / 10,
    combined,
  };
}

function getTier(pollution: number) {
  if (pollution <= 20) return "healthy";
  if (pollution <= 50) return "caution";
  if (pollution <= 80) return "danger";
  return "critical";
}

function getNarrative(pollution: number, years: number) {
  const tier = getTier(pollution);
  const m = getMetrics(pollution, years);

  if (tier === "healthy") {
    return `At ${pollution}% pollution intensity over ${years} year${years > 1 ? "s" : ""}, Earth remains largely pristine. Forests thrive, oceans stay clear, and air quality is excellent (AQI ${m.aqi}). Global temperature rises only ${m.tempIncrease}°C above baseline.`;
  }
  if (tier === "caution") {
    return `At ${pollution}% pollution intensity over ${years} year${years > 1 ? "s" : ""}, early signs of strain appear. ${m.forestLoss}% of forests have declined, cities experience periodic haze, and AQI reaches ${m.aqi}. Temperature rises ${m.tempIncrease}°C, threatening sensitive ecosystems.`;
  }
  if (tier === "danger") {
    return `At ${pollution}% pollution intensity over ${years} year${years > 1 ? "s" : ""}, severe environmental degradation is widespread. ${m.forestLoss}% of forests are lost, rivers dry up, and AQI hits ${m.aqi} — unhealthy for all populations. Only ${m.habitableArea}% of land remains comfortably habitable.`;
  }
  return `At ${pollution}% pollution intensity over ${years} year${years > 1 ? "s" : ""}, Earth faces an apocalyptic scenario. ${m.forestLoss}% of forests are gone, AQI reaches a hazardous ${m.aqi}, and temperatures surge ${m.tempIncrease}°C. Only ${m.habitableArea}% of land remains habitable, with toxic skies covering most of the planet.`;
}

function EarthCanvas({ pollution, years }: { pollution: number; years: number }) {
  const m = getMetrics(pollution, years);
  const tier = getTier(pollution);

  const skyColors = {
    healthy: ["#87CEEB", "#4DA6FF", "#2196F3"],
    caution: ["#B0C4A0", "#A8B890", "#8FA870"],
    danger: ["#8B7355", "#6B5B45", "#4A3B25"],
    critical: ["#2A1A0A", "#1A0A00", "#0A0000"],
  };

  const landColors = {
    healthy: "#228B22",
    caution: "#8B8B3A",
    danger: "#8B6914",
    critical: "#3A2A1A",
  };

  const oceanColors = {
    healthy: "#1E90FF",
    caution: "#6B8E6B",
    danger: "#5C4033",
    critical: "#1A0A00",
  };

  const colors = skyColors[tier];
  const treeCount = tier === "healthy" ? 14 : tier === "caution" ? 9 : tier === "danger" ? 4 : 1;
  const hasSmog = pollution > 30;
  const smogOpacity = clamp((pollution - 30) / 70, 0, 0.7);
  const particleCount = Math.floor(clamp(pollution / 5, 0, 20));

  return (
    <div className="relative w-full aspect-square max-w-[380px] mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors[1]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors[2]} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="skyGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="60%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </radialGradient>
          <clipPath id="earthClip">
            <circle cx="200" cy="200" r="170" />
          </clipPath>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow */}
        <circle cx="200" cy="200" r="190" fill="url(#earthGlow)" />

        {/* Earth sphere */}
        <circle cx="200" cy="200" r="170" fill="url(#skyGrad)" filter="url(#glow)" />

        <g clipPath="url(#earthClip)">
          {/* Ocean */}
          <ellipse cx="200" cy="260" rx="220" ry="100" fill={oceanColors[tier]} opacity="0.9" />
          <ellipse cx="120" cy="280" rx="140" ry="60" fill={oceanColors[tier]} opacity="0.6" />

          {/* Landmass */}
          <path
            d="M60,200 Q80,150 140,140 Q180,130 220,150 Q270,170 300,140 Q340,120 360,160 Q380,200 360,230 Q340,260 300,250 Q260,240 220,260 Q180,280 140,260 Q100,240 60,200Z"
            fill={landColors[tier]}
            opacity="0.85"
          />

          {/* Second landmass */}
          <path
            d="M280,300 Q310,280 350,290 Q380,300 370,330 Q360,360 320,350 Q290,340 280,300Z"
            fill={landColors[tier]}
            opacity="0.7"
          />

          {/* Trees */}
          {Array.from({ length: treeCount }).map((_, i) => {
            const tx = 90 + i * 18;
            const ty = 175 + Math.sin(i * 1.8) * 15;
            return (
              <g key={`tree-${i}`} transform={`translate(${tx},${ty})`}>
                <rect x="-1" y="0" width="2" height="6" fill="#5C3A1E" rx="1" />
                <circle cx="0" cy="-2" r={5 + Math.sin(i) * 1.5} fill={tier === "caution" ? "#6B8B3A" : "#2E8B2E"} opacity="0.9" />
              </g>
            );
          })}

          {/* Deforested patches */}
          {(tier === "danger" || tier === "critical") &&
            Array.from({ length: 6 }).map((_, i) => (
              <ellipse
                key={`barren-${i}`}
                cx={100 + i * 40}
                cy={190 + Math.sin(i * 2) * 12}
                rx="8"
                ry="4"
                fill="#5A4020"
                opacity="0.5"
              />
            ))}

          {/* Rivers (only for healthy/caution) */}
          {tier !== "critical" && (
            <path
              d={`M160,160 Q180,${tier === "healthy" ? "190" : "185"} 200,${tier === "healthy" ? "210" : "205"} Q220,${tier === "healthy" ? "230" : "220"} 240,${tier === "healthy" ? "250" : "240"}`}
              stroke={tier === "healthy" ? "#4FC3F7" : "#7A8A6A"}
              strokeWidth={tier === "healthy" ? "3" : "2"}
              fill="none"
              opacity="0.6"
              strokeLinecap="round"
            />
          )}

          {/* Smog / haze overlay */}
          {hasSmog && (
            <rect
              x="30"
              y="30"
              width="340"
              height="340"
              fill={tier === "critical" ? "#1A0A00" : "#8B7355"}
              opacity={smogOpacity}
            />
          )}

          {/* Smoke particles */}
          {Array.from({ length: particleCount }).map((_, i) => {
            const px = 60 + (i * 37) % 280;
            const py = 80 + (i * 53) % 240;
            const pr = 2 + (i % 4);
            return (
              <circle
                key={`particle-${i}`}
                cx={px}
                cy={py}
                r={pr}
                fill={tier === "critical" ? "#FF4500" : "#8B7355"}
                opacity={0.3 + (i % 3) * 0.1}
              />
            );
          })}

          {/* Industrial smokestacks (for danger/critical) */}
          {(tier === "danger" || tier === "critical") && (
            <>
              <rect x="270" y="130" width="6" height="25" fill="#4A3A2A" rx="1" />
              <rect x="285" y="120" width="5" height="30" fill="#3A2A1A" rx="1" />
              <circle cx="273" cy="122" r="5" fill="#6B5B45" opacity="0.4" />
              <circle cx="287" cy="112" r="6" fill="#5A4A3A" opacity="0.3" />
            </>
          )}

          {/* Heat shimmer for critical */}
          {tier === "critical" && (
            <>
              <circle cx="200" cy="180" r="40" fill="#FF4500" opacity="0.1" />
              <circle cx="150" cy="210" r="30" fill="#FF6347" opacity="0.08" />
            </>
          )}
        </g>

        {/* Atmosphere ring */}
        <circle
          cx="200"
          cy="200"
          r="172"
          fill="none"
          stroke={tier === "healthy" ? "#87CEEB" : tier === "caution" ? "#A0B080" : "#5A3A1A"}
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Atmosphere haze for high pollution */}
        {pollution > 50 && (
          <circle
            cx="200"
            cy="200"
            r="178"
            fill="none"
            stroke="#FF4500"
            strokeWidth="3"
            opacity={clamp((pollution - 50) / 100, 0, 0.35)}
          />
        )}
      </svg>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-neu-bg shadow-neu-raised-sm transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-neu-pressed-sm ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-neu-text-muted uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-lg font-bold text-neu-text tabular-nums leading-tight">
          {value}
          <span className="text-xs font-medium text-neu-text-muted ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function getAqiLabel(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getAqiColor(aqi: number) {
  if (aqi <= 50) return "bg-green-500/15 text-green-700";
  if (aqi <= 100) return "bg-yellow-500/15 text-yellow-700";
  if (aqi <= 150) return "bg-orange-500/15 text-orange-700";
  if (aqi <= 200) return "bg-red-500/15 text-red-700";
  return "bg-purple-500/15 text-purple-700";
}

export default function KnowledgePage() {
  const [pollution, setPollution] = useState(15);
  const [years, setYears] = useState(10);

  const metrics = useMemo(() => getMetrics(pollution, years), [pollution, years]);
  const narrative = useMemo(() => getNarrative(pollution, years), [pollution, years]);
  const tier = getTier(pollution);

  const tierLabels = {
    healthy: "Pristine",
    caution: "Stressed",
    danger: "Critical",
    critical: "Collapsing",
  };

  const tierColors = {
    healthy: "text-green-600 bg-green-500/10",
    caution: "text-yellow-600 bg-yellow-500/10",
    danger: "text-orange-600 bg-orange-500/10",
    critical: "text-red-600 bg-red-500/10",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon">
            <BookOpen className="w-5 h-5 text-eco-primary" />
          </div>
          <h1 className="page-header-title">Environmental Knowledge</h1>
        </div>
        <p className="page-header-desc">
          Explore how pollution and time shape Earth's future. Adjust the sliders to simulate environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left column: Sliders + Narrative */}
        <div className="space-y-5">
          {/* Pollution slider */}
          <div className="card">
            <label className="label">
              Pollution Factors Intensity (Traffic, Air Conditioning, Industrial Waste)
            </label>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs font-semibold text-green-600 w-16 text-center leading-tight">
                Clean
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pollution}
                  onChange={(e) => setPollution(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${20 - pollution / 5}%, #eab308 ${50 - pollution / 5}%, #f97316 ${80 - pollution / 5}%, #ef4444 100%)`,
                  }}
                />
                <div
                  className="absolute -top-8 text-xs font-bold text-neu-text bg-neu-bg shadow-neu-raised-sm px-2 py-0.5 rounded-lg"
                  style={{ left: `calc(${pollution}% - 16px)`, transition: "left 0.1s" }}
                >
                  {pollution}%
                </div>
              </div>
              <span className="text-xs font-semibold text-red-600 w-16 text-center leading-tight">
                Severe
              </span>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-neu-text-muted font-medium">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Years slider */}
          <div className="card">
            <label className="label">Time Horizon (Years)</label>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs font-semibold text-neu-text-muted w-10 text-right">
                1yr
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-neu-shadow-dark/20"
                />
                <div
                  className="absolute -top-8 text-xs font-bold text-neu-text bg-neu-bg shadow-neu-raised-sm px-2 py-0.5 rounded-lg"
                  style={{ left: `calc(${((years - 1) / 99) * 100}% - 14px)`, transition: "left 0.1s" }}
                >
                  {years}y
                </div>
              </div>
              <span className="text-xs font-semibold text-neu-text-muted w-10 text-center">
                100yr
              </span>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-neu-text-muted font-medium">
              <span>1</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-center gap-3">
            <div className={`px-4 py-2 rounded-2xl shadow-neu-pressed-sm text-sm font-bold ${tierColors[tier]}`}>
              Earth Status: {tierLabels[tier]}
            </div>
          </div>

          {/* Narrative */}
          <div className="card bg-neu-bg shadow-neu-pressed-sm">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-eco-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-neu-text-muted uppercase tracking-wider mb-1.5">
                  Impact Summary
                </p>
                <p className="text-sm text-neu-text-secondary leading-relaxed">
                  {narrative}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center column: Earth visualizer */}
        <div className="flex flex-col items-center">
          <div className="w-full card flex items-center justify-center py-8">
            <EarthCanvas pollution={pollution} years={years} />
          </div>
          <p className="text-xs text-neu-text-muted mt-3 text-center font-medium">
            Interactive visualization based on current slider values
          </p>
        </div>

        {/* Right column: Metrics dashboard */}
        <div className="space-y-3">
          <div className="card mb-4">
            <h3 className="text-sm font-bold text-neu-text tracking-tight mb-1">
              Live Impact Metrics
            </h3>
            <p className="text-xs text-neu-text-muted">
              Real-time calculations based on pollution rate and time horizon
            </p>
          </div>

          <MetricCard
            icon={<Thermometer className="w-4 h-4 text-red-500" />}
            label="Global Temperature Increase"
            value={`+${metrics.tempIncrease}`}
            unit="°C"
            color="bg-red-500/10"
          />

          <MetricCard
            icon={<Wind className="w-4 h-4 text-orange-500" />}
            label="Air Quality Index"
            value={metrics.aqi}
            unit={getAqiLabel(metrics.aqi)}
            color="bg-orange-500/10"
          />

          <MetricCard
            icon={<TreePine className="w-4 h-4 text-green-600" />}
            label="Forest Loss"
            value={metrics.forestLoss}
            unit="%"
            color="bg-green-500/10"
          />

          <MetricCard
            icon={<MapPin className="w-4 h-4 text-blue-500" />}
            label="Remaining Habitable Area"
            value={metrics.habitableArea}
            unit="%"
            color="bg-blue-500/10"
          />

          {/* AQI color bar */}
          <div className="card mt-2">
            <p className="text-[11px] font-bold text-neu-text-muted uppercase tracking-wider mb-2">
              AQI Breakdown
            </p>
            <div className="h-3 rounded-full overflow-hidden flex shadow-neu-pressed-sm">
              <div className="bg-green-500 flex-1 transition-all duration-300" style={{ opacity: metrics.aqi <= 50 ? 1 : 0.3 }} />
              <div className="bg-yellow-400 flex-1 transition-all duration-300" style={{ opacity: metrics.aqi > 50 && metrics.aqi <= 100 ? 1 : 0.3 }} />
              <div className="bg-orange-500 flex-1 transition-all duration-300" style={{ opacity: metrics.aqi > 100 && metrics.aqi <= 150 ? 1 : 0.3 }} />
              <div className="bg-red-500 flex-1 transition-all duration-300" style={{ opacity: metrics.aqi > 150 && metrics.aqi <= 200 ? 1 : 0.3 }} />
              <div className="bg-purple-600 flex-1 transition-all duration-300" style={{ opacity: metrics.aqi > 200 && metrics.aqi <= 300 ? 1 : 0.3 }} />
              <div className="bg-maroon-700 flex-1 transition-all duration-300" style={{ opacity: metrics.aqi > 300 ? 1 : 0.3 }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] text-neu-text-muted font-medium">
              <span>Good</span>
              <span>Moderate</span>
              <span>USG</span>
              <span>Unhealthy</span>
              <span>V.Unhealthy</span>
              <span>Hazardous</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-xl shadow-neu-pressed-sm ${getAqiColor(metrics.aqi)}`}>
                AQI {metrics.aqi} — {getAqiLabel(metrics.aqi)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <EcoChatBot />
    </div>
  );
}
