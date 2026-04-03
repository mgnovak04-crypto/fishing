const CACHE_KEY_PREFIX = 'norgefiske_';
const WEATHER_TTL = 30 * 60 * 1000; // 30 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
  coordinates: { lat: number; lng: number };
}

export function cacheWeatherData<T>(key: string, data: T, lat: number, lng: number): void {
  try {
    const entry: CachedData<T> = {
      data,
      timestamp: Date.now(),
      coordinates: { lat, lng },
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full — clear old entries and retry
    clearOldCache();
    try {
      const entry: CachedData<T> = { data, timestamp: Date.now(), coordinates: { lat, lng } };
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Still full, give up silently
    }
  }
}

export function getCachedWeatherData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry: CachedData<T> = JSON.parse(raw);
    // Return even expired data when offline — something is better than nothing
    return entry.data;
  } catch {
    return null;
  }
}

export function isCacheFresh(key: string): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return false;
    const entry = JSON.parse(raw);
    return Date.now() - entry.timestamp < WEATHER_TTL;
  } catch {
    return false;
  }
}

export function getCacheAge(key: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    const ageMs = Date.now() - entry.timestamp;
    const mins = Math.floor(ageMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return null;
  }
}

function clearOldCache(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX));
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const entry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
}

// Favorites
const FAVORITES_KEY = CACHE_KEY_PREFIX + 'favorites';

export interface FavoriteSpot {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  addedAt: number;
}

export function getFavorites(): FavoriteSpot[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(spot: FavoriteSpot): void {
  const favorites = getFavorites();
  if (!favorites.find(f => f.id === spot.id)) {
    favorites.push(spot);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites().filter(f => f.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some(f => f.id === id);
}
