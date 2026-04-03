export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  pressureTrend: 'rising' | 'falling' | 'stable';
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  cloudCover: number;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  windSpeedMax: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  pressure: number;
  windSpeed: number;
  precipitation: number;
  cloudCover: number;
  weatherCode: number;
}

export interface MarineData {
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  waterTemperature: number;
  currentSpeed: number;
  currentDirection: number;
}

export interface MoonData {
  phase: string;
  illumination: number;
  moonrise: string | null;
  moonset: string | null;
  emoji: string;
}

export interface TideData {
  time: string;
  height: number;
  type: 'high' | 'low';
}

export interface FishSpecies {
  id: string;
  name: string;
  norwegianName: string;
  scientificName: string;
  image: string;
  habitat: 'freshwater' | 'saltwater' | 'both';
  waterTypes: string[];
  season: { start: number; end: number; peak: number[] };
  preferredTemp: { min: number; max: number; ideal: number };
  preferredDepth: string;
  preferredConditions: string[];
  techniques: string[];
  bestTimeOfDay: string[];
  moonPreference: string;
  pressurePreference: string;
  description: string;
  tips: string[];
  regions: string[];
  minSize: number;
  regulations: string;
}

export interface FishingSpot {
  id: string;
  name: string;
  coordinates: Coordinates;
  waterType: 'lake' | 'river' | 'fjord' | 'coast' | 'sea';
  region: string;
  species: string[];
  description: string;
  tips: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  accessibility: string;
  bestSeason: string;
  imageUrl?: string;
  // Detailed fields (optional for backwards compatibility)
  depth?: { max: number; average: number; unit: string };
  area?: number; // km²
  elevation?: number; // meters above sea level
  hotspots?: HotspotZone[];
  speciesDetail?: SpotSpeciesInfo[];
  structure?: string[];
  bottomType?: string;
  waterClarity?: string;
  regulations?: string;
  permitInfo?: string;
  nearestTown?: string;
  parkingInfo?: string;
  boatAccess?: string;
}

export interface HotspotZone {
  name: string;
  description: string;
  coordinates?: Coordinates;
  targetSpecies: string[];
  techniques: string[];
  bestTime: string;
  depthRange?: string;
}

export interface SpotSpeciesInfo {
  speciesId: string;
  abundance: 'common' | 'moderate' | 'occasional' | 'rare';
  averageSize: string;
  recordSize?: string;
  localTechniques: string[];
  localTips: string;
  bestMonths: number[];
  depthRange: string;
}

export interface FishingConditions {
  overall: number; // 0-100
  label: string;
  color: string;
  factors: ConditionFactor[];
  bestTimes: string[];
  recommendations: string[];
  activeSpecies: string[];
}

export interface ConditionFactor {
  name: string;
  value: number; // 0-100
  label: string;
  description: string;
  icon: string;
}

export type ViewMode = 'dashboard' | 'map' | 'species' | 'spots';
