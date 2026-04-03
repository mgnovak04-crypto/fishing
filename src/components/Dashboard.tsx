import type { WeatherData, DailyForecast, HourlyForecast, MarineData, MoonData, FishingConditions } from '../types';
import { getWeatherDescription, getWeatherIcon, getWindDirection } from '../services/weatherApi';

interface DashboardProps {
  weather: WeatherData;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  marine: MarineData | null;
  moon: MoonData;
  conditions: FishingConditions;
  locationName: string | null;
}

export function Dashboard({ weather, daily, hourly, marine, moon, conditions, locationName }: DashboardProps) {
  return (
    <div className="dashboard">
      {/* Fishing Score Hero */}
      <div className="score-hero" style={{ borderColor: conditions.color }}>
        <div className="score-circle" style={{ background: `conic-gradient(${conditions.color} ${conditions.overall * 3.6}deg, #1e293b ${conditions.overall * 3.6}deg)` }}>
          <div className="score-inner">
            <span className="score-number">{conditions.overall}</span>
            <span className="score-label">{conditions.label}</span>
          </div>
        </div>
        <div className="score-info">
          <h2>Fishing Conditions</h2>
          {locationName && <p className="location-name">{locationName}</p>}
          <p className="score-summary">
            {conditions.overall >= 70
              ? 'Great day to go fishing!'
              : conditions.overall >= 50
              ? 'Decent conditions — focus on prime times.'
              : 'Challenging conditions — pick your spots carefully.'}
          </p>
        </div>
      </div>

      {/* Best Times */}
      <div className="card">
        <h3>Best Fishing Times Today</h3>
        <div className="best-times">
          {conditions.bestTimes.map((time, i) => (
            <div key={i} className="time-item">
              <span className="time-dot" style={{ background: conditions.color }} />
              {time}
            </div>
          ))}
        </div>
      </div>

      {/* Current Weather */}
      <div className="card">
        <h3>Current Weather</h3>
        <div className="weather-current">
          <div className="weather-main">
            <span className="weather-icon-large">{getWeatherIcon(weather.weatherCode, weather.isDay)}</span>
            <div>
              <span className="temp-large">{weather.temperature.toFixed(1)}°C</span>
              <span className="weather-desc">{getWeatherDescription(weather.weatherCode)}</span>
            </div>
          </div>
          <div className="weather-grid">
            <WeatherStat label="Feels Like" value={`${weather.feelsLike.toFixed(1)}°C`} />
            <WeatherStat label="Humidity" value={`${weather.humidity}%`} />
            <WeatherStat label="Pressure" value={`${weather.pressure.toFixed(0)} hPa`} extra={weather.pressureTrend === 'falling' ? '↓ Falling' : weather.pressureTrend === 'rising' ? '↑ Rising' : '→ Stable'} />
            <WeatherStat label="Wind" value={`${weather.windSpeed.toFixed(1)} km/h`} extra={getWindDirection(weather.windDirection)} />
            <WeatherStat label="Gusts" value={`${weather.windGusts.toFixed(1)} km/h`} />
            <WeatherStat label="Cloud Cover" value={`${weather.cloudCover}%`} />
            <WeatherStat label="Precipitation" value={`${weather.precipitation} mm`} />
            <WeatherStat label="UV Index" value={`${weather.uvIndex}`} />
          </div>
        </div>
      </div>

      {/* Condition Factors */}
      <div className="card">
        <h3>Fishing Factor Analysis</h3>
        <div className="factors-list">
          {conditions.factors.map((factor) => (
            <div key={factor.name} className="factor-item">
              <div className="factor-header">
                <span className="factor-icon">{factor.icon}</span>
                <span className="factor-name">{factor.name}</span>
                <span className="factor-label">{factor.label}</span>
                <span className="factor-score" style={{ color: getScoreColor(factor.value) }}>
                  {factor.value}/100
                </span>
              </div>
              <div className="factor-bar">
                <div className="factor-bar-fill" style={{ width: `${factor.value}%`, background: getScoreColor(factor.value) }} />
              </div>
              <p className="factor-desc">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marine Data */}
      {marine && marine.waveHeight > 0 && (
        <div className="card">
          <h3>Marine Conditions</h3>
          <div className="weather-grid">
            <WeatherStat label="Wave Height" value={`${marine.waveHeight}m`} />
            <WeatherStat label="Wave Period" value={`${marine.wavePeriod}s`} />
            <WeatherStat label="Water Temp" value={`${marine.waterTemperature}°C`} />
            <WeatherStat label="Current" value={`${marine.currentSpeed} km/h`} />
          </div>
        </div>
      )}

      {/* Moon Phase */}
      <div className="card">
        <h3>Moon Phase</h3>
        <div className="moon-section">
          <span className="moon-icon">{moon.emoji}</span>
          <div className="moon-info">
            <p className="moon-phase">{moon.phase}</p>
            <p className="moon-illum">{moon.illumination}% illuminated</p>
            {moon.moonrise && <p>Moonrise: {moon.moonrise} | Moonset: {moon.moonset}</p>}
          </div>
        </div>
      </div>

      {/* Sunrise/Sunset */}
      {daily[0] && (
        <div className="card">
          <h3>Sun Times</h3>
          <div className="sun-times">
            <div className="sun-item">
              <span>🌅</span>
              <span>Sunrise</span>
              <span>{new Date(daily[0].sunrise).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="sun-item">
              <span>🌇</span>
              <span>Sunset</span>
              <span>{new Date(daily[0].sunset).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="sun-item">
              <span>🕐</span>
              <span>Daylight</span>
              <span>{calculateDaylight(daily[0].sunrise, daily[0].sunset)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card recommendations">
        <h3>Angler's Tips</h3>
        <ul>
          {conditions.recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* 7-Day Forecast */}
      <div className="card">
        <h3>7-Day Forecast</h3>
        <div className="forecast-scroll">
          {daily.map((day) => (
            <div key={day.date} className="forecast-day">
              <span className="forecast-date">{formatDay(day.date)}</span>
              <span className="forecast-icon">{getWeatherIcon(day.weatherCode, true)}</span>
              <span className="forecast-temps">
                <span className="temp-high">{day.tempMax.toFixed(0)}°</span>
                <span className="temp-low">{day.tempMin.toFixed(0)}°</span>
              </span>
              <span className="forecast-wind">{day.windSpeedMax.toFixed(0)} km/h</span>
              <span className="forecast-precip">{day.precipitationSum.toFixed(1)}mm</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Pressure Chart (text-based) */}
      <div className="card">
        <h3>Pressure Trend (Next 24h)</h3>
        <div className="pressure-chart">
          {hourly.slice(0, 24).filter((_, i) => i % 3 === 0).map((h) => {
            const time = new Date(h.time);
            const barWidth = Math.max(5, ((h.pressure - 980) / 50) * 100);
            return (
              <div key={h.time} className="pressure-row">
                <span className="pressure-time">{time.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="pressure-bar-container">
                  <div className="pressure-bar" style={{ width: `${barWidth}%` }} />
                </div>
                <span className="pressure-value">{h.pressure.toFixed(0)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeatherStat({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <div className="weather-stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {extra && <span className="stat-extra">{extra}</span>}
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function calculateDaylight(sunrise: string, sunset: string): string {
  const sr = new Date(sunrise);
  const ss = new Date(sunset);
  const diff = ss.getTime() - sr.getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}
