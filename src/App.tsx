/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NEPAL_BASINS, SETTLEMENTS, SAFE_SHELTERS } from './data/nepalBasins';
import { INITIAL_CITIZENS } from './data/nepalCitizens';
import { RiverBasin, Settlement, SafeShelter, Citizen, DispatchedAlert } from './types/flood';
import { calculateThreatLevel, calculateThreatScore, calculateEvacuationRoute } from './utils/floodAI';
import { TopBar } from './components/TopBar';
import { TelemetryBanner } from './components/TelemetryBanner';
import { FloodVisualizer } from './components/FloodVisualizer';
import { SafeHavenNavigation } from './components/SafeHavenNavigation';
import { ObstacleGuidance } from './components/ObstacleGuidance';
import { CitizenRegistryLog } from './components/CitizenRegistryLog';
import { DownloadAndRunModal } from './components/DownloadAndRunModal';
import { Shield, PhoneCall, Radio, FileDown, AlertTriangle } from 'lucide-react';

export default function App() {
  // Language toggle: English or Nepali
  const [language, setLanguage] = useState<'en' | 'ne'>('en');

  // Selected river basin
  const [selectedBasin, setSelectedBasin] = useState<RiverBasin>(NEPAL_BASINS[0]);

  // Current water level (defaults to critical 8.85m to demonstrate flood & obstacle handling immediately)
  const [currentWaterLevel, setCurrentWaterLevel] = useState<number>(NEPAL_BASINS[0].currentLevelMeters);

  // Forced bridge obstruction toggle (simulating landslide / washout)
  const [forceBlockBridge, setForceBlockBridge] = useState<boolean>(false);

  // Settlements and Shelters for current basin
  const currentSettlements = SETTLEMENTS[selectedBasin.id] || SETTLEMENTS['koshi-saptari'];
  const currentShelters = SAFE_SHELTERS[selectedBasin.id] || SAFE_SHELTERS['koshi-saptari'];

  const [selectedSettlement, setSelectedSettlement] = useState<Settlement>(currentSettlements[0]);
  const [selectedShelter, setSelectedShelter] = useState<SafeShelter>(currentShelters[0]);

  // Citizens and Dispatched Alerts
  const [citizens, setCitizens] = useState<Citizen[]>(INITIAL_CITIZENS);
  const [dispatchedAlerts, setDispatchedAlerts] = useState<DispatchedAlert[]>([
    {
      id: 'ALERT-NEP-8021',
      citizenId: 'cit-001',
      citizenName: 'Ram Bahadur Thapa',
      phone: '+977-9842018492',
      ward: 3,
      basinName: 'Saptari & Sunsari (Saptakoshi River Basin)',
      channel: 'SMS',
      sentTimestamp: '10 mins ago',
      status: 'DELIVERED',
      evacuationStatus: 'NOTIFIED',
      assignedShelterName: 'Shree Kankalini Elevated Secondary School',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=26.538500,86.916000&destination=26.562000,86.922000&travelmode=walking',
      messageNepali: '🚨 आकस्मिक बाढी सूचना: सप्तकोशीमा पानीको सतह ८.८५ मिटर पुगेको छ। उच्च बाँधमार्ग हुँदै श्री कङ्कालिनी मा.वि. जानुहोस्।',
      messageEnglish: '🚨 Emergency Flood Alert: Saptakoshi is at 8.85m. Low bridge submerged. Follow high bund to Kankalini School.',
    },
    {
      id: 'ALERT-NEP-8022',
      citizenId: 'cit-002',
      citizenName: 'Sita Devi Chaudhary',
      phone: '+977-9812984510',
      ward: 3,
      basinName: 'Saptari & Sunsari (Saptakoshi River Basin)',
      channel: 'WHATSAPP',
      sentTimestamp: '15 mins ago',
      status: 'DELIVERED',
      evacuationStatus: 'EN_ROUTE',
      assignedShelterName: 'Shree Kankalini Elevated Secondary School',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=26.538500,86.916000&destination=26.562000,86.922000&travelmode=walking',
      messageNepali: '🚨 आकस्मिक बाढी सूचना: खडक खोला पुल डुबेको छ। सुरक्षित उच्च बाँध प्रयोग गर्नुहोस्।',
      messageEnglish: '🚨 Emergency Flood Alert: Khadak bridge submerged. Use safe high levee bund.',
    },
    {
      id: 'ALERT-NEP-8023',
      citizenId: 'cit-004',
      citizenName: 'Pabitra Maya Tamang',
      phone: '+977-9842881240',
      ward: 3,
      basinName: 'Saptari & Sunsari (Saptakoshi River Basin)',
      channel: 'SMS',
      sentTimestamp: '8 mins ago',
      status: 'DELIVERED',
      evacuationStatus: 'RESCUE_NEEDED',
      assignedShelterName: 'Shree Kankalini Elevated Secondary School',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=26.538500,86.916000&destination=26.562000,86.922000&travelmode=walking',
      messageNepali: '🚨 आकस्मिक उद्धार सूचना: डुङ्गा उद्धार टोली तैनाथ गरिएको छ।',
      messageEnglish: '🚨 Rescue alert: APF boat team dispatched.',
    },
  ]);

  // Modal State for Step-by-Step Run Guide
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Compute threat level and threat score
  const threatLevel = calculateThreatLevel(selectedBasin, currentWaterLevel);
  const threatScore = calculateThreatScore(selectedBasin, currentWaterLevel);

  // Compute dynamic evacuation route and obstacle handling
  const route = calculateEvacuationRoute(
    selectedSettlement,
    selectedShelter,
    currentWaterLevel,
    forceBlockBridge
  );

  // Basin change handler
  const handleSelectBasin = (basin: RiverBasin) => {
    setSelectedBasin(basin);
    setCurrentWaterLevel(basin.currentLevelMeters);
    const newSettlements = SETTLEMENTS[basin.id] || SETTLEMENTS['koshi-saptari'];
    const newShelters = SAFE_SHELTERS[basin.id] || SAFE_SHELTERS['koshi-saptari'];
    setSelectedSettlement(newSettlements[0]);
    setSelectedShelter(newShelters[0]);
  };

  // Dispatch new alert handler
  const handleDispatchAlert = (alert: DispatchedAlert) => {
    setDispatchedAlerts((prev) => [alert, ...prev]);
    // update citizen notified status
    setCitizens((prev) =>
      prev.map((c) =>
        c.id === alert.citizenId
          ? { ...c, lastNotifiedAt: 'Just now' }
          : c
      )
    );
  };

  // Update citizen evacuation status
  const handleUpdateEvacuationStatus = (
    alertId: string,
    citizenId: string,
    newStatus: Citizen['evacuationStatus']
  ) => {
    setDispatchedAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, evacuationStatus: newStatus } : a))
    );
    setCitizens((prev) =>
      prev.map((c) => (c.id === citizenId ? { ...c, evacuationStatus: newStatus } : c))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* 3-Zone Top Navigation Bar */}
      <TopBar
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'ne' : 'en'))}
        threatLevel={threatLevel}
      />

      {/* Real-time Hydrology Telemetry Ribbon */}
      <TelemetryBanner
        basins={NEPAL_BASINS}
        selectedBasin={selectedBasin}
        onSelectBasin={handleSelectBasin}
        currentWaterLevel={currentWaterLevel}
        threatLevel={threatLevel}
        threatScore={threatScore}
        language={language}
      />

      {/* Main Operations Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Interactive Flood Visualizer */}
        <FloodVisualizer
          basin={selectedBasin}
          currentWaterLevel={currentWaterLevel}
          onSetWaterLevel={setCurrentWaterLevel}
          settlement={selectedSettlement}
          shelter={selectedShelter}
          route={route}
          forceBlockBridge={forceBlockBridge}
          onToggleForceBlockBridge={() => setForceBlockBridge((f) => !f)}
          language={language}
        />

        {/* Where to Go & How to Go (Shelter Details, Steps, Google Maps & QR) */}
        <SafeHavenNavigation
          settlements={currentSettlements}
          selectedSettlement={selectedSettlement}
          onSelectSettlement={setSelectedSettlement}
          shelters={currentShelters}
          selectedShelter={selectedShelter}
          onSelectShelter={setSelectedShelter}
          route={route}
          language={language}
        />

        {/* Obstacle Resolution & Tactical AI "What to Do" Survival Advice */}
        <ObstacleGuidance
          currentWaterLevel={currentWaterLevel}
          route={route}
          basin={selectedBasin}
          language={language}
        />

        {/* Nepal Citizen Alert Registry & Dispatched Message Audit Log */}
        <CitizenRegistryLog
          citizens={citizens}
          dispatchedAlerts={dispatchedAlerts}
          onDispatchAlert={handleDispatchAlert}
          onUpdateEvacuationStatus={handleUpdateEvacuationStatus}
          selectedBasin={selectedBasin}
          currentWaterLevel={currentWaterLevel}
          selectedShelter={selectedShelter}
          route={route}
          language={language}
        />
      </main>

      {/* Step-by-Step How to Download and Run Modal */}
      <DownloadAndRunModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        language={language}
      />

      {/* Clean Footnote */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Nepal Flood AI</span>
            <span>·</span>
            <span>Department of Hydrology & Meteorology (DHM) Compliant</span>
            <span>·</span>
            <span>National Disaster Risk Reduction & Management Authority (NDRRMA)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="hover:text-cyan-400 underline underline-offset-4 flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Offline Download & Setup Guide</span>
            </button>
            <span>Emergency Toll-Free: 1155 / 100 / 1114</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
