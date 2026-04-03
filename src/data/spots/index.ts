import type { FishingSpot } from '../../types';
import { osloSpots } from './oslo';
import { easternSpots } from './eastern';
import { gudbrandsdalSpots } from './gudbrandsdal';
import { westernSpots } from './western';
import { trondelagSpots } from './trondelag';
import { northernSpots } from './northern';
import { southernSpots } from './southern';
import { innlandetSpots } from './innlandet';
import { centralSpots } from './central';
import { moreCoastalSpots } from './more-coastal';
import { arcticSpots } from './arctic';

export const allFishingSpots: FishingSpot[] = [
  ...osloSpots,
  ...easternSpots,
  ...gudbrandsdalSpots,
  ...westernSpots,
  ...trondelagSpots,
  ...northernSpots,
  ...southernSpots,
  ...innlandetSpots,
  ...centralSpots,
  ...moreCoastalSpots,
  ...arcticSpots,
];
