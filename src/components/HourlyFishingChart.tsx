import type { HourlyForecast, MoonData } from '../types';
import { calculateMoonPhase } from '../services/moonService';
import { getMoonFishingRating } from '../services/moonService';

interface HourlyFishingChartProps {
  hourly: HourlyForecast[];
  sunrise: string;
  sunset: string;
}

export function HourlyFishingChart({ hourly, sunrise, sunset }: HourlyFishingChartProps) {
  const next24 = hourly.slice(0, 24);
  if (next24.length === 0) return null;

  const sunriseHour = sunrise ? new Date(sunrise).getHours() : 6;
  const sunsetHour = sunset ? new Date(sunset).getHours() : 20;
  const moon: MoonData = calculateMoonPhase();
  const moonRating = getMoonFishingRating(moon);

  const scores = next24.map(h => {
    const time = new Date(h.time);
    const hour = time.getHours();
    let score = 50;

    // Time of day — dawn/dusk are prime
    const isGoldenHour =
      (hour >= sunriseHour - 1 && hour <= sunriseHour + 1) ||
      (hour >= sunsetHour - 1 && hour <= sunsetHour + 1);
    const isNearGolden =
      (hour >= sunriseHour - 2 && hour <= sunriseHour + 2) ||
      (hour >= sunsetHour - 2 && hour <= sunsetHour + 2);

    if (isGoldenHour) score += 25;
    else if (isNearGolden) score += 15;
    else if (hour >= 11 && hour <= 14) score -= 10;

    // Pressure
    if (h.pressure >= 1010 && h.pressure <= 1020) score += 10;
    // Check trend from previous hours
    const idx = next24.indexOf(h);
    if (idx >= 3) {
      const prevPressure = next24[idx - 3].pressure;
      if (h.pressure < prevPressure - 0.5) score += 12; // Falling
    }

    // Cloud cover — overcast is good
    if (h.cloudCover >= 60 && h.cloudCover <= 90) score += 10;
    else if (h.cloudCover < 20) score -= 5;

    // Wind
    if (h.windSpeed >= 5 && h.windSpeed <= 15) score += 8;
    else if (h.windSpeed > 30) score -= 15;

    // Light rain
    if (h.precipitation > 0 && h.precipitation < 2) score += 8;
    else if (h.precipitation > 5) score -= 10;

    // Moon influence
    score += Math.round((moonRating.score - 50) * 0.15);

    return {
      hour,
      score: Math.min(100, Math.max(0, score)),
      time: time.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
      temp: h.temperature,
      wind: h.windSpeed,
      precip: h.precipitation,
      isGoldenHour,
    };
  });

  const maxScore = Math.max(...scores.map(s => s.score));

  return (
    <div className="card">
      <h3>Fishing Activity Forecast — Next 24 Hours</h3>
      <p className="chart-subtitle">
        Higher bars = better fishing. Gold bars mark dawn/dusk prime windows.
      </p>

      <div className="hourly-chart">
        {scores.map((s, i) => {
          const height = Math.max(8, (s.score / maxScore) * 100);
          return (
            <div key={i} className="chart-bar-container">
              <div className="chart-score">{s.score}</div>
              <div
                className={`chart-bar ${s.isGoldenHour ? 'golden' : ''}`}
                style={{
                  height: `${height}%`,
                  background: getBarColor(s.score),
                }}
                title={`${s.time}: Score ${s.score} | ${s.temp.toFixed(0)}°C | Wind ${s.wind.toFixed(0)}km/h`}
              />
              <div className="chart-time">{s.hour}:00</div>
            </div>
          );
        })}
      </div>

      <div className="chart-legend">
        <span><span className="legend-bar excellent" /> 70+ Excellent</span>
        <span><span className="legend-bar good" /> 50-70 Good</span>
        <span><span className="legend-bar fair" /> 30-50 Fair</span>
        <span><span className="legend-bar golden-legend" /> Dawn/Dusk</span>
      </div>
    </div>
  );
}

function getBarColor(score: number): string {
  if (score >= 70) return 'linear-gradient(to top, #16a34a, #22c55e)';
  if (score >= 50) return 'linear-gradient(to top, #65a30d, #84cc16)';
  if (score >= 30) return 'linear-gradient(to top, #ca8a04, #eab308)';
  return 'linear-gradient(to top, #c2410c, #f97316)';
}
