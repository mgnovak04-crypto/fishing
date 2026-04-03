import { useState, useEffect } from 'react';
import type { Coordinates, WeatherData, DailyForecast, HourlyForecast, MarineData, MoonData, FishingConditions } from '../types';
import { fetchCurrentWeather, fetchDailyForecast, fetchHourlyForecast, fetchMarineData } from '../services/weatherApi';
import { calculateMoonPhase } from '../services/moonService';
import { calculateFishingConditions } from '../services/fishingConditions';

interface WeatherState {
  current: WeatherData | null;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  marine: MarineData | null;
  moon: MoonData;
  conditions: FishingConditions | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(coordinates: Coordinates | null) {
  const [state, setState] = useState<WeatherState>({
    current: null,
    daily: [],
    hourly: [],
    marine: null,
    moon: calculateMoonPhase(),
    conditions: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!coordinates) return;

    let cancelled = false;

    async function load() {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const [current, daily, hourly, marine] = await Promise.all([
          fetchCurrentWeather(coordinates!),
          fetchDailyForecast(coordinates!),
          fetchHourlyForecast(coordinates!),
          fetchMarineData(coordinates!),
        ]);

        if (cancelled) return;

        const moon = calculateMoonPhase();
        const conditions = calculateFishingConditions(
          current,
          marine,
          moon,
          daily[0]?.sunrise || '',
          daily[0]?.sunset || ''
        );

        setState({
          current,
          daily,
          hourly,
          marine,
          moon,
          conditions,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!cancelled) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load weather data',
          }));
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [coordinates?.lat, coordinates?.lng]);

  return state;
}
