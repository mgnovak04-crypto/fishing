import type { Coordinates, WeatherData, MarineData, MoonData, FishingSpot } from '../types';
import { fishSpecies } from '../data/fishSpecies';
import { fishingSpots } from '../data/fishingSpots';
import { getWindDirection } from '../services/weatherApi';

interface NearbySpot extends FishingSpot {
  distance: number;
  bearing: string;
}

interface ActiveSpeciesInfo {
  id: string;
  name: string;
  norwegianName: string;
  image: string;
  matchScore: number;
  matchReasons: string[];
  techniques: string[];
  bestTimeOfDay: string[];
  tips: string;
}

interface TacticalAdvice {
  positioning: string[];
  structure: string[];
  depthAdvice: string;
  windAdvice: string;
  timeAdvice: string;
}

export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

function calculateBearing(from: Coordinates, to: Coordinates): string {
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x = Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(bearing / 45) % 8];
}

export function getNearbySpots(coords: Coordinates, limit: number = 5): NearbySpot[] {
  return fishingSpots
    .map(spot => ({
      ...spot,
      distance: calculateDistance(coords, spot.coordinates),
      bearing: calculateBearing(coords, spot.coordinates),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export function getActiveSpeciesWithScoring(
  weather: WeatherData,
  marine: MarineData | null,
  moon: MoonData,
): ActiveSpeciesInfo[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentHour = now.getHours();

  return fishSpecies
    .filter(sp => {
      if (sp.season.start <= sp.season.end) {
        return currentMonth >= sp.season.start && currentMonth <= sp.season.end;
      }
      return currentMonth >= sp.season.start || currentMonth <= sp.season.end;
    })
    .map(sp => {
      let matchScore = 50;
      const matchReasons: string[] = [];

      // Peak season bonus
      if (sp.season.peak.includes(currentMonth)) {
        matchScore += 15;
        matchReasons.push('Peak season right now');
      }

      // Temperature match
      const waterTemp = marine?.waterTemperature || estimateWaterTemp(weather.temperature);
      if (waterTemp >= sp.preferredTemp.min && waterTemp <= sp.preferredTemp.max) {
        const idealDist = Math.abs(waterTemp - sp.preferredTemp.ideal);
        if (idealDist <= 2) {
          matchScore += 20;
          matchReasons.push(`Water temp near ideal (${sp.preferredTemp.ideal}°C)`);
        } else {
          matchScore += 10;
          matchReasons.push('Water temperature in range');
        }
      } else {
        matchScore -= 10;
        matchReasons.push(`Water temp outside preferred ${sp.preferredTemp.min}-${sp.preferredTemp.max}°C`);
      }

      // Pressure preference
      if (sp.pressurePreference.toLowerCase().includes('falling') && weather.pressureTrend === 'falling') {
        matchScore += 15;
        matchReasons.push('Falling pressure — this species responds well');
      } else if (sp.pressurePreference.toLowerCase().includes('stable') && weather.pressureTrend === 'stable') {
        matchScore += 10;
        matchReasons.push('Stable pressure suits this species');
      } else if (sp.pressurePreference.toLowerCase().includes('high') && weather.pressure > 1020) {
        matchScore += 10;
        matchReasons.push('High pressure conditions preferred');
      }

      // Cloud cover — most fish prefer overcast
      if (weather.cloudCover > 60 && sp.preferredConditions.some(c => c.toLowerCase().includes('overcast') || c.toLowerCase().includes('cloud'))) {
        matchScore += 10;
        matchReasons.push('Overcast conditions — increased activity expected');
      }

      // Time of day
      const isGoldenHour = (currentHour >= 4 && currentHour <= 8) || (currentHour >= 18 && currentHour <= 22);
      const isMidDay = currentHour >= 10 && currentHour <= 15;
      if (isGoldenHour && sp.bestTimeOfDay.some(t => t.includes('dawn') || t.includes('dusk') || t.includes('morning') || t.includes('evening'))) {
        matchScore += 10;
        matchReasons.push('Prime time of day for this species');
      } else if (isMidDay && sp.bestTimeOfDay.some(t => t.includes('midday') || t.includes('all day'))) {
        matchScore += 5;
        matchReasons.push('Active during midday');
      }

      // Moon phase
      const moonPhase = moon.phase.toLowerCase();
      if (sp.moonPreference.toLowerCase().includes('new') && moonPhase.includes('new')) {
        matchScore += 8;
        matchReasons.push('New moon boosts activity');
      }
      if (sp.moonPreference.toLowerCase().includes('full') && moonPhase.includes('full')) {
        matchScore += 8;
        matchReasons.push('Full moon boosts activity');
      }

      // Wind conditions
      if (weather.windSpeed >= 5 && weather.windSpeed <= 15 && sp.preferredConditions.some(c => c.toLowerCase().includes('breeze') || c.toLowerCase().includes('wind'))) {
        matchScore += 5;
        matchReasons.push('Light wind creates favorable conditions');
      }

      // Light rain bonus
      if (weather.precipitation > 0 && weather.precipitation < 2 && sp.preferredConditions.some(c => c.toLowerCase().includes('rain'))) {
        matchScore += 8;
        matchReasons.push('Light rain triggers feeding');
      }

      return {
        id: sp.id,
        name: sp.name,
        norwegianName: sp.norwegianName,
        image: sp.image,
        matchScore: Math.min(100, Math.max(0, matchScore)),
        matchReasons,
        techniques: sp.techniques,
        bestTimeOfDay: sp.bestTimeOfDay,
        tips: sp.tips[Math.floor(Math.random() * sp.tips.length)],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

function estimateWaterTemp(airTemp: number): number {
  // Rough estimate: water lags behind air and is generally cooler
  return Math.max(1, airTemp - 3);
}

export function getTacticalAdvice(
  weather: WeatherData,
  _marine: MarineData | null,
  _moon: MoonData,
): TacticalAdvice {
  const windDir = getWindDirection(weather.windDirection);
  const oppositeDir = getOppositeDirection(windDir);
  const hour = new Date().getHours();
  const positioning: string[] = [];
  const structure: string[] = [];

  // Wind-based positioning
  if (weather.windSpeed >= 5 && weather.windSpeed <= 25) {
    positioning.push(
      `Wind is from the ${windDir} at ${weather.windSpeed.toFixed(0)} km/h. Fish the ${oppositeDir} shore (windward bank) where wind pushes baitfish and food.`
    );
    positioning.push(
      'Wind lanes concentrate floating insects and plankton — look for foam lines and debris trails on the surface.'
    );
  } else if (weather.windSpeed < 5) {
    positioning.push(
      'Very calm conditions — fish may be spooky in clear water. Use longer casts, lighter line, and stealthy approaches.'
    );
    positioning.push(
      'In calm conditions, focus on shaded areas, overhanging trees, and deeper structure where fish feel secure.'
    );
  } else {
    positioning.push(
      `Strong ${windDir} wind (${weather.windSpeed.toFixed(0)} km/h). Fish sheltered bays, lee shores, or protected fjord arms.`
    );
  }

  // Structure advice
  structure.push('Target points and headlands where current deflects — fish ambush prey at these bottlenecks.');
  structure.push('Inlets and stream mouths bring fresh food and oxygen. Fish congregate here, especially after rain.');
  structure.push('Rocky drop-offs and underwater ledges are fish highways. Work your lure along the depth change.');

  if (weather.precipitation > 0 && weather.precipitation < 5) {
    structure.push('Rain is washing insects and nutrients into the water — focus on river mouths and inlet areas.');
  }

  if (weather.cloudCover > 70) {
    structure.push('Low light lets fish roam shallower. Try shallower flats and weed edges that they avoid in bright sun.');
  }

  // Depth advice
  let depthAdvice: string;
  if (hour >= 5 && hour <= 8) {
    depthAdvice = 'Dawn — fish are moving shallow to feed. Target 1-3m depths, shoreline structure, and surface activity.';
  } else if (hour >= 9 && hour <= 11) {
    depthAdvice = 'Mid-morning — fish transitioning deeper. Work 3-6m depths along drop-offs and weed edges.';
  } else if (hour >= 12 && hour <= 15) {
    depthAdvice = 'Midday — fish are typically deepest. Target 5-15m+ near structure, thermoclines, and shaded areas.';
    if (weather.cloudCover > 70) {
      depthAdvice = 'Midday but overcast — fish may stay shallower than usual. Try 2-6m depths and structure edges.';
    }
  } else if (hour >= 16 && hour <= 19) {
    depthAdvice = 'Afternoon/evening — fish moving shallower for evening feed. Work 2-5m depths and weed lines.';
  } else if (hour >= 20 && hour <= 22) {
    depthAdvice = 'Dusk — prime time. Fish are in the shallows feeding aggressively. Target 1-3m and surface.';
  } else {
    depthAdvice = 'Night fishing — fish by feel near shoreline structure. Darker lures create stronger silhouettes.';
  }

  // Wind advice
  let windAdvice: string;
  if (weather.windSpeed < 3) {
    windAdvice = `Flat calm. Perfect for sight-fishing and topwater lures. Fish can see you — stay low and quiet.`;
  } else if (weather.windSpeed <= 15) {
    windAdvice = `Wind from ${windDir} creating ideal chop. Position yourself upwind and cast downwind toward the ${oppositeDir} shore where food accumulates. The ripple masks your presence.`;
  } else if (weather.windSpeed <= 25) {
    windAdvice = `Moderate ${windDir} wind. Use the wind to drift your boat or float along productive banks. Heavier lures maintain contact with bottom.`;
  } else {
    windAdvice = `Strong ${windDir} wind — safety first. If fishing, stay in sheltered water. Bottom-fish in calm fjord arms or fish river pools.`;
  }

  // Time advice
  let timeAdvice: string;
  if (hour >= 4 && hour <= 7) {
    timeAdvice = 'Golden hour — you\'re out at the best time. Fish are actively feeding in shallow water. Work systematically along the shoreline.';
  } else if (hour >= 8 && hour <= 10) {
    timeAdvice = 'Morning bite may be winding down. Transition to slightly deeper presentations. Cover more water.';
  } else if (hour >= 11 && hour <= 15) {
    timeAdvice = 'Midday lull is common. Slow down, downsize lures, and fish deeper structure. Or take a break and return for the evening bite.';
    if (weather.cloudCover > 70) {
      timeAdvice = 'Midday but overcast skies keep fish active. Don\'t give up — steady action is possible all day in these conditions.';
    }
  } else if (hour >= 16 && hour <= 18) {
    timeAdvice = 'Afternoon — conditions improving. Fish start moving up in the water column. The evening bite is approaching.';
  } else if (hour >= 19 && hour <= 22) {
    timeAdvice = 'Prime evening window. Fish are feeding aggressively. Cover lots of water with active presentations.';
  } else {
    timeAdvice = 'Late night — specialized fishing. Focus on shoreline structure. Noise-making lures and dark colors work best.';
  }

  return { positioning, structure, depthAdvice, windAdvice, timeAdvice };
}

function getOppositeDirection(dir: string): string {
  const opposites: Record<string, string> = {
    'N': 'south', 'NNE': 'south-southwest', 'NE': 'southwest', 'ENE': 'west-southwest',
    'E': 'west', 'ESE': 'west-northwest', 'SE': 'northwest', 'SSE': 'north-northwest',
    'S': 'north', 'SSW': 'north-northeast', 'SW': 'northeast', 'WSW': 'east-northeast',
    'W': 'east', 'WNW': 'east-southeast', 'NW': 'southeast', 'NNW': 'south-southeast',
  };
  return opposites[dir] || 'opposite';
}
