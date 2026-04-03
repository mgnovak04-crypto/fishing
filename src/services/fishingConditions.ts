import type { WeatherData, MarineData, MoonData, FishingConditions, ConditionFactor } from '../types';
import { fishSpecies } from '../data/fishSpecies';
import { getMoonFishingRating } from './moonService';

export function calculateFishingConditions(
  weather: WeatherData,
  marine: MarineData | null,
  moon: MoonData,
  sunrise: string,
  sunset: string
): FishingConditions {
  const factors: ConditionFactor[] = [];

  // 1. Barometric Pressure (one of the most important factors)
  const pressureScore = calculatePressureScore(weather.pressure, weather.pressureTrend);
  factors.push({
    name: 'Barometric Pressure',
    value: pressureScore,
    label: getPressureLabel(weather.pressure, weather.pressureTrend),
    description: getPressureDescription(weather.pressure, weather.pressureTrend),
    icon: '🔵',
  });

  // 2. Wind Conditions
  const windScore = calculateWindScore(weather.windSpeed, weather.windGusts);
  factors.push({
    name: 'Wind',
    value: windScore,
    label: getWindLabel(weather.windSpeed),
    description: getWindDescription(weather.windSpeed, weather.windGusts),
    icon: '💨',
  });

  // 3. Cloud Cover & Light
  const cloudScore = calculateCloudScore(weather.cloudCover);
  factors.push({
    name: 'Cloud Cover',
    value: cloudScore,
    label: getCloudLabel(weather.cloudCover),
    description: getCloudDescription(weather.cloudCover),
    icon: '☁️',
  });

  // 4. Precipitation
  const precipScore = calculatePrecipScore(weather.precipitation, weather.weatherCode);
  factors.push({
    name: 'Precipitation',
    value: precipScore,
    label: getPrecipLabel(weather.precipitation),
    description: getPrecipDescription(weather.precipitation),
    icon: '🌧️',
  });

  // 5. Temperature
  const tempScore = calculateTempScore(weather.temperature);
  factors.push({
    name: 'Temperature',
    value: tempScore,
    label: `${weather.temperature}°C`,
    description: getTempDescription(weather.temperature),
    icon: '🌡️',
  });

  // 6. Moon Phase
  const moonRating = getMoonFishingRating(moon);
  factors.push({
    name: 'Moon Phase',
    value: moonRating.score,
    label: `${moon.phase} ${moon.emoji}`,
    description: moonRating.description,
    icon: moon.emoji,
  });

  // 7. Water Conditions (if marine data available)
  if (marine && marine.waveHeight > 0) {
    const waterScore = calculateWaterScore(marine);
    factors.push({
      name: 'Sea Conditions',
      value: waterScore,
      label: getWaterLabel(marine),
      description: getWaterDescription(marine),
      icon: '🌊',
    });
  }

  // Calculate overall score (weighted average)
  const weights: Record<string, number> = {
    'Barometric Pressure': 0.25,
    'Wind': 0.15,
    'Cloud Cover': 0.1,
    'Precipitation': 0.1,
    'Temperature': 0.15,
    'Moon Phase': 0.1,
    'Sea Conditions': 0.15,
  };

  let totalWeight = 0;
  let weightedSum = 0;
  for (const factor of factors) {
    const w = weights[factor.name] || 0.1;
    weightedSum += factor.value * w;
    totalWeight += w;
  }

  const overall = Math.round(weightedSum / totalWeight);
  const label = getOverallLabel(overall);
  const color = getOverallColor(overall);

  // Determine best fishing times
  const bestTimes = calculateBestTimes(sunrise, sunset, weather, moon);

  // Determine recommendations
  const recommendations = generateRecommendations(weather, marine, moon);

  // Determine active species
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const activeSpecies = fishSpecies
    .filter(sp => {
      if (sp.season.start <= sp.season.end) {
        return currentMonth >= sp.season.start && currentMonth <= sp.season.end;
      }
      return currentMonth >= sp.season.start || currentMonth <= sp.season.end;
    })
    .map(sp => sp.id);

  return { overall, label, color, factors, bestTimes, recommendations, activeSpecies };
}

function calculatePressureScore(pressure: number, trend: string): number {
  // Ideal: 1010-1020 hPa, slightly falling or stable
  let score = 50;
  if (pressure >= 1005 && pressure <= 1025) score = 70;
  if (pressure >= 1010 && pressure <= 1020) score = 85;

  if (trend === 'falling') score += 10; // Falling pressure often triggers feeding
  if (trend === 'rising') score -= 5;

  return Math.min(100, Math.max(0, score));
}

function getPressureLabel(pressure: number, trend: string): string {
  const arrow = trend === 'rising' ? '↑' : trend === 'falling' ? '↓' : '→';
  return `${pressure.toFixed(0)} hPa ${arrow}`;
}

function getPressureDescription(pressure: number, trend: string): string {
  if (trend === 'falling') {
    return 'Falling pressure — fish often feed actively before a weather change. Excellent conditions.';
  }
  if (trend === 'rising') {
    return 'Rising pressure — fish may be less active initially but conditions improving.';
  }
  if (pressure >= 1010 && pressure <= 1020) {
    return 'Stable, moderate pressure — consistent fishing conditions.';
  }
  if (pressure > 1025) {
    return 'High pressure — clear skies may push fish deeper. Try early morning or dusk.';
  }
  return 'Low pressure — stormy conditions may reduce activity but some species feed aggressively.';
}

function calculateWindScore(speed: number, _gusts: number): number {
  // Light wind (5-15 km/h) is ideal — creates surface chop
  if (speed < 3) return 60; // Too calm
  if (speed <= 15) return 90; // Ideal
  if (speed <= 25) return 70; // Moderate
  if (speed <= 35) return 40; // Challenging
  return 15; // Dangerous
}

function getWindLabel(speed: number): string {
  if (speed < 5) return 'Calm';
  if (speed <= 15) return 'Light breeze';
  if (speed <= 25) return 'Moderate';
  if (speed <= 35) return 'Strong';
  return 'Very strong';
}

function getWindDescription(speed: number, gusts: number): string {
  if (speed < 3) return 'Very calm — flat water may make fish spooky. Ideal for fly fishing on lakes.';
  if (speed <= 15) return 'Light breeze creates ideal surface chop, breaking up your silhouette and pushing baitfish.';
  if (speed <= 25) return 'Moderate wind — fishable but challenging for boat control. Wind-blown banks can be productive.';
  if (speed <= 35) return 'Strong wind — shore fishing on sheltered side recommended. Boat fishing risky.';
  return `Dangerous conditions (gusts ${gusts} km/h). Stay off the water.`;
}

function calculateCloudScore(cover: number): number {
  // Overcast is generally best for fishing
  if (cover >= 60 && cover <= 90) return 90;
  if (cover >= 40 && cover <= 95) return 75;
  if (cover >= 20) return 60;
  return 45; // Full sun
}

function getCloudLabel(cover: number): string {
  if (cover < 20) return 'Clear';
  if (cover < 50) return 'Partly cloudy';
  if (cover < 80) return 'Mostly cloudy';
  return 'Overcast';
}

function getCloudDescription(cover: number): string {
  if (cover < 20) return 'Clear skies — bright conditions may push fish deeper. Best at dawn and dusk.';
  if (cover < 50) return 'Partly cloudy — good conditions with periods of shade stimulating fish activity.';
  if (cover < 80) return 'Mostly cloudy — excellent! Reduced light encourages fish to feed in shallower water.';
  return 'Overcast — ideal for fishing. Fish are less wary and feed throughout the day.';
}

function calculatePrecipScore(precip: number, _code: number): number {
  if (precip === 0) return 65;
  if (precip < 1) return 85; // Light rain is excellent
  if (precip < 4) return 70; // Moderate rain
  if (precip < 10) return 45; // Heavy rain
  return 20; // Torrential
}

function getPrecipLabel(precip: number): string {
  if (precip === 0) return 'Dry';
  if (precip < 1) return 'Light';
  if (precip < 4) return 'Moderate';
  return 'Heavy';
}

function getPrecipDescription(precip: number): string {
  if (precip === 0) return 'Dry conditions — no rain to wash insects into the water.';
  if (precip < 1) return 'Light rain — excellent! Breaks surface tension, washes food into water, and provides cover.';
  if (precip < 4) return 'Moderate rain — good fishing conditions. Rising water levels can trigger feeding.';
  return 'Heavy rain — may muddy water and reduce visibility. Fishing can be tough but post-rain is often excellent.';
}

function calculateTempScore(temp: number): number {
  // For Norway, moderate temps are best
  if (temp >= 8 && temp <= 18) return 85;
  if (temp >= 4 && temp <= 22) return 70;
  if (temp >= 0 && temp <= 25) return 55;
  return 35;
}

function getTempDescription(temp: number): string {
  if (temp < 0) return 'Below freezing — ice fishing conditions. Fish metabolism is slow, use small presentations.';
  if (temp < 5) return 'Cold — fish are sluggish. Slow presentations and deep fishing recommended.';
  if (temp < 10) return 'Cool — good for cold-water species like char and cod. Trout becoming active.';
  if (temp < 18) return 'Ideal temperature range for most Norwegian sport fish. Peak activity expected.';
  if (temp < 22) return 'Warm — fish early and late. Fish may seek cooler, deeper water midday.';
  return 'Hot for Norway — fish deep and during low-light periods. Water oxygen levels may be low.';
}

function calculateWaterScore(marine: MarineData): number {
  let score = 70;
  if (marine.waveHeight < 0.5) score += 15;
  else if (marine.waveHeight < 1.5) score += 5;
  else if (marine.waveHeight < 3) score -= 15;
  else score -= 35;

  if (marine.waterTemperature >= 6 && marine.waterTemperature <= 14) score += 10;

  return Math.min(100, Math.max(0, score));
}

function getWaterLabel(marine: MarineData): string {
  if (marine.waveHeight < 0.5) return `Calm (${marine.waveHeight}m)`;
  if (marine.waveHeight < 1.5) return `Slight (${marine.waveHeight}m)`;
  if (marine.waveHeight < 3) return `Moderate (${marine.waveHeight}m)`;
  return `Rough (${marine.waveHeight}m)`;
}

function getWaterDescription(marine: MarineData): string {
  let desc = `Waves: ${marine.waveHeight}m. Water temp: ${marine.waterTemperature}°C.`;
  if (marine.waveHeight < 0.5) desc += ' Calm seas — ideal for boat fishing.';
  else if (marine.waveHeight < 1.5) desc += ' Slight swell — good conditions for most fishing.';
  else if (marine.waveHeight < 3) desc += ' Moderate seas — experienced boaters only.';
  else desc += ' Rough seas — stay on shore or in sheltered fjords.';
  return desc;
}

function getOverallLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Poor';
  return 'Very Poor';
}

function getOverallColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 65) return '#84cc16';
  if (score >= 50) return '#eab308';
  if (score >= 35) return '#f97316';
  return '#ef4444';
}

function calculateBestTimes(
  sunrise: string,
  sunset: string,
  weather: WeatherData,
  moon: MoonData
): string[] {
  const times: string[] = [];

  if (sunrise) {
    const sr = new Date(sunrise);
    const beforeSr = new Date(sr.getTime() - 60 * 60000);
    const afterSr = new Date(sr.getTime() + 90 * 60000);
    times.push(`Dawn: ${formatTime(beforeSr)} - ${formatTime(afterSr)}`);
  }

  if (sunset) {
    const ss = new Date(sunset);
    const beforeSs = new Date(ss.getTime() - 90 * 60000);
    const afterSs = new Date(ss.getTime() + 60 * 60000);
    times.push(`Dusk: ${formatTime(beforeSs)} - ${formatTime(afterSs)}`);
  }

  if (weather.cloudCover > 70) {
    times.push('Overcast: Good fishing throughout the day');
  }

  if (weather.pressureTrend === 'falling') {
    times.push('Pressure dropping: Fish now before the front arrives');
  }

  const phase = moon.phase.toLowerCase();
  if (phase.includes('new') || phase.includes('full')) {
    times.push(`${moon.phase}: Major feeding period expected`);
  }

  return times;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
}

function generateRecommendations(
  weather: WeatherData,
  marine: MarineData | null,
  moon: MoonData
): string[] {
  const recs: string[] = [];

  // Pressure-based
  if (weather.pressureTrend === 'falling') {
    recs.push('Barometric pressure is falling — one of the strongest triggers for fish feeding. Get out on the water!');
  } else if (weather.pressure > 1025) {
    recs.push('High pressure means clear skies — fish deeper water and focus on dawn/dusk windows.');
  }

  // Wind-based
  if (weather.windSpeed > 25) {
    recs.push('Strong winds — fish sheltered shores or the windward bank where food accumulates.');
  } else if (weather.windSpeed >= 5 && weather.windSpeed <= 15) {
    recs.push('Light breeze is creating ideal surface chop — excellent for topwater and shallow fishing.');
  }

  // Overcast/rain
  if (weather.cloudCover > 70 && weather.precipitation < 2) {
    recs.push('Overcast with light precipitation — fish should be active at all depths throughout the day.');
  }

  // Temperature
  if (weather.temperature < 5) {
    recs.push('Cold conditions — slow down your retrieve and use smaller presentations. Fish are lethargic.');
  } else if (weather.temperature > 20) {
    recs.push('Warm day — fish early morning or late evening. Seek shaded areas and deeper water.');
  }

  // Marine
  if (marine && marine.waveHeight > 2) {
    recs.push('Rough seas — consider fishing in sheltered fjord arms or switch to freshwater.');
  }

  // Moon
  const phase = moon.phase.toLowerCase();
  if (phase.includes('new') || phase.includes('full')) {
    recs.push(`${moon.phase} tonight — expect stronger tidal movement and increased fish activity.`);
  }

  // General Norwegian tips
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 8) {
    recs.push('Summer in Norway — take advantage of the midnight sun for extended fishing hours.');
  }
  if (month >= 1 && month <= 3) {
    recs.push('Winter fishing — target cod along the coast. The skrei migration is underway in northern Norway.');
  }

  return recs.slice(0, 5);
}
