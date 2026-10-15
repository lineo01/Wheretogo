import React, { useState } from 'react';
import { EvacuationRoute, RiverBasin } from '../types/flood';
import { generateTacticalGuidance } from '../utils/floodAI';
import { AlertOctagon, ShieldAlert, PhoneCall, CheckCircle, Volume2, ArrowRightCircle, LifeBuoy, AlertTriangle } from 'lucide-react';

interface ObstacleGuidanceProps {
  currentWaterLevel: number;
  route: EvacuationRoute;
  basin: RiverBasin;
  language: 'en' | 'ne';
}

export const ObstacleGuidance: React.FC<ObstacleGuidanceProps> = ({
  currentWaterLevel,
  route,
  basin,
  language,
}) => {
  const isNepali = language === 'ne';
  const guidance = generateTacticalGuidance(currentWaterLevel, route, basin);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakSurvivalInstructions = () => {
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
      ? `${guidance.headlineNepali}। ${guidance.summaryNepali}। तत्काल चाल्नुपर्ने कदमहरू: ${guidance.immediateActionsNepali.join(' ')}। फसेको अवस्थामा बाँच्ने उपाय: ${guidance.strandedProtocolNepali.join(' ')}। आपतकालीन हटलाइन: बाढी ११५५, प्रहरी १००, सशस्त्र प्रहरी १११४।`
      : `${guidance.headline}. ${guidance.summary}. Immediate steps: ${guidance.immediateActions.join(' ')}. If stranded: ${guidance.strandedProtocol.join(' ')}. Emergency hotlines: Flood 1155, Police 100, APF Rescue 1114.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section id="obstacle-guidance" className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
      {/* Header */}
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        route.isHampered
          ? 'bg-rose-950/70 border-rose-900/60'
          : 'bg-slate-950/70 border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            route.isHampered
              ? 'bg-rose-600/20 border border-rose-500/50 text-rose-400'
              : 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{isNepali ? 'बाटो अवरोध व्यवस्थापन र आपतकालीन निर्देशन' : 'Obstacle Resolution & AI Survival Guidance'}</span>
              {route.isHampered && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold animate-pulse">
                  PATH BLOCKED
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {isNepali
                ? 'बाढीले बाटो छेकेको अवस्थामा AI द्वारा स्वचालित वैकल्पिक मार्ग र बाँच्ने रणनीति'
                : 'Automated problem handling when rising waters submerge primary escape routes'}
            </p>
          </div>
        </div>

        {/* Listen Button */}
        <button
          onClick={handleSpeakSurvivalInstructions}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isSpeaking ? (isNepali ? 'रोक्नुहोस्' : 'Stop Audio') : (isNepali ? 'निर्देशन सुन्नुहोस्' : 'Speak Instructions')}</span>
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Dynamic Obstacle Status Banner */}
        {route.isHampered ? (
          <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-950/30 space-y-3">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-200 uppercase tracking-wide">
                  {isNepali ? guidance.headlineNepali : guidance.headline}
                </h4>
                <p className="text-xs text-rose-100/90 leading-relaxed">
                  {route.hamperedReason}
                </p>
              </div>
            </div>

            {/* AI Resolution Summary */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-rose-900/40 text-xs flex items-start gap-2.5">
              <ArrowRightCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 block mb-0.5">
                  {isNepali ? 'AI समाधान: उच्च बाँध (High Bund) तर्फ मोडिएको' : 'AI Dynamic Solution: Rerouted via High Flood Bund Levee'}
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  {isNepali ? guidance.summaryNepali : guidance.summary}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>{isNepali ? 'मुख्य बाटो खुला छ:' : 'Primary Route Clear:'}</strong>{' '}
                {isNepali
                  ? 'हाल मुख्य सडक तथा पुल सुचारु छ, तर नदीको जलस्तर बढ्दो क्रममा रहेकाले सावधानीपूर्वक हिँड्नुहोस्।'
                  : 'Low causeway bridge remains passable. Evacuate now before river reaches 8.4m.'}
              </span>
            </div>
          </div>
        )}

        {/* Two-Column Tactical Protocol: Immediate Actions & Stranded Contingency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Box 1: Immediate Survival Actions */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isNepali ? 'तुरुन्तै चाल्नुपर्ने कदमहरू (Immediate Actions):' : 'Immediate Life-Safety Actions:'}</span>
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              {(isNepali ? guidance.immediateActionsNepali : guidance.immediateActions).map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Box 2: What to do if Stranded */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isNepali ? 'बाढीले घेरेमा / फसेमा के गर्ने (If Cut Off):' : 'Stranded Survival Protocol:'}</span>
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              {(isNepali ? guidance.strandedProtocolNepali : guidance.strandedProtocol).map((prot, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{prot}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Helplines Bar */}
        <div>
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            {isNepali ? 'नेपाल आपतकालीन उद्धार तथा सूचना सम्पर्क (Toll-Free Helplines):' : 'Nepal National Emergency Flood Rescue Contacts:'}
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {guidance.contacts.map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.number}`}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800/80 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 group-hover:text-white line-clamp-1">
                    {contact.name}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {contact.role}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-sm">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{contact.number}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
