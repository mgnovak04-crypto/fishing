import type { FishingSpot } from '../types';
import { fishSpecies } from '../data/fishSpecies';

interface SpotDetailProps {
  spot: FishingSpot;
  onClose: () => void;
  onViewWeather: (spot: FishingSpot) => void;
}

const currentMonth = new Date().getMonth() + 1;

export function SpotDetail({ spot, onClose, onViewWeather }: SpotDetailProps) {
  const species = spot.species
    .map(id => fishSpecies.find(s => s.id === id))
    .filter(Boolean) as typeof fishSpecies;

  const difficultyColors = {
    beginner: '#22c55e',
    intermediate: '#eab308',
    advanced: '#ef4444',
  };

  const waterTypeIcons: Record<string, string> = {
    lake: '🏔️',
    river: '🏞️',
    fjord: '⛰️',
    coast: '🌊',
    sea: '🚢',
  };

  return (
    <div className="spot-detail">
      <button className="back-btn" onClick={onClose}>← Back</button>

      <div className="spot-header">
        <span className="spot-type-icon">{waterTypeIcons[spot.waterType] || '🎣'}</span>
        <div>
          <h2>{spot.name}</h2>
          <p className="spot-region">{spot.region} — {spot.waterType.toUpperCase()}</p>
        </div>
      </div>

      <div className="card">
        <p>{spot.description}</p>
      </div>

      <div className="card">
        <h3>Quick Info</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Difficulty</span>
            <span className="detail-value" style={{ color: difficultyColors[spot.difficulty] }}>
              {spot.difficulty.toUpperCase()}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Best Season</span>
            <span className="detail-value">{spot.bestSeason}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Accessibility</span>
            <span className="detail-value">{spot.accessibility}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Coordinates</span>
            <span className="detail-value">{spot.coordinates.lat.toFixed(3)}°N, {spot.coordinates.lng.toFixed(3)}°E</span>
          </div>
        </div>
      </div>

      <button className="action-btn" onClick={() => onViewWeather(spot)}>
        Check Current Weather at {spot.name}
      </button>

      <div className="card">
        <h3>Species at This Spot</h3>
        <div className="spot-species-list">
          {species.map(sp => {
            const inSeason = isInSeason(sp.season.start, sp.season.end, currentMonth);
            const isPeak = sp.season.peak.includes(currentMonth);
            return (
              <div key={sp.id} className={`spot-species-item ${inSeason ? '' : 'off-season'}`}>
                <span className="spot-species-emoji">{sp.image}</span>
                <div className="spot-species-info">
                  <strong>{sp.name}</strong> ({sp.norwegianName})
                  <div className="spot-species-tags">
                    {inSeason ? (
                      <span className="badge season-badge">{isPeak ? 'Peak Season' : 'In Season'}</span>
                    ) : (
                      <span className="badge off-badge">Off Season</span>
                    )}
                    <span className="badge">{sp.techniques[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>Local Tips</h3>
        <ul className="tips-list">
          {spot.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function isInSeason(start: number, end: number, current: number): boolean {
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}
