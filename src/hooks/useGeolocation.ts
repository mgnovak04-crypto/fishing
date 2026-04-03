import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '../types';

interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  locationName: string | null;
}

// Default to Oslo if geolocation is unavailable
const DEFAULT_COORDS: Coordinates = { lat: 59.91, lng: 10.75 };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
    locationName: null,
  });

  const fetchLocationName = useCallback(async (coords: Coordinates) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address;
        const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Unknown';
        setState(prev => ({ ...prev, locationName: `${name}, Norway` }));
      }
    } catch {
      // Location name is non-critical
    }
  }, []);

  const setCoordinates = useCallback((coords: Coordinates) => {
    setState({ coordinates: coords, loading: false, error: null, locationName: null });
    fetchLocationName(coords);
  }, [fetchLocationName]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: DEFAULT_COORDS,
        loading: false,
        error: 'Geolocation not supported. Using Oslo as default.',
        locationName: 'Oslo, Norway',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setState({ coordinates: coords, loading: false, error: null, locationName: null });
        fetchLocationName(coords);
      },
      () => {
        setState({
          coordinates: DEFAULT_COORDS,
          loading: false,
          error: 'Location access denied. Using Oslo as default.',
          locationName: 'Oslo, Norway',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchLocationName]);

  return { ...state, setCoordinates };
}
