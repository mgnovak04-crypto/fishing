import { useState, useCallback } from 'react';
import type { ViewMode, FishingSpot, Coordinates } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { Dashboard } from './components/Dashboard';
import { FishingMap } from './components/FishingMap';
import { SpeciesGuide } from './components/SpeciesGuide';
import { SpotDetail } from './components/SpotDetail';
import { LoadingScreen } from './components/LoadingScreen';
import './App.css';

function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const { coordinates, loading: geoLoading, error: geoError, locationName, setCoordinates } = useGeolocation();
  const { current, daily, hourly, marine, moon, conditions, loading: weatherLoading, error: weatherError } = useWeather(coordinates);

  const handleSpotSelect = useCallback((spot: FishingSpot) => {
    setSelectedSpot(spot);
    setView('spots');
  }, []);

  const handleMapClick = useCallback((coords: Coordinates) => {
    setCoordinates(coords);
  }, [setCoordinates]);

  const handleViewWeather = useCallback((spot: FishingSpot) => {
    setCoordinates(spot.coordinates);
    setView('dashboard');
  }, [setCoordinates]);

  const handleCloseSpot = useCallback(() => {
    setSelectedSpot(null);
    setView('map');
  }, []);

  if (geoLoading) {
    return <LoadingScreen message="Finding your location..." />;
  }

  const isLoading = weatherLoading && !current;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 onClick={() => setView('dashboard')}>
            <span className="logo-icon">🎣</span> NorgeFiske
          </h1>
          {geoError && <span className="geo-warning">{geoError}</span>}
        </div>
      </header>

      <main className="app-main">
        {isLoading ? (
          <LoadingScreen message="Loading weather & fishing conditions..." />
        ) : weatherError ? (
          <div className="error-screen">
            <p>Failed to load weather data: {weatherError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <>
            {view === 'dashboard' && current && conditions && (
              <Dashboard
                weather={current}
                daily={daily}
                hourly={hourly}
                marine={marine}
                moon={moon}
                conditions={conditions}
                locationName={locationName}
              />
            )}

            {view === 'map' && coordinates && !selectedSpot && (
              <FishingMap
                coordinates={coordinates}
                onSpotSelect={handleSpotSelect}
                onMapClick={handleMapClick}
              />
            )}

            {view === 'species' && (
              <SpeciesGuide activeSpeciesIds={conditions?.activeSpecies || []} />
            )}

            {view === 'spots' && selectedSpot && (
              <SpotDetail
                spot={selectedSpot}
                onClose={handleCloseSpot}
                onViewWeather={handleViewWeather}
              />
            )}
          </>
        )}
      </main>

      <nav className="app-nav">
        <button className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => { setSelectedSpot(null); setView('dashboard'); }}>
          <span className="nav-icon">🌤️</span>
          <span>Weather</span>
        </button>
        <button className={`nav-btn ${view === 'map' ? 'active' : ''}`} onClick={() => { setSelectedSpot(null); setView('map'); }}>
          <span className="nav-icon">🗺️</span>
          <span>Map</span>
        </button>
        <button className={`nav-btn ${view === 'species' ? 'active' : ''}`} onClick={() => { setSelectedSpot(null); setView('species'); }}>
          <span className="nav-icon">🐟</span>
          <span>Species</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
