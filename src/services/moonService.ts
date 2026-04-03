import type { MoonData } from '../types';

export function calculateMoonPhase(date: Date = new Date()): MoonData {
  // Synodic month calculation
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let jd = 0;
  let b = 0;

  if (month <= 2) {
    const y = year - 1;
    const m = month + 12;
    const a = Math.floor(y / 100);
    b = 2 - a + Math.floor(a / 4);
    jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  } else {
    const a = Math.floor(year / 100);
    b = 2 - a + Math.floor(a / 4);
    jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
  }

  const daysSinceNew = jd - 2451550.1;
  const newMoons = daysSinceNew / 29.530588853;
  const fraction = newMoons - Math.floor(newMoons);
  const daysInCycle = fraction * 29.530588853;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * fraction)) / 2 * 100);

  let phase: string;
  let emoji: string;

  if (daysInCycle < 1.85) {
    phase = 'New Moon'; emoji = '🌑';
  } else if (daysInCycle < 7.38) {
    phase = 'Waxing Crescent'; emoji = '🌒';
  } else if (daysInCycle < 9.23) {
    phase = 'First Quarter'; emoji = '🌓';
  } else if (daysInCycle < 14.77) {
    phase = 'Waxing Gibbous'; emoji = '🌔';
  } else if (daysInCycle < 16.61) {
    phase = 'Full Moon'; emoji = '🌕';
  } else if (daysInCycle < 22.15) {
    phase = 'Waning Gibbous'; emoji = '🌖';
  } else if (daysInCycle < 24.0) {
    phase = 'Last Quarter'; emoji = '🌗';
  } else {
    phase = 'Waning Crescent'; emoji = '🌘';
  }

  // Approximate moonrise/moonset (simplified)
  const hourOffset = Math.round(daysInCycle * 0.8) % 24;
  const moonriseHour = (18 + hourOffset) % 24;
  const moonsetHour = (6 + hourOffset) % 24;

  return {
    phase,
    illumination,
    moonrise: `${moonriseHour.toString().padStart(2, '0')}:00`,
    moonset: `${moonsetHour.toString().padStart(2, '0')}:00`,
    emoji,
  };
}

export function getMoonFishingRating(moon: MoonData): { score: number; description: string } {
  // New moon and full moon are traditionally best for fishing
  // due to stronger tidal influence and fish feeding patterns
  const phase = moon.phase.toLowerCase();

  if (phase.includes('new moon') || phase.includes('full moon')) {
    return {
      score: 90,
      description: 'Excellent — major feeding periods. Strongest tidal movement triggers fish activity.',
    };
  }
  if (phase.includes('first quarter') || phase.includes('last quarter')) {
    return {
      score: 60,
      description: 'Moderate — minor feeding periods. Weaker tides but fish still active at dawn/dusk.',
    };
  }
  if (phase.includes('gibbous')) {
    return {
      score: 50,
      description: 'Fair — between major periods. Focus on early morning and late evening.',
    };
  }
  return {
    score: 70,
    description: 'Good — crescent phase often produces steady bite throughout the day.',
  };
}
