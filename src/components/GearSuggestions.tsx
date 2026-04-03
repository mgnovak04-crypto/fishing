import type { WeatherData, MarineData, FishingConditions } from '../types';
import { fishSpecies } from '../data/fishSpecies';

interface GearSuggestionsProps {
  weather: WeatherData;
  marine: MarineData | null;
  conditions: FishingConditions;
}

interface GearItem {
  category: string;
  items: string[];
  icon: string;
  reason: string;
}

export function GearSuggestions({ weather, marine, conditions }: GearSuggestionsProps) {
  const gear = generateGearList(weather, marine, conditions);

  return (
    <div className="card gear-card">
      <h3>Suggested Gear & Tackle</h3>
      <p className="gear-subtitle">Based on current conditions and active species</p>

      <div className="gear-list">
        {gear.map((g, i) => (
          <div key={i} className="gear-item">
            <div className="gear-header">
              <span className="gear-icon">{g.icon}</span>
              <h4>{g.category}</h4>
            </div>
            <div className="gear-items">
              {g.items.map((item, j) => (
                <span key={j} className="gear-tag">{item}</span>
              ))}
            </div>
            <p className="gear-reason">{g.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateGearList(weather: WeatherData, marine: MarineData | null, conditions: FishingConditions): GearItem[] {
  const gear: GearItem[] = [];
  const activeSpecies = conditions.activeSpecies
    .map(id => fishSpecies.find(s => s.id === id))
    .filter(Boolean);

  const hasFreshwater = activeSpecies.some(s => s!.habitat === 'freshwater' || s!.habitat === 'both');
  const hasSaltwater = activeSpecies.some(s => s!.habitat === 'saltwater' || s!.habitat === 'both');

  // Clothing
  const clothing: string[] = [];
  if (weather.temperature < 5) {
    clothing.push('Thermal base layer', 'Insulated jacket', 'Warm hat & gloves', 'Neoprene waders');
  } else if (weather.temperature < 12) {
    clothing.push('Fleece mid-layer', 'Waterproof jacket', 'Light gloves', 'Breathable waders');
  } else {
    clothing.push('Light layers', 'Sun protection hat', 'Breathable rain jacket');
  }
  if (weather.precipitation > 0) clothing.push('Rain pants', 'Waterproof bag for electronics');
  if (weather.windSpeed > 15) clothing.push('Windproof outer layer', 'Neck gaiter');
  if (weather.uvIndex > 4) clothing.push('Sunscreen SPF 50', 'Polarized sunglasses');
  else clothing.push('Polarized sunglasses');

  gear.push({
    category: 'Clothing & Protection',
    items: clothing,
    icon: '🧥',
    reason: `${weather.temperature.toFixed(0)}°C with ${weather.precipitation > 0 ? 'precipitation' : 'no rain'}. ${weather.windSpeed > 15 ? 'Windy — layer up.' : 'Dress in layers.'}`,
  });

  // Rod & Reel
  if (hasFreshwater) {
    const freshRods: string[] = [];
    if (activeSpecies.some(s => s!.id === 'pike')) {
      freshRods.push('Medium-heavy spinning rod (7-30g)', 'Baitcasting reel with 0.20mm braid', 'Wire leader 30cm');
    }
    if (activeSpecies.some(s => s!.id === 'brown-trout' || s!.id === 'arctic-char' || s!.id === 'grayling')) {
      freshRods.push('Light spinning rod (2-12g)', 'Fly rod 5-6wt', 'Floating fly line');
    }
    if (activeSpecies.some(s => s!.id === 'atlantic-salmon')) {
      freshRods.push('Salmon fly rod 9-12wt', 'Double-hand spey rod 13-15ft', 'Sinking tip lines');
    }
    if (activeSpecies.some(s => s!.id === 'european-perch')) {
      freshRods.push('Ultralight rod (1-8g)', 'Drop shot rig', 'Spinning reel 1000-2500');
    }
    if (freshRods.length > 0) {
      gear.push({
        category: 'Freshwater Rod & Reel',
        items: [...new Set(freshRods)],
        icon: '🎣',
        reason: `For ${activeSpecies.filter(s => s!.habitat !== 'saltwater').map(s => s!.name).slice(0, 3).join(', ')}.`,
      });
    }
  }

  if (hasSaltwater) {
    const saltRods: string[] = [];
    if (activeSpecies.some(s => s!.id === 'atlantic-cod' || s!.id === 'coalfish')) {
      saltRods.push('Heavy jigging rod (100-300g)', 'Multiplier reel with 0.30mm braid', 'Pilker jigs 200-500g');
    }
    if (activeSpecies.some(s => s!.id === 'pollack' || s!.id === 'mackerel')) {
      saltRods.push('Light-medium spinning rod (10-40g)', 'Spinning reel 3000-4000');
    }
    if (activeSpecies.some(s => s!.id === 'atlantic-halibut')) {
      saltRods.push('Heavy boat rod (300-600g)', 'Large circle hooks 8/0-10/0', 'Steel leader');
    }
    if (saltRods.length > 0) {
      gear.push({
        category: 'Saltwater Rod & Reel',
        items: [...new Set(saltRods)],
        icon: '🌊',
        reason: `For ${activeSpecies.filter(s => s!.habitat !== 'freshwater').map(s => s!.name).slice(0, 3).join(', ')}.`,
      });
    }
  }

  // Lures & Bait
  const lures: string[] = [];
  if (weather.cloudCover > 60) {
    lures.push('Bright/natural colored lures', 'Topwater poppers (low light)');
  } else {
    lures.push('Silver/chrome spoons', 'Subtle natural patterns');
  }
  if (weather.windSpeed > 10) {
    lures.push('Heavier lures for casting into wind');
  }
  if (weather.precipitation > 0 && weather.precipitation < 3) {
    lures.push('Worm imitations', 'Nymphs (insects washed into water)');
  }
  if (weather.temperature < 8) {
    lures.push('Slow-sinking jigs', 'Small presentations');
  } else {
    lures.push('Active swimbaits', 'Spinnerbaits');
  }

  gear.push({
    category: 'Lures & Bait',
    items: lures,
    icon: '🪝',
    reason: `${weather.cloudCover > 60 ? 'Overcast — fish respond to natural colors and surface lures.' : 'Clear skies — flashy lures work at depth.'} ${weather.temperature < 8 ? 'Cold water = slow retrieves.' : 'Warmer water = active presentations.'}`,
  });

  // Safety & Navigation
  const safety: string[] = ['First aid kit', 'Fully charged phone', 'Headlamp'];
  if (marine && marine.waveHeight > 1) {
    safety.push('Life jacket (mandatory on boats)', 'VHF radio', 'Anchor with sufficient rode');
  } else if (hasSaltwater) {
    safety.push('Life jacket', 'Tide table/app');
  }
  if (weather.windSpeed > 20) safety.push('Emergency whistle', 'Thermal blanket');
  safety.push('Norwegian fishing license (freshwater)', 'Local permits/cards');

  gear.push({
    category: 'Safety & Essentials',
    items: safety,
    icon: '🦺',
    reason: `Always carry safety gear. ${marine && marine.waveHeight > 1 ? 'Significant swell today — extra caution on the water.' : 'Check local conditions before heading out.'}`,
  });

  return gear;
}
