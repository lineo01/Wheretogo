export type ThreatLevel = 'NORMAL' | 'ALERT' | 'WARNING' | 'CRITICAL';

export interface RiverBasin {
  id: string;
  name: string;
  nameNepali: string;
  district: string;
  riverName: string;
  riverNameNepali: string;
  dangerLevelMeters: number;
  warningLevelMeters: number;
  currentLevelMeters: number;
  normalLevelMeters: number;
  rainfall24hMm: number;
  dischargeCusecs: number;
  barrageGatesOpen: number;
  totalBarrageGates: number;
  rateOfRiseCmHr: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  timeToCrestMinutes: number;
  historicalPeakMeters: number;
}

export interface Settlement {
  id: string;
  basinId: string;
  name: string;
  nameNepali: string;
  ward: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevationMeters: number;
  populationEstimate: number;
  households: number;
  riskTier: ThreatLevel;
}

export interface SafeShelter {
  id: string;
  basinId: string;
  name: string;
  nameNepali: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevationMeters: number;
  capacityPersons: number;
  currentOccupancy: number;
  contactPerson: string;
  contactPhone: string;
  facilities: string[];
  heightAboveRiverMeters: number;
}

export interface RoadNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  isShelter?: boolean;
  isOrigin?: boolean;
}

export interface RoadSegment {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  name: string;
  nameNepali: string;
  distanceMeters: number;
  roadType: 'paved' | 'causeway_bridge' | 'embankment_bund' | 'dirt_trail';
  submergenceThresholdMeters: number; // river level at which this road gets flooded
  elevationMeters: number;
  isBridge?: boolean;
  isForcedBlocked?: boolean;
}

export interface RouteStep {
  instruction: string;
  instructionNepali: string;
  distanceMeters: number;
  roadName: string;
  roadType: string;
  isSafeHighGround: boolean;
  warningNotice?: string;
}

export interface EvacuationRoute {
  originId: string;
  destinationShelter: SafeShelter;
  steps: RouteStep[];
  totalDistanceMeters: number;
  estimatedWalkMinutes: number;
  isHampered: boolean;
  isRerouted: boolean;
  hamperedReason?: string;
  hamperedLocationName?: string;
  elevationGainMeters: number;
  pathNodes: RoadNode[];
  googleMapsUrl: string;
}

export interface Citizen {
  id: string;
  basinId: string;
  name: string;
  nameNepali: string;
  ward: number;
  settlementName: string;
  phone: string;
  familyMembers: number;
  vulnerability: ('elderly' | 'infant' | 'pregnant' | 'disabled' | 'livestock')[];
  evacuationStatus: 'NOTIFIED' | 'EN_ROUTE' | 'AT_SHELTER' | 'RESCUE_NEEDED';
  lastNotifiedAt?: string;
}

export interface DispatchedAlert {
  id: string;
  citizenId: string;
  citizenName: string;
  phone: string;
  ward: number;
  basinName: string;
  channel: 'SMS' | 'WHATSAPP';
  sentTimestamp: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
  evacuationStatus: 'NOTIFIED' | 'EN_ROUTE' | 'AT_SHELTER' | 'RESCUE_NEEDED';
  assignedShelterName: string;
  googleMapsUrl: string;
  messageNepali: string;
  messageEnglish: string;
}
