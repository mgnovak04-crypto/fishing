import { useState, useEffect, useCallback, useRef } from 'react';
import type { Coordinates } from '../types';

interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  locationName: string | null;
}

// Default to Oslo if geolocation is unavailable
const DEFAULT_COORDS: Coordinates = { lat: 59.91, lng: 10.75 };
const HARD_TIMEOUT_MS = 8000;

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
    locationName: null,
  });
  const resolvedRef = useRef(false);

  const fetchLocationName = useCallback(async (coords: Coordinates) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Unknown';
        setState(prev => ({ ...prev, locationName: `${name}, Norway` }));
      }
    } catch {
      // Location name is non-critical
    }
  }, []);

  const setCoordinates = useCallback((coords: Coordinates) => {
    resolvedRef.current = true;
    setState({ coordinates: coords, loading: false, error: null, locationName: null });
    fetchLocationName(coords);
  }, [fetchLocationName]);

  const useDefault = useCallback((reason: string) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setState({
      coordinates: DEFAULT_COORDS,
      loading: false,
      error: reason,
      locationName: 'Oslo, Norway',
    });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      useDefault('Geolocation not supported. Using Oslo as default.');
      return;
    }

    // Hard fallback: force resolution after HARD_TIMEOUT_MS regardless
    // of whether the browser's own timeout fires (iOS Safari is unreliable).
    const hardTimer = setTimeout(() => {
      useDefault('Location timed out. Using Oslo — tap the map to pick a spot.');
    }, HARD_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(hardTimer);
        if (resolvedRef.current) return;
        resolvedRef.current = true;
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setState({ coordinates: coords, loading: false, error: null, locationName: null });
        fetchLocationName(coords);
      },
      () => {
        clearTimeout(hardTimer);
        useDefault('Location access denied. Using Oslo as default.');
      },
      { enableHighAccuracy: false, timeout: HARD_TIMEOUT_MS, maximumAge: 300000 }
    );

    return () => clearTimeout(hardTimer);
  }, [fetchLocationName, useDefault]);

  const skipLocation = useCallback(() => {
    useDefault('Using Oslo — tap the map to pick a spot.');
  }, [useDefault]);

  return { ...state, setCoordinates, skipLocation };
}
