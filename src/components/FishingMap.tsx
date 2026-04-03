import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { Coordinates, FishingSpot } from '../types';
import { fishingSpots } from '../data/fishingSpots';
import { fishSpecies } from '../data/fishSpecies';
import { getNearbySpots } from '../services/spotIntelligence';

interface FishingMapProps {
  coordinates: Coordinates;
  onSpotSelect: (spot: FishingSpot) => void;
  onMapClick: (coords: Coordinates) => void;
}

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const spotIcons: Record<string, string> = {
  lake: '🏔️',
  river: '🏞️',
  fjord: '⛰️',
  coast: '🌊',
  sea: '🚢',
};

const difficultyColors: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#eab308',
  advanced: '#ef4444',
};

function createSpotIcon(spot: FishingSpot) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="spot-marker" style="border-color: ${difficultyColors[spot.difficulty]}">${spotIcons[spot.waterType] || '🎣'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function MapEvents({ onMapClick, onLocationClick }: { onMapClick: (coords: Coordinates) => void; onLocationClick: (coords: Coordinates) => void }) {
  const map = useMap();

  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      onLocationClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onMapClick, onLocationClick]);

  return null;
}

function FlyToLocation({ coordinates }: { coordinates: Coordinates }) {
  const map = useMap();
  const prevCoords = useRef(coordinates);

  useEffect(() => {
    if (prevCoords.current.lat !== coordinates.lat || prevCoords.current.lng !== coordinates.lng) {
      map.flyTo([coordinates.lat, coordinates.lng], map.getZoom(), { duration: 1.5 });
      prevCoords.current = coordinates;
    }
  }, [coordinates, map]);

  return null;
}

export function FishingMap({ coordinates, onSpotSelect, onMapClick }: FishingMapProps) {
  const currentMonth = new Date().getMonth() + 1;
  const [clickedLocation, setClickedLocation] = useState<Coordinates | null>(null);

  const handleLocationClick = (coords: Coordinates) => {
    setClickedLocation(coords);
  };

  const nearbySpots = clickedLocation ? getNearbySpots(clickedLocation, 5) : [];

  return (
    <div className="map-container">
      <div className="map-legend">
        <h4>Map Legend</h4>
        <div className="legend-items">
          <span><span className="legend-dot" style={{ background: '#22c55e' }} /> Beginner</span>
          <span><span className="legend-dot" style={{ background: '#eab308' }} /> Intermediate</span>
          <span><span className="legend-dot" style={{ background: '#ef4444' }} /> Advanced</span>
        </div>
        <p className="legend-hint">Tap the map to see nearby spots & check weather</p>
      </div>

      {/* Location Intelligence Panel */}
      {clickedLocation && nearbySpots.length > 0 && (
        <div className="map-intel-panel">
          <div className="map-intel-header">
            <h4>Nearby Fishing Spots</h4>
            <button className="map-intel-close" onClick={() => setClickedLocation(null)}>✕</button>
          </div>
          <p className="map-intel-coords">{clickedLocation.lat.toFixed(3)}°N, {clickedLocation.lng.toFixed(3)}°E</p>
          <div className="map-intel-list">
            {nearbySpots.map(ns => (
              <div key={ns.id} className="map-intel-item" onClick={() => onSpotSelect(ns)}>
                <span className="map-intel-icon">{spotIcons[ns.waterType] || '🎣'}</span>
                <div className="map-intel-info">
                  <strong>{ns.name}</strong>
                  <span className="map-intel-meta">{ns.distance.toFixed(1)} km {ns.bearing} — {ns.waterType}</span>
                  <span className="map-intel-species">
                    {ns.species.slice(0, 3).map(id => fishSpecies.find(s => s.id === id)?.name).filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={6}
        className="leaflet-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToLocation coordinates={coordinates} />
        <MapEvents onMapClick={onMapClick} onLocationClick={handleLocationClick} />

        {/* User location */}
        <CircleMarker
          center={[coordinates.lat, coordinates.lng]}
          radius={10}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.6 }}
        >
          <Popup>
            <strong>Your Location</strong><br />
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </Popup>
        </CircleMarker>

        {/* Clicked location marker */}
        {clickedLocation && (
          <CircleMarker
            center={[clickedLocation.lat, clickedLocation.lng]}
            radius={8}
            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.5 }}
          />
        )}

        {/* Fishing spots */}
        {fishingSpots.map(spot => {
          const activeSpecies = spot.species
            .map(id => fishSpecies.find(s => s.id === id))
            .filter(s => s && isInSeason(s.season.start, s.season.end, currentMonth));

          return (
            <Marker
              key={spot.id}
              position={[spot.coordinates.lat, spot.coordinates.lng]}
              icon={createSpotIcon(spot)}
              eventHandlers={{ click: () => onSpotSelect(spot) }}
            >
              <Popup>
                <div className="spot-popup">
                  <h4>{spot.name}</h4>
                  <p className="spot-type">{spot.waterType.toUpperCase()} — {spot.region}</p>
                  <p>{spot.description.slice(0, 120)}...</p>
                  <p className="spot-species">
                    <strong>Species ({activeSpecies.length} in season):</strong>{' '}
                    {spot.species.map(id => fishSpecies.find(s => s.id === id)?.name).filter(Boolean).join(', ')}
                  </p>
                  <p className="spot-difficulty" style={{ color: difficultyColors[spot.difficulty] }}>
                    {spot.difficulty.toUpperCase()} difficulty
                  </p>
                  <button className="popup-btn" onClick={() => onSpotSelect(spot)}>View Details</button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function isInSeason(start: number, end: number, current: number): boolean {
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}
