import type { WeatherData, MarineData, MoonData } from '../types';
import { getActiveSpeciesWithScoring } from '../services/spotIntelligence';

interface ActiveSpeciesPanelProps {
  weather: WeatherData;
  marine: MarineData | null;
  moon: MoonData;
}

export function ActiveSpeciesPanel({ weather, marine, moon }: ActiveSpeciesPanelProps) {
  const species = getActiveSpeciesWithScoring(weather, marine, moon);

  if (species.length === 0) {
    return (
      <div className="card">
        <h3>Active Species</h3>
        <p className="no-species">No species currently in season for this area.</p>
      </div>
    );
  }

  return (
    <div className="card active-species-card">
      <h3>What's Biting Right Now</h3>
      <p className="species-panel-subtitle">
        Species ranked by how well current conditions match their preferences
      </p>

      <div className="active-species-list">
        {species.map((sp, index) => (
          <div key={sp.id} className="active-species-item">
            <div className="active-species-rank">
              <span className="rank-number">#{index + 1}</span>
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
        ))}
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
