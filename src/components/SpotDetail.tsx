import type { FishingSpot } from '../types';
import { fishSpecies } from '../data/fishSpecies';

interface SpotDetailProps {
  spot: FishingSpot;
  onClose: () => void;
  onViewWeather: (spot: FishingSpot) => void;
}

const currentMonth = new Date().getMonth() + 1;

const abundanceColors: Record<string, string> = {
  common: '#22c55e',
  moderate: '#84cc16',
  occasional: '#eab308',
  rare: '#f97316',
};

export function SpotDetail({ spot, onClose, onViewWeather }: SpotDetailProps) {
  const species = spot.species
    .map(id => fishSpecies.find(s => s.id === id))
    .filter(Boolean) as typeof fishSpecies;

  const difficultyColors: Record<string, string> = {
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

      {/* Quick Info with extended details */}
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
          {spot.depth && (
            <div className="detail-item">
              <span className="detail-label">Depth</span>
              <span className="detail-value">Max {spot.depth.max}{spot.depth.unit} / Avg {spot.depth.average}{spot.depth.unit}</span>
            </div>
          )}
          {spot.area && (
            <div className="detail-item">
              <span className="detail-label">Area</span>
              <span className="detail-value">{spot.area} km²</span>
            </div>
          )}
          {spot.elevation !== undefined && (
            <div className="detail-item">
              <span className="detail-label">Elevation</span>
              <span className="detail-value">{spot.elevation}m above sea level</span>
            </div>
          )}
          {spot.waterClarity && (
            <div className="detail-item">
              <span className="detail-label">Water Clarity</span>
              <span className="detail-value">{spot.waterClarity}</span>
            </div>
          )}
          {spot.bottomType && (
            <div className="detail-item">
              <span className="detail-label">Bottom Type</span>
              <span className="detail-value">{spot.bottomType}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Accessibility</span>
            <span className="detail-value">{spot.accessibility}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Coordinates</span>
            <span className="detail-value">{spot.coordinates.lat.toFixed(3)}°N, {spot.coordinates.lng.toFixed(3)}°E</span>
          </div>
          {spot.nearestTown && (
            <div className="detail-item">
              <span className="detail-label">Nearest Town</span>
              <span className="detail-value">{spot.nearestTown}</span>
            </div>
          )}
          {spot.parkingInfo && (
            <div className="detail-item">
              <span className="detail-label">Parking</span>
              <span className="detail-value">{spot.parkingInfo}</span>
            </div>
          )}
          {spot.boatAccess && (
            <div className="detail-item">
              <span className="detail-label">Boat Access</span>
              <span className="detail-value">{spot.boatAccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* Regulations */}
      {spot.regulations && (
        <div className="card" style={{ borderLeft: '4px solid #f97316' }}>
          <h3>Regulations & Permits</h3>
          <p className="regulation-text">{spot.regulations}</p>
          {spot.permitInfo && <p className="regulation-text" style={{ marginTop: '8px' }}><strong>Permits:</strong> {spot.permitInfo}</p>}
        </div>
      )}

      <button className="action-btn" onClick={() => onViewWeather(spot)}>
        Check Current Weather at {spot.name}
      </button>

      {/* Hotspot Zones */}
      {spot.hotspots && spot.hotspots.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <h3>Hotspot Zones</h3>
          <p className="gear-subtitle">Key areas to target on this water</p>
          <div className="hotspots-list">
            {spot.hotspots.map((hs, i) => (
              <div key={i} className="hotspot-item">
                <div className="hotspot-header">
                  <span className="hotspot-number">{i + 1}</span>
                  <h4>{hs.name}</h4>
                </div>
                <p className="hotspot-desc">{hs.description}</p>
                <div className="hotspot-meta">
                  {hs.depthRange && <span className="hotspot-tag">Depth: {hs.depthRange}</span>}
                  <span className="hotspot-tag">Best: {hs.bestTime}</span>
                </div>
                <div className="hotspot-meta">
                  <span className="meta-label">Target:</span>
                  {hs.targetSpecies.map(id => {
                    const sp = fishSpecies.find(s => s.id === id);
                    return <span key={id} className="badge season-badge">{sp?.name || id}</span>;
                  })}
                </div>
                <div className="hotspot-meta">
                  <span className="meta-label">Try:</span>
                  {hs.techniques.map(t => <span key={t} className="gear-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structure */}
      {spot.structure && spot.structure.length > 0 && (
        <div className="card">
          <h3>Structure & Features</h3>
          <div className="structure-list">
            {spot.structure.map((s, i) => (
              <div key={i} className="positioning-tip">
                <span className="tip-number">{i + 1}</span>
                <p>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Species Info */}
      {spot.speciesDetail && spot.speciesDetail.length > 0 ? (
        <div className="card">
          <h3>Species — Detailed Local Info</h3>
          <div className="species-detail-list">
            {spot.speciesDetail.map(sd => {
              const sp = fishSpecies.find(s => s.id === sd.speciesId);
              if (!sp) return null;
              const inSeason = sd.bestMonths.includes(currentMonth);
              return (
                <div key={sd.speciesId} className={`species-detail-item ${inSeason ? '' : 'off-season'}`}>
                  <div className="species-detail-header">
                    <span className="species-card-emoji">{sp.image}</span>
                    <div>
                      <h4>{sp.name} <span className="active-species-nor">({sp.norwegianName})</span></h4>
                      <div className="species-detail-badges">
                        <span className="badge" style={{ background: `${abundanceColors[sd.abundance]}22`, color: abundanceColors[sd.abundance] }}>
                          {sd.abundance.toUpperCase()}
                        </span>
                        {inSeason && <span className="badge season-badge">In Season</span>}
                      </div>
                    </div>
                  </div>
                  <div className="species-detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Average Size</span>
                      <span className="detail-value">{sd.averageSize}</span>
                    </div>
                    {sd.recordSize && (
                      <div className="detail-item">
                        <span className="detail-label">Record / Trophy</span>
                        <span className="detail-value">{sd.recordSize}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Depth Range</span>
                      <span className="detail-value">{sd.depthRange}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Best Months</span>
                      <span className="detail-value">{sd.bestMonths.map(m => monthName(m)).join(', ')}</span>
                    </div>
                  </div>
                  <div className="species-detail-techniques">
                    {sd.localTechniques.map(t => <span key={t} className="gear-tag">{t}</span>)}
                  </div>
                  <div className="species-quick-tip">
                    <span className="tip-icon">💡</span> {sd.localTips}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Fallback to basic species list */
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
      )}

      {/* Local Tips */}
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

function monthName(m: number): string {
  return ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m] || '';
}
