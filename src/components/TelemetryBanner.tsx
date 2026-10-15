import React from 'react';
import { RiverBasin, ThreatLevel } from '../types/flood';
import { AlertTriangle, Droplets, Gauge, Clock, CloudRain, ShieldCheck, Activity } from 'lucide-react';

interface TelemetryBannerProps {
  basins: RiverBasin[];
  selectedBasin: RiverBasin;
  onSelectBasin: (basin: RiverBasin) => void;
  currentWaterLevel: number;
  threatLevel: ThreatLevel;
  threatScore: number;
  language: 'en' | 'ne';
}

export const TelemetryBanner: React.FC<TelemetryBannerProps> = ({
  basins,
  selectedBasin,
  onSelectBasin,
  currentWaterLevel,
  threatLevel,
  threatScore,
  language,
}) => {
  const isNepali = language === 'ne';

  // Threat badge styling
  const threatConfig: Record<ThreatLevel, { bg: string; text: string; labelEn: string; labelNe: string; border: string }> = {
    CRITICAL: {
      bg: 'bg-rose-950/80',
      text: 'text-rose-400',
      labelEn: 'CRITICAL FLOOD SURGE · EVACUATION MANDATORY',
      labelNe: 'अति जोखिमपूर्ण बाढी · तत्काल सुरक्षित स्थान जानुहोस्',
      border: 'border-rose-500/50',
    },
    WARNING: {
      bg: 'bg-amber-950/80',
      text: 'text-amber-400',
      labelEn: 'WARNING TIER · RIVER ABOVE WARNING MARK',
      labelNe: 'चेतावनी विन्दु · नदी चेतावनी तहभन्दा माथि',
      border: 'border-amber-500/50',
    },
    ALERT: {
      bg: 'bg-yellow-950/80',
      text: 'text-yellow-400',
      labelEn: 'ALERT WATCH · RIVER LEVEL ELEVATED',
      labelNe: 'सतर्कता अवस्था · नदीको सतह बढ्दो',
      border: 'border-yellow-500/50',
    },
    NORMAL: {
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-400',
      labelEn: 'NORMAL FLOW · CONDITIONS STABLE',
      labelNe: 'सामान्य अवस्था · नदीको बहाव स्थिर',
      border: 'border-emerald-500/50',
    },
  };

  const currentThreat = threatConfig[threatLevel];
  const waterDifference = currentWaterLevel - selectedBasin.dangerLevelMeters;

  return (
    <section id="telemetry" className="border-b border-slate-800 bg-slate-900/60 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Basin Selection & Threat Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="basin-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              {isNepali ? 'नदी बेसिन छनोट:' : 'Active River Basin:'}
            </label>
            <select
              id="basin-select"
              value={selectedBasin.id}
              onChange={(e) => {
                const found = basins.find((b) => b.id === e.target.value);
                if (found) onSelectBasin(found);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-lg px-3.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 max-w-md cursor-pointer"
            >
              {basins.map((b) => (
                <option key={b.id} value={b.id}>
                  {isNepali ? b.nameNepali : b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Threat Status Pill-Free Bar */}
          <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border ${currentThreat.border} ${currentThreat.bg}`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${currentThreat.text}`} />
            <span className={`text-xs font-bold tracking-wide uppercase ${currentThreat.text}`}>
              {isNepali ? currentThreat.labelNe : currentThreat.labelEn}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (Threat Index: <strong className="text-white">{threatScore}%</strong>)
            </span>
          </div>
        </div>

        {/* Real-Time Hydrology Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Metric 1: River Water Level */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {isNepali ? 'हालको पानीको सतह' : 'River Water Level'}
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {currentWaterLevel.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-1.5 uppercase">Meters</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Danger Mark: <span className="text-rose-400 font-mono font-medium">{selectedBasin.dangerLevelMeters}m</span>
            </div>
          </div>

          {/* Metric 2: Rate of Rise */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {isNepali ? 'सतह वृद्धि दर' : 'Rate of Rise'}
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                +{selectedBasin.rateOfRiseCmHr.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-1.5 uppercase">cm/hr</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {waterDifference > 0 ? (
                <span className="text-rose-400 font-medium">+{waterDifference.toFixed(2)}m above danger</span>
              ) : (
                <span className="text-emerald-400 font-medium">{Math.abs(waterDifference).toFixed(2)}m below danger</span>
              )}
            </div>
          </div>

          {/* Metric 3: 24h Rainfall */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {isNepali ? '२४ घण्टाको वर्षा' : '24h Basin Rainfall'}
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                {selectedBasin.rainfall24hMm.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-1.5 uppercase">mm</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Upstream Catchment Runoff
            </div>
          </div>

          {/* Metric 4: River Discharge */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {isNepali ? 'पानीको बहाव (डिस्चार्ज)' : 'Discharge Flow'}
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
                {(selectedBasin.dischargeCusecs / 1000).toFixed(0)}k
              </span>
              <span className="text-xs font-mono text-slate-400 ml-1.5 uppercase">cusecs</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              High Velocity Torrent
            </div>
          </div>

          {/* Metric 5: Barrage Sluice Gates */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {isNepali ? 'ब्यारेजका ढोकाहरू' : 'Barrage Sluice Gates'}
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {selectedBasin.barrageGatesOpen}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-1.5 uppercase">
                / {selectedBasin.totalBarrageGates > 0 ? selectedBasin.totalBarrageGates : 'N/A'} open
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {selectedBasin.barrageGatesOpen > 40 ? 'Maximum discharge' : 'Regulated flow'}
            </div>
          </div>

          {/* Metric 6: Time to Peak Crest */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {isNepali ? 'उच्च बाढी आउने समय' : 'Time To Flood Crest'}
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
                {selectedBasin.timeToCrestMinutes}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-1.5 uppercase">Minutes</span>
            </div>
            <div className="mt-1 text-[11px] text-rose-400 font-medium">
              {isNepali ? 'तत्काल पूर्वतयारी गर्नुहोस्' : 'Immediate crest arriving'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
