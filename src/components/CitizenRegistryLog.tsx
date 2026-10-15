import React, { useState } from 'react';
import { Citizen, DispatchedAlert, RiverBasin, SafeShelter, EvacuationRoute } from '../types/flood';
import { generateCustomCitizenMessage } from '../utils/floodAI';
import { Users, Send, MessageSquare, Download, Check, AlertTriangle, ShieldCheck, Search, Filter, Phone, ExternalLink, Share2, Copy } from 'lucide-react';

interface CitizenRegistryLogProps {
  citizens: Citizen[];
  dispatchedAlerts: DispatchedAlert[];
  onDispatchAlert: (alert: DispatchedAlert) => void;
  onUpdateEvacuationStatus: (alertId: string, citizenId: string, newStatus: Citizen['evacuationStatus']) => void;
  selectedBasin: RiverBasin;
  currentWaterLevel: number;
  selectedShelter: SafeShelter;
  route: EvacuationRoute;
  language: 'en' | 'ne';
}

export const CitizenRegistryLog: React.FC<CitizenRegistryLogProps> = ({
  citizens,
  dispatchedAlerts,
  onDispatchAlert,
  onUpdateEvacuationStatus,
  selectedBasin,
  currentWaterLevel,
  selectedShelter,
  route,
  language,
}) => {
  const isNepali = language === 'ne';
  const [activeTab, setActiveTab] = useState<'dispatched_log' | 'citizen_directory'>('dispatched_log');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [previewCitizen, setPreviewCitizen] = useState<Citizen | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Filter dispatched alerts
  const filteredAlerts = dispatchedAlerts.filter((alert) => {
    const matchesSearch =
      alert.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.phone.includes(searchQuery) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || alert.evacuationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter citizens
  const filteredCitizens = citizens.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameNepali.includes(searchQuery) ||
      c.phone.includes(searchQuery) ||
      c.settlementName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle single alert send
  const handleSendSingleAlert = (citizen: Citizen, channel: 'SMS' | 'WHATSAPP') => {
    const { messageNepali, messageEnglish, googleMapsUrl } = generateCustomCitizenMessage(
      citizen,
      selectedBasin,
      currentWaterLevel,
      selectedShelter,
      route
    );

    const newAlert: DispatchedAlert = {
      id: `ALERT-NEP-${Math.floor(1000 + Math.random() * 9000)}`,
      citizenId: citizen.id,
      citizenName: citizen.name,
      phone: citizen.phone,
      ward: citizen.ward,
      basinName: selectedBasin.name,
      channel,
      sentTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'DELIVERED',
      evacuationStatus: citizen.evacuationStatus,
      assignedShelterName: selectedShelter.name,
      googleMapsUrl,
      messageNepali,
      messageEnglish,
    };

    onDispatchAlert(newAlert);
    setPreviewCitizen(null);
  };

  // Mass Broadcast to all residents in active basin
  const handleMassBroadcast = () => {
    setIsBroadcasting(true);
    let count = 0;
    const basinCitizens = citizens.filter((c) => c.basinId === selectedBasin.id);

    const interval = setInterval(() => {
      if (count < basinCitizens.length) {
        const c = basinCitizens[count];
        const { messageNepali, messageEnglish, googleMapsUrl } = generateCustomCitizenMessage(
          c,
          selectedBasin,
          currentWaterLevel,
          selectedShelter,
          route
        );

        const newAlert: DispatchedAlert = {
          id: `MASS-${Math.floor(10000 + Math.random() * 90000)}`,
          citizenId: c.id,
          citizenName: c.name,
          phone: c.phone,
          ward: c.ward,
          basinName: selectedBasin.name,
          channel: 'SMS',
          sentTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'DELIVERED',
          evacuationStatus: c.evacuationStatus,
          assignedShelterName: selectedShelter.name,
          googleMapsUrl,
          messageNepali,
          messageEnglish,
        };

        onDispatchAlert(newAlert);
        count++;
      } else {
        clearInterval(interval);
        setIsBroadcasting(false);
        setActiveTab('dispatched_log');
      }
    }, 200);
  };

  // Export CSV Log
  const handleExportCsv = () => {
    const headers = ['Alert_ID', 'Timestamp', 'Citizen_Name', 'Phone', 'Ward', 'Channel', 'Delivery_Status', 'Evacuation_Status', 'Assigned_Shelter', 'Google_Maps_URL'];
    const rows = dispatchedAlerts.map((a) => [
      a.id,
      a.sentTimestamp,
      `"${a.citizenName}"`,
      a.phone,
      a.ward,
      a.channel,
      a.status,
      a.evacuationStatus,
      `"${a.assignedShelterName}"`,
      `"${a.googleMapsUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nepal_flood_alert_dispatched_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="citizen-alerts" className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {isNepali ? 'नेपाल नागरिक सूची तथा पठाइएका सन्देशहरूको अभिलेख' : 'Nepal Citizen Alert Registry & Dispatched Log'}
            </h3>
            <p className="text-xs text-slate-400">
              {isNepali
                ? 'प्रत्येक नागरिकलाई पठाइएको व्यक्तिगत बाढी सूचना, गुगल म्याप्स लिङ्क र उद्धार स्थिति'
                : 'Maintains records of customized emergency messages sent to residents with Google Maps links'}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMassBroadcast}
            disabled={isBroadcasting}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
              isBroadcasting
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isBroadcasting
                ? (isNepali ? 'सन्देश पठाइँदै...' : 'Broadcasting Alerts...')
                : (isNepali ? '📢 सबैलाई आपतकालीन सन्देश पठाउनुहोस्' : '📢 Broadcast to All Basin Residents')}
            </span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isNepali ? 'CSV डाउनलोड' : 'Export CSV Log'}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('dispatched_log')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'dispatched_log'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isNepali ? 'पठाइएका सन्देशहरूको सूची' : 'Dispatched Alert Log'} ({dispatchedAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('citizen_directory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'citizen_directory'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isNepali ? 'नागरिक नामावली' : 'Citizen Directory'} ({citizens.length})
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={isNepali ? 'नाम, फोन वा वडा खोज्नुहोस्...' : 'Search name, phone, ward...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 sm:w-56"
            />
          </div>

          {activeTab === 'dispatched_log' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="NOTIFIED">Notified</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="AT_SHELTER">At Shelter</option>
              <option value="RESCUE_NEEDED">SOS - Rescue Needed</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content Table */}
      <div className="overflow-x-auto">
        {activeTab === 'dispatched_log' ? (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Ward / Settlement</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Evacuation Status</th>
                <th className="py-3 px-4">Assigned Shelter</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    No dispatched alert records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-400 font-medium">
                      {alert.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {alert.citizenName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {alert.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      Ward {alert.ward}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {alert.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {alert.evacuationStatus === 'AT_SHELTER' && (
                        <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Safe at Shelter
                        </span>
                      )}
                      {alert.evacuationStatus === 'EN_ROUTE' && (
                        <span className="text-amber-400 font-semibold text-[11px]">
                          En Route to Shelter
                        </span>
                      )}
                      {alert.evacuationStatus === 'NOTIFIED' && (
                        <span className="text-blue-400 font-semibold text-[11px]">
                          Notified (Pending)
                        </span>
                      )}
                      {alert.evacuationStatus === 'RESCUE_NEEDED' && (
                        <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> SOS - Rescue Needed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 line-clamp-1 max-w-[160px]">
                      {alert.assignedShelterName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] tabular-nums">
                      {alert.sentTimestamp}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {alert.evacuationStatus !== 'AT_SHELTER' && (
                          <button
                            onClick={() => onUpdateEvacuationStatus(alert.id, alert.citizenId, 'AT_SHELTER')}
                            className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-[11px] transition-colors"
                            title="Mark as Safely Arrived at Shelter"
                          >
                            Mark Safe
                          </button>
                        )}
                        {alert.evacuationStatus !== 'RESCUE_NEEDED' && (
                          <button
                            onClick={() => onUpdateEvacuationStatus(alert.id, alert.citizenId, 'RESCUE_NEEDED')}
                            className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] transition-colors"
                            title="Flag for Urgent Boat Rescue"
                          >
                            SOS
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Nepali Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Ward / Settlement</th>
                <th className="py-3 px-4">Household Size</th>
                <th className="py-3 px-4">Vulnerability Factors</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredCitizens.map((citizen) => (
                <tr key={citizen.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{citizen.name}</td>
                  <td className="py-3 px-4 text-slate-300 font-nepali">{citizen.nameNepali}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{citizen.phone}</td>
                  <td className="py-3 px-4 text-slate-300">
                    Ward {citizen.ward} · {citizen.settlementName}
                  </td>
                  <td className="py-3 px-4 font-mono">{citizen.familyMembers} persons</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {citizen.vulnerability.map((v, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300 uppercase"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-cyan-400">{citizen.evacuationStatus}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setPreviewCitizen(citizen)}
                      className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-300 text-xs font-medium transition-colors"
                    >
                      {isNepali ? 'सन्देश हेर्नुहोस्' : 'Custom Alert'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Custom Message Preview & Dispatch Modal */}
      {previewCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  {isNepali ? 'व्यक्तिगत आपतकालीन सन्देश' : 'Personalized AI Alert Synthesizer'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {previewCitizen.name} ({previewCitizen.nameNepali})
                </h3>
                <p className="text-xs text-slate-400">
                  Phone: {previewCitizen.phone} · Ward {previewCitizen.ward}, {previewCitizen.settlementName}
                </p>
              </div>
              <button
                onClick={() => setPreviewCitizen(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Generated Bilingual Messages */}
            <div className="space-y-3">
              {/* Nepali Message */}
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-950/80 space-y-1.5">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  नेपाली सन्देश (SMS / WhatsApp):
                </span>
                <p className="text-xs text-slate-200 font-nepali whitespace-pre-line leading-relaxed">
                  {
                    generateCustomCitizenMessage(
                      previewCitizen,
                      selectedBasin,
                      currentWaterLevel,
                      selectedShelter,
                      route
                    ).messageNepali
                  }
                </p>
              </div>

              {/* English Message */}
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-950/80 space-y-1.5">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  English Alert (SMS / WhatsApp):
                </span>
                <p className="text-xs text-slate-300 font-sans whitespace-pre-line leading-relaxed">
                  {
                    generateCustomCitizenMessage(
                      previewCitizen,
                      selectedBasin,
                      currentWaterLevel,
                      selectedShelter,
                      route
                    ).messageEnglish
                  }
                </p>
              </div>
            </div>

            {/* Google Maps link preview */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="truncate mr-2 font-mono text-cyan-400">
                {route.googleMapsUrl}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(route.googleMapsUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-xs text-slate-300 hover:text-white shrink-0 flex items-center gap-1 font-semibold"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Send Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleSendSingleAlert(previewCitizen, 'SMS')}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                {isNepali ? 'SMS मार्फत पठाउनुहोस्' : 'Send Emergency SMS'}
              </button>
              <button
                onClick={() => handleSendSingleAlert(previewCitizen, 'WHATSAPP')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                {isNepali ? 'WhatsApp मार्फत पठाउनुहोस्' : 'Send WhatsApp Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
