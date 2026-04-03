import type { WeatherData, MarineData, MoonData, Coordinates } from '../types';
import { getTacticalAdvice, getNearbySpots } from '../services/spotIntelligence';
import { fishSpecies } from '../data/fishSpecies';

interface SpotBriefingProps {
  weather: WeatherData;
  marine: MarineData | null;
  moon: MoonData;
  coordinates: Coordinates;
  locationName: string | null;
  onSpotClick: (coords: Coordinates) => void;
}

export function SpotBriefing({ weather, marine, moon, coordinates, locationName, onSpotClick }: SpotBriefingProps) {
  const tactical = getTacticalAdvice(weather, marine, moon);
  const nearby = getNearbySpots(coordinates, 5);
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="spot-briefing">
      {/* Tactical Briefing */}
      <div className="card briefing-card">
        <h3>Your Spot Right Now</h3>
        {locationName && <p className="briefing-location">{locationName}</p>}
        <p className="briefing-coords">{coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E</p>

        <div className="tactical-section">
          <div className="tactical-item">
            <span className="tactical-icon">🎯</span>
            <div>
              <h4>Where to Fish</h4>
              <p>{tactical.depthAdvice}</p>
            </div>
          </div>

          <div className="tactical-item">
            <span className="tactical-icon">💨</span>
            <div>
              <h4>Wind Strategy</h4>
              <p>{tactical.windAdvice}</p>
            </div>
          </div>

          <div className="tactical-item">
            <span className="tactical-icon">🕐</span>
            <div>
              <h4>Timing</h4>
              <p>{tactical.timeAdvice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Positioning Tips */}
      <div className="card">
        <h3>Positioning & Structure</h3>
        <div className="positioning-tips">
          {[...tactical.positioning, ...tactical.structure].map((tip, i) => (
            <div key={i} className="positioning-tip">
              <span className="tip-number">{i + 1}</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Spots */}
      <div className="card">
        <h3>Nearby Fishing Spots</h3>
        <div className="nearby-list">
          {nearby.map(spot => {
            const activeCount = spot.species
              .map(id => fishSpecies.find(s => s.id === id))
              .filter(s => s && isInSeason(s.season.start, s.season.end, currentMonth))
              .length;

            return (
              <div
                key={spot.id}
                className="nearby-item"
                onClick={() => onSpotClick(spot.coordinates)}
              >
                <div className="nearby-main">
                  <div className="nearby-icon">{getWaterIcon(spot.waterType)}</div>
                  <div className="nearby-info">
                    <h4>{spot.name}</h4>
                    <p className="nearby-meta">
                      {spot.waterType.toUpperCase()} — {spot.region}
                    </p>
                    <p className="nearby-species">
                      {activeCount} species in season — {spot.species
                        .map(id => fishSpecies.find(s => s.id === id)?.name)
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(', ')}
                      {spot.species.length > 3 ? ` +${spot.species.length - 3} more` : ''}
                    </p>
                  </div>
                </div>
                <div className="nearby-distance">
                  <span className="distance-value">{formatDistance(spot.distance)}</span>
                  <span className="distance-bearing">{spot.bearing}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getWaterIcon(type: string): string {
  const icons: Record<string, string> = { lake: '🏔️', river: '🏞️', fjord: '⛰️', coast: '🌊', sea: '🚢' };
  return icons[type] || '🎣';
}

function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)}m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${km.toFixed(0)} km`;
}

function isInSeason(start: number, end: number, current: number): boolean {
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}
