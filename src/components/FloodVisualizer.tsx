import React, { useState } from 'react';
import { RiverBasin, SafeShelter, Settlement, EvacuationRoute } from '../types/flood';
import { Waves, AlertTriangle, Shield, Navigation, Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface FloodVisualizerProps {
  basin: RiverBasin;
  currentWaterLevel: number;
  onSetWaterLevel: (level: number) => void;
  settlement: Settlement;
  shelter: SafeShelter;
  route: EvacuationRoute;
  forceBlockBridge: boolean;
  onToggleForceBlockBridge: () => void;
  language: 'en' | 'ne';
}

export const FloodVisualizer: React.FC<FloodVisualizerProps> = ({
  basin,
  currentWaterLevel,
  onSetWaterLevel,
  settlement,
  shelter,
  route,
  forceBlockBridge,
  onToggleForceBlockBridge,
  language,
}) => {
  const isNepali = language === 'ne';

  // Layer toggles
  const [showInundation, setShowInundation] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Dynamic calculation of flood expansion factor
  const floodOverDanger = Math.max(0, currentWaterLevel - 7.5);
  const floodSpreadMultiplier = 1 + floodOverDanger * 0.35;

  const isBridgeSubmerged = currentWaterLevel >= 8.4 || forceBlockBridge;

  return (
    <div id="visualizer" className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
      {/* Visualizer Control Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-900/40 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {isNepali ? 'भौगोलिक बाढी सिमुलेटर र नक्सा दृश्य' : 'Hydrological Flood Inundation & Terrain Visualizer'}
            </h3>
            <p className="text-xs text-slate-400">
              {isNepali
                ? 'नदीको बहाव, डुबान क्षेत्र, सडक नेटवर्क र सुरक्षित आश्रय मार्गको प्रत्यक्ष चित्रण'
                : 'Interactive vector basin projection with dynamic water surge, submerged roads, and levee bunds'}
            </p>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setShowInundation(!showInundation)}
            className={`px-2.5 py-1 rounded transition-colors ${
              showInundation ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isNepali ? 'डुबान क्षेत्र' : 'Flood Heatmap'}
          </button>
          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-2.5 py-1 rounded transition-colors ${
              showRoads ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isNepali ? 'सडक र बाँध' : 'Roads & Bunds'}
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1 rounded transition-colors ${
              showShelters ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isNepali ? 'सुरक्षित आश्रय' : 'Shelters'}
          </button>
          <button
            onClick={() => setShowContours(!showContours)}
            className={`px-2.5 py-1 rounded transition-colors ${
              showContours ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isNepali ? 'उचाई' : 'Elevation'}
          </button>
        </div>
      </div>

      {/* Main SVG Vector Stage */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-[#070b13] overflow-hidden select-none">
        {/* Coordinate Compass HUD */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1 text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>KOSHI RIVER BASIN SECTOR · 26.545° N, 86.925° E</span>
          </div>
          <div>DATUM: WGS84 · ELEVATION RANGE: 72m – 96m MSL</div>
          <div>SURFACE VELOCITY: 3.4 m/s · DISCHARGE: {basin.dischargeCusecs.toLocaleString()} CUSECS</div>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span>ROUTE STATUS:</span>
            {route.isHampered ? (
              <span className="text-rose-400 font-bold">HAMPERED (REROUTED TO HIGH BUND)</span>
            ) : (
              <span className="text-emerald-400 font-bold">DIRECT LOWLAND PATH PASSABLE</span>
            )}
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-wrap gap-2 text-[10px] font-mono text-slate-300 bg-slate-950/85 p-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600/80 border border-rose-400" />
            <span>Deep Flood (&gt;1.5m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/70 border border-amber-400" />
            <span>Moderate (0.5m-1.2m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 border border-cyan-300" />
            <span>High Flood Bund Levee (+12m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Safe Shelter</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* SVG Drawing Canvas */}
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>

            {/* River Gradient */}
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0369a1" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.9" />
            </linearGradient>

            {/* Inundation Deep Gradient */}
            <radialGradient id="inundationDeep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
            </radialGradient>

            {/* Inundation Moderate Gradient */}
            <radialGradient id="inundationModerate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>

            {/* Hazard Stripe Pattern */}
            <pattern id="hazardStripesSvg" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="20" fill="#dc2626" />
              <rect x="10" width="10" height="20" fill="#450a0a" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="600" fill="#060911" />
          <rect width="1000" height="600" fill="url(#gridPattern)" />

          {/* Elevation Contours */}
          {showContours && (
            <g opacity="0.35" stroke="#334155" strokeWidth="1" fill="none">
              {/* 74m contour */}
              <path d="M 50,450 Q 250,400 480,470 T 950,480" />
              {/* 78m contour */}
              <path d="M 50,340 Q 300,280 520,330 T 950,340" />
              {/* 84m contour */}
              <path d="M 50,220 Q 280,180 500,210 T 950,220" />
              {/* 88m contour */}
              <path d="M 50,110 Q 320,80 540,100 T 950,110" />
              {/* 92m high ridge */}
              <path d="M 50,40 Q 350,20 600,40 T 950,50" />
            </g>
          )}

          {/* MAIN RIVER CHANNEL (Sapta Koshi River) */}
          {/* River flow running from North-East across the East-Central flank */}
          <path
            d="M 680,0 Q 640,150 670,300 T 780,600 L 920,600 Q 820,320 800,160 T 840,0 Z"
            fill="url(#riverGradient)"
          />
          {/* Animated Flow Current Lines */}
          <path
            d="M 720,10 Q 680,150 710,300 T 820,590"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            className="river-current"
          />
          <path
            d="M 760,20 Q 720,160 740,310 T 850,590"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="2.5"
            className="river-current-slow"
          />
          <path
            d="M 800,10 Q 760,150 770,300 T 880,590"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="2"
            className="river-current"
          />

          {/* Tributary: Khadak Khola (Crosses from West to East toward Koshi) */}
          <path
            d="M 100,380 Q 280,360 480,350 T 700,320 L 710,355 Q 500,385 300,395 T 100,410 Z"
            fill="#0369a1"
            opacity="0.85"
          />
          <path
            d="M 120,395 Q 300,375 500,365 T 700,335"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            className="river-current"
          />

          {/* DYNAMIC INUNDATION FLOOD ZONES (Expands with water level) */}
          {showInundation && (
            <g className="transition-all duration-700 ease-in-out">
              {/* Warning Catchment (Outer Shallow Water) */}
              <ellipse
                cx="520"
                cy="360"
                rx={180 * floodSpreadMultiplier}
                ry={90 * floodSpreadMultiplier}
                fill="url(#inundationModerate)"
                opacity="0.5"
              />
              <ellipse
                cx="380"
                cy="420"
                rx={140 * floodSpreadMultiplier}
                ry={70 * floodSpreadMultiplier}
                fill="url(#inundationModerate)"
                opacity="0.4"
              />

              {/* Moderate Inundation Layer */}
              {currentWaterLevel >= 8.0 && (
                <ellipse
                  cx="500"
                  cy="355"
                  rx={130 * floodSpreadMultiplier}
                  ry={65 * floodSpreadMultiplier}
                  fill="url(#inundationModerate)"
                  opacity="0.8"
                />
              )}

              {/* Deep Submergence Torrent Layer (>1.5m depth / High Danger) */}
              {currentWaterLevel >= 8.4 && (
                <ellipse
                  cx="480"
                  cy="355"
                  rx={95 * floodSpreadMultiplier}
                  ry={45 * floodSpreadMultiplier}
                  fill="url(#inundationDeep)"
                  className="water-pulse"
                />
              )}
            </g>
          )}

          {/* ROAD NETWORK & LEVEE INFRASTRUCTURE */}
          {showRoads && (
            <g>
              {/* PRIMARY LOWLAND ROAD (Tilathi -> Bazaar -> Causeway Bridge -> North Arterial) */}
              {/* Segment 1: Tilathi (240, 480) -> Bazaar (340, 420) */}
              <line x1="240" y1="480" x2="340" y2="420" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

              {/* Segment 2: Bazaar (340, 420) -> Low Bridge over Khadak Stream (480, 360) */}
              <line
                x1="340"
                y1="420"
                x2="480"
                y2="360"
                stroke={isBridgeSubmerged ? '#dc2626' : '#64748b'}
                strokeWidth={isBridgeSubmerged ? '6' : '4'}
                strokeDasharray={isBridgeSubmerged ? '6 4' : 'none'}
                strokeLinecap="round"
              />

              {/* Segment 3: Bridge (480, 360) -> North Arterial (520, 240) */}
              <line
                x1="480"
                y1="360"
                x2="520"
                y2="240"
                stroke={isBridgeSubmerged ? '#dc2626' : '#64748b'}
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Segment 4: North Arterial (520, 240) -> Kankalini Safe Shelter (420, 90) */}
              <line x1="520" y1="240" x2="420" y2="90" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

              {/* HIGH FLOOD PROTECTION BUND / LEVEE (The Safe High Route!) */}
              {/* Embankment Ramp: Tilathi (240, 480) -> West Levee Ramp (130, 450) */}
              <line x1="240" y1="480" x2="130" y2="450" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />

              {/* Main Reinforced High Bund Ridge: (130, 450) -> (140, 240) -> (180, 120) */}
              <path
                d="M 130,450 L 140,240 L 180,120"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Bund Northern Spur: (180, 120) -> Kankalini Shelter High Entrance (420, 90) */}
              <line x1="180" y1="120" x2="420" y2="90" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}

          {/* ACTIVE ROUTE HIGHLIGHT */}
          {route.isHampered ? (
            // HAMPERED STATE: Highlight the High Bund Alternative Route in Neon Amber/Cyan
            <g>
              <path
                d="M 240,480 L 130,450 L 140,240 L 180,120 L 420,90"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="5"
                strokeDasharray="10 6"
                className="river-current"
              />
              {/* Blocked Barrier Marker at the Submerged Low Bridge (480, 360) */}
              <g transform="translate(480, 360)">
                <circle r="22" fill="#ef4444" opacity="0.3" className="water-pulse" />
                <rect x="-18" y="-9" width="36" height="18" fill="url(#hazardStripesSvg)" rx="4" stroke="#fca5a5" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  BLOCKED
                </text>
              </g>
            </g>
          ) : (
            // NORMAL STATE: Highlight direct lowland route
            <g>
              <path
                d="M 240,480 L 340,420 L 480,360 L 520,240 L 420,90"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8 4"
              />
            </g>
          )}

          {/* MAP NODES & LABELS */}
          {/* Origin: Tilathi Settlement */}
          <g transform="translate(240, 480)" className="cursor-pointer">
            <circle r="14" fill="#3b82f6" opacity="0.25" className="water-pulse" />
            <circle r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <text x="14" y="4" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              Tilathi Lowland (Ward 3)
            </text>
            <text x="14" y="18" fill="#93c5fd" fontSize="10" fontFamily="monospace">
              Elev: 74.2m · Origin
            </text>
          </g>

          {/* Bridge Crossing Node */}
          <g transform="translate(480, 360)">
            <circle r="6" fill={isBridgeSubmerged ? '#ef4444' : '#64748b'} stroke="#ffffff" strokeWidth="1.5" />
            <text x="-10" y="-12" textAnchor="middle" fill={isBridgeSubmerged ? '#fca5a5' : '#cbd5e1'} fontSize="10" fontWeight="600">
              Khadak Low Bridge (75.5m)
            </text>
          </g>

          {/* High Bund Ridge Node */}
          <g transform="translate(140, 240)">
            <circle r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
            <text x="12" y="4" fill="#67e8f9" fontSize="10" fontWeight="600" fontFamily="sans-serif">
              Elevated Bund Crest (+12m)
            </text>
          </g>

          {/* Safe Shelter Destination: Shree Kankalini Elevated School */}
          {showShelters && (
            <g transform="translate(420, 90)" className="cursor-pointer">
              <circle r="22" fill="#10b981" opacity="0.25" className="water-pulse" />
              <circle r="10" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
              <text x="16" y="2" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                Shree Kankalini Elevated School (Safe Haven)
              </text>
              <text x="16" y="16" fill="#6ee7b7" fontSize="11" fontFamily="monospace">
                Elev: 89.5m (+15.3m above flood) · Capacity: 850
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Flood Simulator Controls Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Water Level Scrubber Slider */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                {isNepali ? 'पानीको सतह समायोजन (सिमुलेटर):' : 'Adjust Water Level (Monsoon Simulator):'}
              </span>
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {currentWaterLevel.toFixed(2)}m{' '}
                <span className="text-slate-400 text-xs">
                  ({(currentWaterLevel - basin.dangerLevelMeters).toFixed(2)}m relative to Danger Mark)
                </span>
              </span>
            </div>
            <input
              type="range"
              min={basin.normalLevelMeters}
              max={basin.dangerLevelMeters + 2.5}
              step={0.05}
              value={currentWaterLevel}
              onChange={(e) => onSetWaterLevel(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Normal ({basin.normalLevelMeters}m)</span>
              <span>Warning ({basin.warningLevelMeters}m)</span>
              <span className="text-amber-400">Bridge Floods (8.4m)</span>
              <span className="text-rose-400">Danger Mark ({basin.dangerLevelMeters}m)</span>
              <span>Max Surge (11.0m)</span>
            </div>
          </div>

          {/* Quick Simulation Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSetWaterLevel(Math.min(10.5, currentWaterLevel + 0.5))}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
            >
              +0.5m Surge
            </button>
            <button
              onClick={() => onSetWaterLevel(Math.min(10.8, currentWaterLevel + 1.5))}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800 transition-colors"
            >
              +1.5m Flash Torrent
            </button>
            <button
              onClick={onToggleForceBlockBridge}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                forceBlockBridge
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
            >
              {forceBlockBridge ? 'Obstacle Active (Washout)' : '⚠️ Wash Out Bridge'}
            </button>
            <button
              onClick={() => onSetWaterLevel(basin.normalLevelMeters + 0.4)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset Water Level to Normal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
