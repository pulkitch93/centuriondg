import { Driver, DispatchTicket } from '@/types/dispatch';
import { Site } from '@/types/site';

interface DriverScore {
  driver: Driver;
  score: number;
  breakdown: {
    proximityScore: number;
    availabilityScore: number;
    capacityScore: number;
    performanceScore: number;
    workloadScore: number;
  };
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate proximity score (0-100)
const calculateProximityScore = (
  driver: Driver,
  pickupSite: Site
): number => {
  if (!driver.currentLocation) return 50; // Default score if location unknown
  
  const distance = calculateDistance(
    driver.currentLocation.lat,
    driver.currentLocation.lng,
    pickupSite.coordinates.lat,
    pickupSite.coordinates.lng
  );
  
  // Closer is better - exponential decay
  // 0 miles = 100, 50 miles = 50, 100+ miles = 0
  return Math.max(0, 100 - (distance * 2));
};

// Calculate availability score (0-100)
const calculateAvailabilityScore = (driver: Driver): number => {
  switch (driver.status) {
    case 'available':
      return 100;
    case 'on-job':
      return 20; // Low but not zero in case of emergency
    case 'off-duty':
      return 0;
    default:
      return 50;
  }
};

// Calculate capacity match score (0-100)
const calculateCapacityScore = (
  driver: Driver,
  requiredVolume: number
): number => {
  const utilizationPercent = (requiredVolume / driver.truckCapacity) * 100;
  
  // Ideal utilization is 70-90%
  if (utilizationPercent >= 70 && utilizationPercent <= 90) {
    return 100;
  } else if (utilizationPercent < 70) {
    // Penalize underutilization slightly
    return 60 + (utilizationPercent / 70) * 40;
  } else if (utilizationPercent <= 100) {
    // Slight penalty for very high utilization
    return 90 - ((utilizationPercent - 90) * 2);
  } else {
    // Cannot handle the volume
    return 0;
  }
};

// Calculate workload score based on current assignments (0-100)
const calculateWorkloadScore = (
  driver: Driver,
  activeTickets: DispatchTicket[]
): number => {
  const driverTickets = activeTickets.filter(
    t => t.driverId === driver.id && 
    ['accepted', 'en-route-pickup', 'loading', 'en-route-delivery', 'unloading'].includes(t.status)
  );
  
  // Fewer active tickets = higher score
  const activeCount = driverTickets.length;
  if (activeCount === 0) return 100;
  if (activeCount === 1) return 70;
  if (activeCount === 2) return 40;
  return 10;
};

// Score each driver for the dispatch assignment
const scoreDriver = (
  driver: Driver,
  pickupSite: Site,
  requiredVolume: number,
  activeTickets: DispatchTicket[]
): DriverScore => {
  const proximityScore = calculateProximityScore(driver, pickupSite);
  const availabilityScore = calculateAvailabilityScore(driver);
  const capacityScore = calculateCapacityScore(driver, requiredVolume);
  const performanceScore = driver.performanceScore; // Already 0-100
  const workloadScore = calculateWorkloadScore(driver, activeTickets);
  
  // Weighted average - customize weights based on priorities
  const weights = {
    proximity: 0.25,    // 25% - Location is important
    availability: 0.30,  // 30% - Must be available
    capacity: 0.20,     // 20% - Should match capacity
    performance: 0.15,  // 15% - Reward good performers
    workload: 0.10,     // 10% - Balance workload
  };
  
  const score =
    proximityScore * weights.proximity +
    availabilityScore * weights.availability +
    capacityScore * weights.capacity +
    performanceScore * weights.performance +
    workloadScore * weights.workload;
  
  return {
    driver,
    score: Math.round(score * 100) / 100,
    breakdown: {
      proximityScore: Math.round(proximityScore * 100) / 100,
      availabilityScore: Math.round(availabilityScore * 100) / 100,
      capacityScore: Math.round(capacityScore * 100) / 100,
      performanceScore: Math.round(performanceScore * 100) / 100,
      workloadScore: Math.round(workloadScore * 100) / 100,
    },
  };
};

// Find the optimal driver for a dispatch
export const findOptimalDriver = (
  drivers: Driver[],
  pickupSite: Site,
  requiredVolume: number,
  activeTickets: DispatchTicket[]
): DriverScore | null => {
  if (drivers.length === 0) return null;
  
  const scoredDrivers = drivers
    .map(driver => scoreDriver(driver, pickupSite, requiredVolume, activeTickets))
    .filter(scored => scored.breakdown.capacityScore > 0) // Must have capacity
    .sort((a, b) => b.score - a.score);
  
  return scoredDrivers.length > 0 ? scoredDrivers[0] : null;
};

// Get top N driver recommendations
export const getDriverRecommendations = (
  drivers: Driver[],
  pickupSite: Site,
  requiredVolume: number,
  activeTickets: DispatchTicket[],
  topN: number = 5
): DriverScore[] => {
  return drivers
    .map(driver => scoreDriver(driver, pickupSite, requiredVolume, activeTickets))
    .filter(scored => scored.breakdown.capacityScore > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
};
