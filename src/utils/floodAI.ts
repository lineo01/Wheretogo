import { RiverBasin, SafeShelter, Settlement, EvacuationRoute, RouteStep, ThreatLevel, RoadNode, RoadSegment, Citizen } from '../types/flood';
import { KOSHI_ROAD_NODES, KOSHI_ROAD_SEGMENTS } from '../data/nepalBasins';

export function calculateThreatLevel(basin: RiverBasin, currentWaterLevel: number): ThreatLevel {
  if (currentWaterLevel >= basin.dangerLevelMeters) {
    return 'CRITICAL';
  } else if (currentWaterLevel >= basin.warningLevelMeters) {
    return 'WARNING';
  } else if (currentWaterLevel >= basin.normalLevelMeters + (basin.warningLevelMeters - basin.normalLevelMeters) * 0.6) {
    return 'ALERT';
  }
  return 'NORMAL';
}

export function calculateThreatScore(basin: RiverBasin, currentWaterLevel: number): number {
  const range = basin.dangerLevelMeters - basin.normalLevelMeters;
  if (range <= 0) return 50;
  const rawScore = ((currentWaterLevel - basin.normalLevelMeters) / range) * 80;
  // Boost by rainfall and rate of rise
  const rainFactor = Math.min(15, (basin.rainfall24hMm / 200) * 15);
  const riseFactor = Math.min(10, (basin.rateOfRiseCmHr / 20) * 10);
  const total = Math.max(5, Math.min(100, Math.round(rawScore + rainFactor + riseFactor)));
  return total;
}

export function generateGoogleMapsUrl(originLat: number, originLng: number, destLat: number, destLng: number): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat.toFixed(6)},${originLng.toFixed(6)}&destination=${destLat.toFixed(6)},${destLng.toFixed(6)}&travelmode=walking`;
}

export function calculateEvacuationRoute(
  settlement: Settlement,
  shelter: SafeShelter,
  currentWaterLevel: number,
  forceBlockBridge: boolean = false
): EvacuationRoute {
  // Check if primary bridge / low road is submerged
  const bridgeThreshold = 8.4; // Road 2 submerges at 8.4m
  const isBridgeSubmerged = currentWaterLevel >= bridgeThreshold || forceBlockBridge;

  const googleMapsUrl = generateGoogleMapsUrl(
    settlement.coordinates.lat,
    settlement.coordinates.lng,
    shelter.coordinates.lat,
    shelter.coordinates.lng
  );

  if (isBridgeSubmerged) {
    // REROUTED via High Flood Protection Bund (Levee)
    const steps: RouteStep[] = [
      {
        instruction: 'Turn West immediately from village center towards the West Embankment Ramp.',
        instructionNepali: 'गाउँको केन्द्रबाट तुरुन्तै पश्चिमतर्फ लागि पश्चिम तटबन्ध र्याम्पतर्फ जानुहोस्।',
        distanceMeters: 850,
        roadName: 'Tilathi West Embankment Ramp',
        roadType: 'High Bund Ramp (+8.3m elevation)',
        isSafeHighGround: true,
      },
      {
        instruction: 'Ascend onto the stone-reinforced Elevated Flood Protection Bund. Keep heading North along the levee ridge.',
        instructionNepali: 'ढुङ्गाको पक्की उच्च तटबन्धमा चढ्नुहोस् र बाँधको माथिल्लो सुरक्षित भाग हुँदै उत्तरतर्फ अगाडि बढ्नुहोस्।',
        distanceMeters: 1400,
        roadName: 'Elevated Flood Protection Bund Corridor',
        roadType: 'Reinforced Levee (Elev: 86.4m, Above Water Surge)',
        isSafeHighGround: true,
      },
      {
        instruction: 'Turn right at the Northern Bund High Spur towards Kankalini High Spur.',
        instructionNepali: 'उत्तरी बाँध उच्च शाखाबाट दायाँ मोडी कङ्कालिनी शाखा मार्ग समात्नुहोस्।',
        distanceMeters: 1100,
        roadName: 'Northern Bund High Spur',
        roadType: 'Elevated Ridge Road',
        isSafeHighGround: true,
      },
      {
        instruction: 'Enter Shree Kankalini Elevated Secondary School main gates safely on high ground.',
        instructionNepali: 'श्री कङ्कालिनी उच्च मा.वि. को सुरक्षित उच्च प्रवेशद्वारबाट सुरक्षित आश्रयस्थल प्रवेश गर्नुहोस्।',
        distanceMeters: 550,
        roadName: 'Kankalini High Gate Access',
        roadType: 'Highland Shelter Entrance (Elev: 89.5m)',
        isSafeHighGround: true,
      },
    ];

    const nodes = [
      KOSHI_ROAD_NODES[0], // Tilathi
      KOSHI_ROAD_NODES[5], // High bund access
      KOSHI_ROAD_NODES[6], // Bund ridge north
      KOSHI_ROAD_NODES[7], // Bund shelter link
      KOSHI_ROAD_NODES[4], // Kankalini shelter
    ];

    return {
      originId: settlement.id,
      destinationShelter: shelter,
      steps,
      totalDistanceMeters: 3900,
      estimatedWalkMinutes: 48,
      isHampered: true,
      isRerouted: true,
      hamperedReason: `Khadak Stream Low Causeway & Bridge is submerged under ${(currentWaterLevel - bridgeThreshold > 0 ? (currentWaterLevel - bridgeThreshold).toFixed(2) : '0.45')}m of high-velocity torrent. Crossing is strictly prohibited!`,
      hamperedLocationName: 'Khadak Stream Low Causeway & Bridge (Node 3)',
      elevationGainMeters: 15.3,
      pathNodes: nodes,
      googleMapsUrl,
    };
  } else {
    // Normal Primary Route (Direct lowland valley road)
    const steps: RouteStep[] = [
      {
        instruction: 'Head North-East on Tilathi Lowland Access Road through bazaar crossing.',
        instructionNepali: 'तिलाठी तल्लो पहुँच मार्गबाट उत्तर-पूर्वतर्फ बजार चोकतर्फ जानुहोस्।',
        distanceMeters: 450,
        roadName: 'Tilathi Lowland Access Road',
        roadType: 'Paved Lowland',
        isSafeHighGround: false,
      },
      {
        instruction: 'Cross Khadak Stream Causeway. (Proceed with vigilance; road will submerge if river reaches 8.4m).',
        instructionNepali: 'खडक खोला तल्लो कजवे पार गर्नुहोस्। (सतर्क रहनुहोस्; पानी ८.४ मिटर पुगेमा यो डुब्नेछ)।',
        distanceMeters: 520,
        roadName: 'Khadak Stream Low Causeway',
        roadType: 'Low-lying Causeway Bridge',
        isSafeHighGround: false,
        warningNotice: 'Flash flood alert: water is near bridge deck',
      },
      {
        instruction: 'Follow Hanumannagar North Arterial road steadily toward higher terrain.',
        instructionNepali: 'हनुमाननगर उत्तरी मुख्य सडक समातेर उच्च भूभागतर्फ उकालो लाग्नुहोस्।',
        distanceMeters: 680,
        roadName: 'Riverside Lower Arterial',
        roadType: 'Paved Road',
        isSafeHighGround: false,
      },
      {
        instruction: 'Ascend North Kankalini School Hill Road into designated safe shelter compound.',
        instructionNepali: 'कङ्कालिनी विद्यालय पहाडी सडक उक्लेर सुरक्षित आश्रय परिसरभित्र प्रवेश गर्नुहोस्।',
        distanceMeters: 1100,
        roadName: 'North Kankalini School Access Hill Road',
        roadType: 'Elevated High Road (Elev: 89.5m)',
        isSafeHighGround: true,
      },
    ];

    const nodes = [
      KOSHI_ROAD_NODES[0], // Tilathi
      KOSHI_ROAD_NODES[1], // Bazaar
      KOSHI_ROAD_NODES[2], // Low Bridge
      KOSHI_ROAD_NODES[3], // Arterial
      KOSHI_ROAD_NODES[4], // Kankalini shelter
    ];

    return {
      originId: settlement.id,
      destinationShelter: shelter,
      steps,
      totalDistanceMeters: 2750,
      estimatedWalkMinutes: 34,
      isHampered: false,
      isRerouted: false,
      elevationGainMeters: 15.3,
      pathNodes: nodes,
      googleMapsUrl,
    };
  }
}

export function generateCustomCitizenMessage(
  citizen: Citizen,
  basin: RiverBasin,
  currentWaterLevel: number,
  shelter: SafeShelter,
  route: EvacuationRoute
): { messageNepali: string; messageEnglish: string; googleMapsUrl: string } {
  const isHighDanger = currentWaterLevel >= basin.warningLevelMeters;
  const mapsLink = route.googleMapsUrl;

  const messageNepali = `🚨 आकस्मिक बाढी सूचना (विपद् व्यवस्थापन समिति, नेपाल)
नमस्ते ${citizen.nameNepali} ज्यू (${citizen.settlementName}, वडा नं. ${citizen.ward}):
▶ नदीको स्थिति: ${basin.riverNameNepali}मा पानीको सतह ${currentWaterLevel.toFixed(2)} मिटर पुगेको छ (खतरा विन्दु: ${basin.dangerLevelMeters}m)।
▶ बाटोको अवस्था: ${route.isHampered ? '⚠️ मुख्य तल्लो पुल बाढीले डुबानमा परेको छ! AI द्वारा निर्देशित उच्च बाँध (High Bund) मार्ग प्रयोग गर्नुहोस्।' : '✅ मुख्य सडक सुचारु छ तर पानीको सतह बढ्दो क्रममा छ।'}
▶ तपाईंको तोकिएको सुरक्षित आश्रय: ${shelter.nameNepali} (उचाई: ${shelter.elevationMeters}m, बाढीभन्दा +${shelter.heightAboveRiverMeters}m माथि)।
▶ सिधा गुगल म्याप्स नेभिगेसन खोल्नुहोस्:
${mapsLink}
▶ बाँच्ने उपाय: बगिरहेको पानीमा कहिल्यै नहिँड्नुहोस्। आपतकालीन सम्पर्क: बाढी हटलाइन ११५५ / नेपाल प्रहरी १०० / सशस्त्र प्रहरी १११४।`;

  const messageEnglish = `🚨 EMERGENCY FLOOD ALERT (Disaster Management Committee, Nepal)
Dear ${citizen.name} (${citizen.settlementName}, Ward ${citizen.ward}):
▶ River Status: ${basin.riverName} water level is at ${currentWaterLevel.toFixed(2)}m (Danger Mark: ${basin.dangerLevelMeters}m).
▶ Evacuation Route: ${route.isHampered ? '⚠️ Primary low causeway is SUBMERGED. Use AI-calculated West High Bund Levee bypass route.' : '✅ Primary road open. Evacuate before water rises further.'}
▶ Designated Safe Haven: ${shelter.name} (Elev: ${shelter.elevationMeters}m, +${shelter.heightAboveRiverMeters}m above river line).
▶ Live Google Maps Walking Navigation:
${mapsLink}
▶ Life-Safety Advice: Do not cross moving water. If cut off, move to concrete rooftop and signal rescue. Hotlines: DHM Flood 1155 / Police 100 / APF Rescue 1114.`;

  return { messageNepali, messageEnglish, googleMapsUrl: mapsLink };
}

export function generateTacticalGuidance(
  currentWaterLevel: number,
  route: EvacuationRoute,
  basin: RiverBasin
): {
  headline: string;
  headlineNepali: string;
  summary: string;
  summaryNepali: string;
  immediateActions: string[];
  immediateActionsNepali: string[];
  strandedProtocol: string[];
  strandedProtocolNepali: string[];
  contacts: { name: string; number: string; role: string }[];
} {
  const isBlocked = route.isHampered;

  const contacts = [
    { name: 'DHM Flood Alert Center', number: '1155', role: '24/7 Toll-Free River Hydrology Center' },
    { name: 'Nepal Police Emergency Control', number: '100', role: 'Immediate Ground Evacuation Desk' },
    { name: 'Armed Police Force (APF) Disaster Unit', number: '1114', role: 'Inflatable Boat & Swift Water Rescue' },
    { name: 'Nepal Red Cross Society Ambulance', number: '1130', role: 'First Aid & Medical Triage Squad' },
  ];

  if (isBlocked) {
    return {
      headline: 'CRITICAL WARNING: PRIMARY ROUTE SUBMERGED — DIVERT TO HIGH BUND',
      headlineNepali: 'गम्भीर चेतावनी: मुख्य सडक बाढीले डुबानमा — उच्च बाँधमार्गमा मोड्नुहोस्',
      summary: `The primary causeway bridge is submerged under torrential floodwaters. AI dynamic rerouting has activated the reinforced West Flood Protection Bund corridor, which remains +12m above the surge line.`,
      summaryNepali: `मुख्य खडक खोला तल्लो पुल तीव्र बहाव भएको बाढीले डुबाएको छ। AI ले तुरुन्तै पश्चिम उच्च बाँधको सुरक्षित बाटो तय गरेको छ, जुन बाढीको सतहभन्दा १२ मिटर माथि सुरक्षित छ।`,
      immediateActions: [
        'DO NOT attempt to wade, swim, or drive through the submerged causeway. 15cm of flowing monsoon water can knock an adult down.',
        'Turn West immediately toward the Tilathi High Bund Ramp to access the elevated stone levee.',
        'Stay centered on the reinforced bund crest; do not walk along slippery wet mud banks.',
        'Keep walking uphill until reaching Shree Kankalini Secondary School entrance gates.',
      ],
      immediateActionsNepali: [
        'डुबेको सडक वा पुलमा हिँड्ने वा मोटरसाइकल/सवारी चलाउने प्रयास कदापि नगर्नुहोस्। १५ से.मी. को तीव्र पानीले पनि मानिसलाई बगाउन सक्छ।',
        'तुरुन्तै पश्चिमतर्फ फर्केर तिलाठी उच्च बाँध र्याम्प समाती पक्की तटबन्धमा चढ्नुहोस्।',
        'बाँधको बीच भाग (क्रेस्ट) मा हिँड्नुहोस्; भिरालो र चिप्लो माटोको डिलमा नजानुहोस्।',
        'श्री कङ्कालिनी मा.वि. को उच्च परिसर नपुग्दासम्म निरन्तर उकालो बाटो हिँड्नुहोस्।',
      ],
      strandedProtocol: [
        'If water has encircled your dwelling and cut off the bund ramp: DO NOT enter the current.',
        'Immediately climb to the 2nd/3rd floor or reinforced concrete roof of the strongest nearby building or community water tower.',
        'Secure infants, elderly, and medical kits to your person.',
        'Wave a bright red or orange cloth, flag, or flashlight into the sky for Nepal Army / APF rescue helicopters and inflatable boats.',
        'Call APF Disaster Unit (1114) or Nepal Police (100) and report your exact landmark and number of stranded persons.',
      ],
      strandedProtocolNepali: [
        'यदि बाढीले घर वरिपरि घेरेर बाँध जाने बाटो पूर्ण बन्द भएको छ भने: बाढीको पानीमा हाम्फाल्ने प्रयास नगर्नुहोस्।',
        'तुरुन्तै नजिकैको पक्की घरको दोस्रो वा तेस्रो तल्ला वा छत अथवा पानीको उच्च ट्याङ्कीमा चढ्नुहोस्।',
        'बालबालिका, वृद्धवृद्धा र प्राथमिक उपचारका औषधिहरू आफूसँग सुरक्षित राख्नुहोस्।',
        'नेपाली सेना वा सशस्त्र प्रहरीको हेलिकप्टर तथा उद्धार डुङ्गालाई देख्ने गरी रातो वा सुन्तला रङ्गको कपडा/झण्डा फर्फराउनुहोस् वा टर्च बाल्नुहोस्।',
        'सशस्त्र प्रहरी विपद् व्यवस्थापन (१११४) वा प्रहरी (१००) मा फोन गरी आफ्नो स्थान र मानिसहरूको संख्या टिपाउनुहोस्।',
      ],
      contacts,
    };
  } else {
    return {
      headline: 'PRECAUTIONARY EVACUATION: RIVER RISING STEADILY',
      headlineNepali: 'पूर्वसतर्कता निकासी: नदीको सतह निरन्तर बढ्दै',
      summary: `The primary evacuation path is currently passable, but the river rate of rise is +${basin.rateOfRiseCmHr} cm/hr. Evacuate immediately before lowland bridges submerge.`,
      summaryNepali: `हाल मुख्य सडक सुचारु छ, तर नदी प्रतिघण्टा +${basin.rateOfRiseCmHr} से.मी. को दरले बढ्दैछ। पुल डुब्नुअगावै तत्काल सुरक्षित स्थानतर्फ लाग्नुहोस्।`,
      immediateActions: [
        'Pack essential documents, drinking water, flashlight, and medication in a sealed plastic bag.',
        'Turn off domestic gas cylinders and main electrical switches before vacating.',
        'Escort children and elderly household members along the designated path toward Shree Kankalini School.',
        'Monitor emergency radio and this dashboard for sudden upstream barrage gate openings.',
      ],
      immediateActionsNepali: [
        'नागरिकता, लालपुर्जा, पिउने पानी, टर्च र अत्यावश्यक औषधिहरू प्लास्टिकको झोलामा हाल्नुहोस्।',
        'घर छोड्नुअघि ग्यास सिलिन्डर र मुख्य बिजुलीको स्विच बन्द गर्नुहोस्।',
        'बालबालिका तथा ज्येष्ठ नागरिकहरूलाई साथमा लिएर तोकिएको बाटो हुँदै कङ्कालिनी विद्यालयतर्फ जानुहोस्।',
        'बाँधका थप ढोका खोल्न सक्ने भएकाले आपतकालीन सूचना तथा रेडियो सुन्दै गर्नुहोस्।',
      ],
      strandedProtocol: [
        'If river surges unexpectedly, turn immediately to the nearest high flood bund levee.',
        'Never cross wooden suspension bridges if water has reached within 1 meter of the span.',
        'Keep emergency helpline numbers (1155 / 100 / 1114) on speed dial.',
      ],
      strandedProtocolNepali: [
        'यदि नदी अचानक उर्लेर आयो भने तुरुन्तै नजिकैको उच्च तटबन्धतर्फ लाग्नुहोस्।',
        'पानीको बहाव पुलको १ मिटर नजिक आइसकेको छ भने झोलुङ्गे वा काठे पुल नतर्नुहोस्।',
        'आपतकालीन हटलाइन नम्बरहरू (११५५ / १०० / १११४) मोबाइलमा तयारी अवस्थामा राख्नुहोस्।',
      ],
      contacts,
    };
  }
}
