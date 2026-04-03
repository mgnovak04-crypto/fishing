import { useState, useEffect } from 'react';
import type { Coordinates, WeatherData, DailyForecast, HourlyForecast, MarineData, MoonData, FishingConditions } from '../types';
import { fetchCurrentWeather, fetchDailyForecast, fetchHourlyForecast, fetchMarineData } from '../services/weatherApi';
import { calculateMoonPhase } from '../services/moonService';
import { calculateFishingConditions } from '../services/fishingConditions';
import { cacheWeatherData, getCachedWeatherData, getCacheAge } from '../services/offlineCache';

interface WeatherState {
  current: WeatherData | null;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  marine: MarineData | null;
  moon: MoonData;
  conditions: FishingConditions | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  cacheAge: string | null;
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
    isOffline: !navigator.onLine,
    cacheAge: null,
  });

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

        // Cache all data
        cacheWeatherData('current', current, coordinates!.lat, coordinates!.lng);
        cacheWeatherData('daily', daily, coordinates!.lat, coordinates!.lng);
        cacheWeatherData('hourly', hourly, coordinates!.lat, coordinates!.lng);
        if (marine) cacheWeatherData('marine', marine, coordinates!.lat, coordinates!.lng);

        const moon = calculateMoonPhase();
        const conditions = calculateFishingConditions(
          current, marine, moon,
          daily[0]?.sunrise || '',
          daily[0]?.sunset || ''
        );

        setState({
          current, daily, hourly, marine, moon, conditions,
          loading: false, error: null, isOffline: false, cacheAge: null,
        });
      } catch (err) {
        if (cancelled) return;

        // Try to load from cache
        const cachedCurrent = getCachedWeatherData<WeatherData>('current');
        const cachedDaily = getCachedWeatherData<DailyForecast[]>('daily');
        const cachedHourly = getCachedWeatherData<HourlyForecast[]>('hourly');
        const cachedMarine = getCachedWeatherData<MarineData>('marine');

        if (cachedCurrent) {
          const moon = calculateMoonPhase();
          const conditions = calculateFishingConditions(
            cachedCurrent, cachedMarine || null, moon,
            cachedDaily?.[0]?.sunrise || '',
            cachedDaily?.[0]?.sunset || ''
          );

          setState({
            current: cachedCurrent,
            daily: cachedDaily || [],
            hourly: cachedHourly || [],
            marine: cachedMarine || null,
            moon, conditions,
            loading: false,
            error: null,
            isOffline: true,
            cacheAge: getCacheAge('current'),
          });
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            isOffline: !navigator.onLine,
            error: !navigator.onLine
              ? 'You\'re offline and no cached data is available. Connect to the internet to load weather data, then it will be saved for offline use.'
              : err instanceof Error ? err.message : 'Failed to load weather data',
          }));
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [coordinates?.lat, coordinates?.lng]);

  return state;
}
