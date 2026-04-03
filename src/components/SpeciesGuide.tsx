import { useState } from 'react';
import type { FishSpecies } from '../types';
import { fishSpecies } from '../data/fishSpecies';

interface SpeciesGuideProps {
  activeSpeciesIds: string[];
}

export function SpeciesGuide({ activeSpeciesIds }: SpeciesGuideProps) {
  const [selectedSpecies, setSelectedSpecies] = useState<FishSpecies | null>(null);
  const [filter, setFilter] = useState<'all' | 'freshwater' | 'saltwater' | 'in-season'>('in-season');

  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const filtered = fishSpecies.filter(sp => {
    if (filter === 'freshwater') return sp.habitat === 'freshwater' || sp.habitat === 'both';
    if (filter === 'saltwater') return sp.habitat === 'saltwater' || sp.habitat === 'both';
    if (filter === 'in-season') return activeSpeciesIds.includes(sp.id);
    return true;
  });

  if (selectedSpecies) {
    return (
      <div className="species-detail">
        <button className="back-btn" onClick={() => setSelectedSpecies(null)}>← Back to Species</button>

        <div className="species-header">
          <span className="species-emoji">{selectedSpecies.image}</span>
          <div>
            <h2>{selectedSpecies.name}</h2>
            <p className="species-names">
              {selectedSpecies.norwegianName} — <em>{selectedSpecies.scientificName}</em>
            </p>
          </div>
        </div>

        <div className="card">
          <p className="species-desc">{selectedSpecies.description}</p>
        </div>

        <div className="card">
          <h3>Season</h3>
          <div className="season-bar">
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const inSeason = isInSeason(selectedSpecies.season.start, selectedSpecies.season.end, month);
              const isPeak = selectedSpecies.season.peak.includes(month);
              return (
                <div
                  key={month}
                  className={`season-month ${inSeason ? 'in-season' : ''} ${isPeak ? 'peak' : ''} ${month === currentMonth ? 'current' : ''}`}
                >
                  <span className="month-label">{monthNames[month]}</span>
                </div>
              );
            })}
          </div>
          <div className="season-legend">
            <span><span className="legend-box in-season" /> In Season</span>
            <span><span className="legend-box peak" /> Peak Season</span>
            <span><span className="legend-box current-marker" /> Current Month</span>
          </div>
        </div>

        <div className="card">
          <h3>Preferred Conditions</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Water Temperature</span>
              <span className="detail-value">{selectedSpecies.preferredTemp.min}°C - {selectedSpecies.preferredTemp.max}°C (ideal: {selectedSpecies.preferredTemp.ideal}°C)</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Preferred Depth</span>
              <span className="detail-value">{selectedSpecies.preferredDepth}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Best Time of Day</span>
              <span className="detail-value">{selectedSpecies.bestTimeOfDay.join(', ')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Moon Phase</span>
              <span className="detail-value">{selectedSpecies.moonPreference}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Barometric Pressure</span>
              <span className="detail-value">{selectedSpecies.pressurePreference}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Habitat</span>
              <span className="detail-value">{selectedSpecies.habitat} — {selectedSpecies.waterTypes.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Conditions That Trigger Activity</h3>
          <div className="tag-list">
            {selectedSpecies.preferredConditions.map(c => (
              <span key={c} className="tag">{c}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Techniques</h3>
          <div className="tag-list">
            {selectedSpecies.techniques.map(t => (
              <span key={t} className="tag technique-tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Tips for Success</h3>
          <ul className="tips-list">
            {selectedSpecies.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Where to Find Them</h3>
          <div className="tag-list">
            {selectedSpecies.regions.map(r => (
              <span key={r} className="tag region-tag">{r}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Regulations</h3>
          <p className="regulation-text">
            <strong>Min. size:</strong> {selectedSpecies.minSize > 0 ? `${selectedSpecies.minSize} cm` : 'No minimum'}<br />
            {selectedSpecies.regulations}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="species-guide">
      <h2>Norwegian Fish Species</h2>
      <p className="species-subtitle">Tap a species to view detailed information, conditions, and techniques.</p>

      <div className="filter-bar">
        {(['in-season', 'all', 'freshwater', 'saltwater'] as const).map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'in-season' ? `In Season (${activeSpeciesIds.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="species-grid">
        {filtered.map(sp => {
          const inSeason = activeSpeciesIds.includes(sp.id);
          const isPeak = sp.season.peak.includes(currentMonth);
          return (
            <div
              key={sp.id}
              className={`species-card ${inSeason ? 'in-season' : 'off-season'}`}
              onClick={() => setSelectedSpecies(sp)}
            >
              <div className="species-card-header">
                <span className="species-card-emoji">{sp.image}</span>
                <div>
                  <h3>{sp.name}</h3>
                  <p className="species-card-nor">{sp.norwegianName}</p>
                </div>
              </div>
              <div className="species-card-tags">
                <span className={`badge ${sp.habitat}`}>{sp.habitat}</span>
                {inSeason && <span className="badge season-badge">{isPeak ? 'Peak Season' : 'In Season'}</span>}
              </div>
              <p className="species-card-desc">{sp.description.slice(0, 100)}...</p>
              <div className="species-card-footer">
                <span>{sp.techniques.slice(0, 2).join(', ')}</span>
                <span className="arrow">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isInSeason(start: number, end: number, current: number): boolean {
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}
