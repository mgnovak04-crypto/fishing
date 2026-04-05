import type { WeatherData, MarineData, MoonData, Coordinates } from '../types';
import { getActiveSpeciesWithScoring } from '../services/spotIntelligence';

interface ActiveSpeciesPanelProps {
  weather: WeatherData;
  marine: MarineData | null;
  moon: MoonData;
  coordinates: Coordinates;
}

interface SpeciesEntry {
  id: string;
  name: string;
  norwegianName: string;
  image: string;
  habitat: 'freshwater' | 'saltwater' | 'both';
  matchScore: number;
  matchReasons: string[];
  techniques: string[];
  bestTimeOfDay: string[];
  tips: string;
}

const waterTypeLabels: Record<string, string> = {
  lake: 'Lakes',
  river: 'Rivers',
  fjord: 'Fjords',
  coast: 'Coast',
  sea: 'Open Sea',
};

export function ActiveSpeciesPanel({ weather, marine, moon, coordinates }: ActiveSpeciesPanelProps) {
  const { species, nearbyWaterTypes, isLocationFiltered } = getActiveSpeciesWithScoring(weather, marine, moon, coordinates);

  if (species.length === 0) {
    return (
      <div className="card">
        <h3>Active Species</h3>
        <p className="no-species">No species currently in season for this area.</p>
      </div>
    );
  }

  const freshwater = species.filter(sp => sp.habitat === 'freshwater' || sp.habitat === 'both');
  const saltwater = species.filter(sp => sp.habitat === 'saltwater' || sp.habitat === 'both');

  // Determine which sections to show based on nearby water types
  const hasFreshwater = nearbyWaterTypes.some(t => t === 'lake' || t === 'river');
  const hasSaltwater = nearbyWaterTypes.some(t => t === 'fjord' || t === 'coast' || t === 'sea');
  const waterDesc = nearbyWaterTypes.map(t => waterTypeLabels[t] || t).join(', ');

  return (
    <div className="card active-species-card">
      <h3>What's Biting Right Now</h3>
      <p className="species-panel-subtitle">
        {isLocationFiltered
          ? `Based on ${waterDesc} within 25 km of you`
          : 'Species ranked by how well current conditions match their preferences'}
      </p>

      {freshwater.length > 0 && (hasFreshwater || !isLocationFiltered) && (
        <div className="species-habitat-section">
          <div className="habitat-header">
            <span className="habitat-icon">🏔️</span>
            <h4>Freshwater</h4>
            <span className="habitat-count">{freshwater.length} species</span>
          </div>
          <div className="active-species-list">
            {freshwater.map((sp, index) => (
              <SpeciesCard key={sp.id} sp={sp} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {saltwater.length > 0 && (hasSaltwater || !isLocationFiltered) && (
        <div className="species-habitat-section">
          <div className="habitat-header">
            <span className="habitat-icon">🌊</span>
            <h4>Saltwater</h4>
            <span className="habitat-count">{saltwater.length} species</span>
          </div>
          <div className="active-species-list">
            {saltwater.map((sp, index) => (
              <SpeciesCard key={sp.id} sp={sp} rank={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SpeciesCard({ sp, rank }: { sp: SpeciesEntry; rank: number }) {
  return (
    <div className="active-species-item">
      <div className="active-species-rank">
        <span className="rank-number">#{rank}</span>
        <div
          className="match-ring"
          style={{
            background: `conic-gradient(${getMatchColor(sp.matchScore)} ${sp.matchScore * 3.6}deg, #1e293b ${sp.matchScore * 3.6}deg)`,
          }}
        >
          <div className="match-ring-inner">
            <span>{sp.matchScore}</span>
          </div>
        </div>
      </div>

      <div className="active-species-info">
        <div className="active-species-header">
          <span className="active-species-emoji">{sp.image}</span>
          <div>
            <h4>{sp.name}</h4>
            <span className="active-species-nor">{sp.norwegianName}</span>
          </div>
        </div>

        <div className="match-reasons">
          {sp.matchReasons.slice(0, 4).map((reason, i) => (
            <span
              key={i}
              className={`match-reason ${reason.includes('outside') || reason.includes('Off') ? 'negative' : 'positive'}`}
            >
              {reason.includes('outside') || reason.includes('Off') ? '✗' : '✓'} {reason}
            </span>
          ))}
        </div>

        <div className="active-species-meta">
          <div className="meta-row">
            <span className="meta-label">Try:</span>
            <span className="meta-value">{sp.techniques.slice(0, 3).join(', ')}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Best at:</span>
            <span className="meta-value">{sp.bestTimeOfDay.join(', ')}</span>
          </div>
        </div>

        <div className="species-quick-tip">
          <span className="tip-icon">💡</span> {sp.tips}
        </div>
      </div>
    </div>
  );
}

function getMatchColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 55) return '#84cc16';
  if (score >= 40) return '#eab308';
  return '#f97316';
}
