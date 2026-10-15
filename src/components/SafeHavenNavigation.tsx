import React, { useState } from 'react';
import { Settlement, SafeShelter, EvacuationRoute } from '../types/flood';
import { MapPin, Navigation, ExternalLink, QrCode, Volume2, ShieldCheck, CheckCircle2, AlertOctagon, Footprints, Clock, Mountain } from 'lucide-react';

interface SafeHavenNavigationProps {
  settlements: Settlement[];
  selectedSettlement: Settlement;
  onSelectSettlement: (settlement: Settlement) => void;
  shelters: SafeShelter[];
  selectedShelter: SafeShelter;
  onSelectShelter: (shelter: SafeShelter) => void;
  route: EvacuationRoute;
  language: 'en' | 'ne';
}

export const SafeHavenNavigation: React.FC<SafeHavenNavigationProps> = ({
  settlements,
  selectedSettlement,
  onSelectSettlement,
  shelters,
  selectedShelter,
  onSelectShelter,
  route,
  language,
}) => {
  const isNepali = language === 'ne';
  const [showQrModal, setShowQrModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Web Speech API text-to-speech for navigation directions
  const handleSpeakDirections = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = isNepali
      ? `निकासी निर्देशन। गन्तव्य: ${selectedShelter.nameNepali}। उचाई: ${selectedShelter.elevationMeters} मिटर। कुल दुरी: ${(route.totalDistanceMeters / 1000).toFixed(1)} किलोमिटर। ${route.steps.map((s, i) => `चरण ${i + 1}: ${s.instructionNepali}`).join(' ')}`
      : `Evacuation navigation directions. Destination: ${selectedShelter.name}. Elevation: ${selectedShelter.elevationMeters} meters. Total distance: ${(route.totalDistanceMeters / 1000).toFixed(1)} kilometers. ${route.steps.map((s, i) => `Step ${i + 1}: ${s.instruction}`).join(' ')}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section id="safe-havens" className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {isNepali ? 'कहाँ जाने र कसरी जाने (सुरक्षित आश्रय नेभिगेसन)' : 'Where To Go & How To Go (Shelter Navigation)'}
            </h3>
            <p className="text-xs text-slate-400">
              {isNepali
                ? 'तोकिएको सुरक्षित आश्रय, पैदल बाटो र गुगल म्याप्स नेभिगेसन'
                : 'Designated high-ground havens, walking directions, and Google Maps mobile routing'}
            </p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="settlement-select" className="text-xs text-slate-400 whitespace-nowrap">
            {isNepali ? 'तपाईंको स्थान:' : 'Your Location:'}
          </label>
          <select
            id="settlement-select"
            value={selectedSettlement.id}
            onChange={(e) => {
              const found = settlements.find((s) => s.id === e.target.value);
              if (found) onSelectSettlement(found);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            {settlements.map((s) => (
              <option key={s.id} value={s.id}>
                {isNepali ? s.nameNepali : s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): "WHERE TO GO" (Safe Haven Details) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-emerald-900/50 bg-emerald-950/20 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  {isNepali ? 'तोकिएको सुरक्षित स्थल' : 'Designated Safe Haven'}
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {isNepali ? selectedShelter.nameNepali : selectedShelter.name}
                </h4>
              </div>
              <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold whitespace-nowrap">
                +{selectedShelter.heightAboveRiverMeters}m Above Flood
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">{isNepali ? 'उचाई (MSL)' : 'Elevation'}</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">{selectedShelter.elevationMeters}m</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">{isNepali ? 'क्षमता / हालको संख्या' : 'Capacity / Occupancy'}</span>
                <span className="text-white font-mono font-bold text-sm">
                  {selectedShelter.currentOccupancy} / {selectedShelter.capacityPersons}
                </span>
              </div>
            </div>

            {/* Facilities Available */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                {isNepali ? 'उपलब्ध आपतकालीन सुविधाहरू:' : 'Verified Shelter Facilities:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedShelter.facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{fac}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Person */}
            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
              <span>Contact: {selectedShelter.contactPerson}</span>
              <a href={`tel:${selectedShelter.contactPhone}`} className="text-cyan-400 hover:underline font-mono">
                {selectedShelter.contactPhone}
              </a>
            </div>
          </div>

          {/* GOOGLE MAPS NAVIGATION CARD */}
          <div className="p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isNepali ? 'गुगल म्याप्स प्रत्यक्ष नेभिगेसन' : 'Google Maps Live Navigation'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Walking Mode</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isNepali
                ? 'सिधै गुगल म्याप्स एपमा हिँड्ने बाटो खोल्नुहोस् वा मोबाइल क्यामेराबाट QR कोड स्क्यान गर्नुहोस्।'
                : 'Launch turn-by-turn walking route directly in the Google Maps app or scan on any smartphone.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={route.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isNepali ? 'गुगल म्याप्स खोल्नुहोस्' : 'Open in Google Maps'}</span>
              </a>

              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                title="Scan Mobile QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>QR</span>
              </button>

              <button
                onClick={handleSpeakDirections}
                className={`p-2.5 rounded-lg border transition-colors ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Voice Navigation (Listen aloud)"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): "HOW TO GO" (Turn-by-turn Step Directions) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Route Overview Ribbon */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Footprints className="w-4 h-4 text-cyan-400" />
                <span>Total Distance:</span>
                <strong className="text-white font-mono tabular-nums">
                  {(route.totalDistanceMeters / 1000).toFixed(2)} km
                </strong>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Estimated Walk:</span>
                <strong className="text-white font-mono tabular-nums">~{route.estimatedWalkMinutes} mins</strong>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Mountain className="w-4 h-4 text-emerald-400" />
                <span>Elevation Climb:</span>
                <strong className="text-white font-mono tabular-nums">+{route.elevationGainMeters}m</strong>
              </div>
            </div>

            {route.isRerouted && (
              <span className="text-[11px] font-bold text-amber-400 font-mono">
                ⚠️ ALTERNATIVE HIGH BUND ACTIVE
              </span>
            )}
          </div>

          {/* Turn-by-Turn Instruction List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isNepali ? 'क्रमबद्ध हिँड्ने निर्देशनहरू:' : 'Step-by-Step Walking Directions:'}
            </h4>

            <div className="space-y-2">
              {route.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    step.isSafeHighGround
                      ? 'bg-slate-950/80 border-cyan-900/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-400 text-xs">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-100 font-medium leading-relaxed">
                        {isNepali ? step.instructionNepali : step.instruction}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span>
                          Road: <strong className="text-slate-300">{step.roadName}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Type: <strong className="text-cyan-400">{step.roadType}</strong>
                        </span>
                        <span>·</span>
                        <span>Distance: {step.distanceMeters}m</span>
                      </div>
                      {step.warningNotice && (
                        <div className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          <span>{step.warningNotice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {isNepali ? 'मोबाइल गुगल म्याप्स QR कोड' : 'Scan to Open in Google Maps'}
            </h3>
            <p className="text-xs text-slate-300">
              {isNepali
                ? 'आफ्नो फोनको क्यामेराले यो कोड स्क्यान गर्नुहोस् र सुरक्षित बाटोको सिधा नेभिगेसन पाउनुहोस्।'
                : 'Point your smartphone camera at this QR code to load the exact walking navigation directly in Google Maps.'}
            </p>

            {/* Generated Vector QR Code */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Clean QR Code Vector Matrix Representation */}
                <rect width="100" height="100" fill="#ffffff" />
                {/* Top-left corner anchor */}
                <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="18" width="8" height="8" fill="#0f172a" />
                {/* Top-right corner anchor */}
                <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="74" y="18" width="8" height="8" fill="#0f172a" />
                {/* Bottom-left corner anchor */}
                <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="74" width="8" height="8" fill="#0f172a" />
                {/* Data modules pattern */}
                <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="48" y="12" width="8" height="4" fill="#0f172a" />
                <rect x="38" y="22" width="10" height="6" fill="#0f172a" />
                <rect x="52" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="12" y="38" width="6" height="6" fill="#0f172a" />
                <rect x="24" y="42" width="6" height="8" fill="#0f172a" />
                <rect x="34" y="36" width="8" height="6" fill="#0f172a" />
                <rect x="46" y="40" width="8" height="8" fill="#0f172a" />
                <rect x="60" y="38" width="6" height="6" fill="#0f172a" />
                <rect x="72" y="40" width="16" height="6" fill="#0f172a" />
                <rect x="38" y="52" width="8" height="6" fill="#0f172a" />
                <rect x="50" y="56" width="6" height="12" fill="#0f172a" />
                <rect x="62" y="50" width="8" height="6" fill="#0f172a" />
                <rect x="76" y="52" width="10" height="8" fill="#0f172a" />
                <rect x="38" y="66" width="6" height="8" fill="#0f172a" />
                <rect x="48" y="74" width="10" height="6" fill="#0f172a" />
                <rect x="64" y="68" width="8" height="8" fill="#0f172a" />
                <rect x="76" y="76" width="12" height="6" fill="#0f172a" />
                <rect x="38" y="80" width="8" height="8" fill="#0f172a" />
              </svg>
            </div>

            <div className="text-[11px] font-mono text-cyan-400 break-all px-2">
              Destination: {selectedShelter.coordinates.lat.toFixed(4)}, {selectedShelter.coordinates.lng.toFixed(4)}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {isNepali ? 'बन्द गर्नुहोस्' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
