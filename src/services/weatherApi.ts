import type { Coordinates, WeatherData, DailyForecast, HourlyForecast, MarineData } from '../types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';

export async function fetchCurrentWeather(coords: Coordinates): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lng.toString(),
    current: [
      'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
      'surface_pressure', 'wind_speed_10m', 'wind_direction_10m',
      'wind_gusts_10m', 'cloud_cover', 'precipitation', 'weather_code',
      'is_day', 'uv_index'
    ].join(','),
    hourly: 'surface_pressure',
    timezone: 'auto',
    forecast_hours: '6',
    past_hours: '3',
  });

  const res = await fetch(`${OPEN_METEO_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();

  const pressures = data.hourly?.surface_pressure || [];
  let pressureTrend: 'rising' | 'falling' | 'stable' = 'stable';
  if (pressures.length >= 4) {
    const recent = pressures[pressures.length - 1];
    const earlier = pressures[0];
    const diff = recent - earlier;
    if (diff > 1) pressureTrend = 'rising';
    else if (diff < -1) pressureTrend = 'falling';
  }

  const c = data.current;
  return {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    pressure: c.surface_pressure,
    pressureTrend,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    windGusts: c.wind_gusts_10m,
    cloudCover: c.cloud_cover,
    precipitation: c.precipitation,
    visibility: 10,
    uvIndex: c.uv_index ?? 0,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
  };
}

export async function fetchDailyForecast(coords: Coordinates): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lng.toString(),
    daily: [
      'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum',
      'wind_speed_10m_max', 'weather_code', 'sunrise', 'sunset', 'uv_index_max'
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const res = await fetch(`${OPEN_METEO_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  const data = await res.json();

  return data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitationSum: data.daily.precipitation_sum[i],
    windSpeedMax: data.daily.wind_speed_10m_max[i],
    weatherCode: data.daily.weather_code[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
    uvIndexMax: data.daily.uv_index_max[i],
  }));
}

export async function fetchHourlyForecast(coords: Coordinates): Promise<HourlyForecast[]> {
  const params = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lng.toString(),
    hourly: [
      'temperature_2m', 'surface_pressure', 'wind_speed_10m',
      'precipitation', 'cloud_cover', 'weather_code'
    ].join(','),
    timezone: 'auto',
    forecast_hours: '48',
  });

  const res = await fetch(`${OPEN_METEO_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error(`Hourly API error: ${res.status}`);
  const data = await res.json();

  return data.hourly.time.map((time: string, i: number) => ({
    time,
    temperature: data.hourly.temperature_2m[i],
    pressure: data.hourly.surface_pressure[i],
    windSpeed: data.hourly.wind_speed_10m[i],
    precipitation: data.hourly.precipitation[i],
    cloudCover: data.hourly.cloud_cover[i],
    weatherCode: data.hourly.weather_code[i],
  }));
}

export async function fetchMarineData(coords: Coordinates): Promise<MarineData | null> {
  try {
    const params = new URLSearchParams({
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString(),
      current: [
        'wave_height', 'wave_direction', 'wave_period',
        'ocean_current_velocity', 'ocean_current_direction'
      ].join(','),
      hourly: 'sea_surface_temperature',
      timezone: 'auto',
      forecast_hours: '1',
    });

    const res = await fetch(`${OPEN_METEO_BASE}/marine?${params}`);
    if (!res.ok) return null;
    const data = await res.json();

    const c = data.current || {};
    return {
      waveHeight: c.wave_height ?? 0,
      waveDirection: c.wave_direction ?? 0,
      wavePeriod: c.wave_period ?? 0,
      waterTemperature: data.hourly?.sea_surface_temperature?.[0] ?? 0,
      currentSpeed: c.ocean_current_velocity ?? 0,
      currentDirection: c.ocean_current_direction ?? 0,
    };
  } catch {
    return null;
  }
}

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

export function getWeatherIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '☁️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}
