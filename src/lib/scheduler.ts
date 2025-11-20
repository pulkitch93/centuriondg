import { Match, Site } from '@/types/site';
import { Hauler, Route, Schedule, Alert, RouteType } from '@/types/scheduler';

// Generate optimized routes
export function generateRoutes(
  exportSite: Site,
  importSite: Site,
  distance: number
): { fastest: Route; cheapest: Route; greenest: Route } {
  const baseDistance = distance;
  const baseDuration = (distance / 45) * 60; // Assume 45 mph average
  const baseCO2 = distance * 0.8; // kg CO2 per mile
  
  return {
    fastest: {
      id: `route-fastest-${Date.now()}`,
      type: 'fastest',
      distance: baseDistance * 0.95, // Slightly shorter via highways
      duration: baseDuration * 0.85, // 15% faster
      cost: baseDistance * 3.8,
      carbonEmissions: baseCO2 * 1.1, // More emissions
      waypoints: [exportSite.coordinates, importSite.coordinates],
    },
    cheapest: {
      id: `route-cheapest-${Date.now()}`,
      type: 'cheapest',
      distance: baseDistance * 1.1, // Longer but cheaper roads
      duration: baseDuration * 1.2, // 20% slower
      cost: baseDistance * 2.8,
      carbonEmissions: baseCO2,
      waypoints: [exportSite.coordinates, importSite.coordinates],
    },
    greenest: {
      id: `route-greenest-${Date.now()}`,
      type: 'greenest',
      distance: baseDistance,
      duration: baseDuration * 1.05, // Slightly slower
      cost: baseDistance * 3.5,
      carbonEmissions: baseCO2 * 0.7, // 30% less emissions
      waypoints: [exportSite.coordinates, importSite.coordinates],
    },
  };
}

// Calculate trucks needed based on volume
function calculateTrucksNeeded(volume: number): number {
  const TRUCK_CAPACITY = 20; // cubic yards per truck
  return Math.ceil(volume / TRUCK_CAPACITY);
}

// Predict weather delay (simulated)
function predictWeatherDelay(date: Date): number {
  const month = date.getMonth();
  // Higher chance of delay in winter months
  if (month >= 11 || month <= 2) return Math.random() * 30 + 10; // 10-40%
  if (month >= 3 && month <= 5) return Math.random() * 15 + 5; // 5-20%
  return Math.random() * 10; // 0-10%
}

// Predict traffic delay
function predictTrafficDelay(route: Route, startTime: string): number {
  const hour = parseInt(startTime.split(':')[0]);
  // Rush hour delays
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
    return route.duration * 0.3; // 30% delay during rush hour
  }
  return route.duration * 0.1; // 10% normal traffic
}

// Generate alerts for a schedule
function generateAlerts(
  schedule: Schedule,
  hauler: Hauler | undefined,
  allSchedules: Schedule[]
): Alert[] {
  const alerts: Alert[] = [];
  
  // Check insufficient trucks
  if (hauler && schedule.trucksNeeded > hauler.trucksAvailable) {
    alerts.push({
      id: `alert-${Date.now()}-trucks`,
      type: 'insufficient-trucks',
      severity: 'high',
      message: `Hauler only has ${hauler.trucksAvailable} trucks available, but ${schedule.trucksNeeded} needed`,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Check weather
  if (schedule.weatherDelay && schedule.weatherDelay > 25) {
    alerts.push({
      id: `alert-${Date.now()}-weather`,
      type: 'weather',
      severity: schedule.weatherDelay > 40 ? 'high' : 'medium',
      message: `${Math.round(schedule.weatherDelay)}% chance of weather delays`,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Check traffic
  if (schedule.trafficDelay && schedule.trafficDelay > 30) {
    alerts.push({
      id: `alert-${Date.now()}-traffic`,
      type: 'traffic',
      severity: 'medium',
      message: `Expected ${Math.round(schedule.trafficDelay)} min traffic delay`,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Check for overlapping schedules
  const overlaps = allSchedules.filter(s => {
    if (s.id === schedule.id || s.haulerId !== schedule.haulerId) return false;
    return s.date === schedule.date;
  });
  
  if (overlaps.length > 0) {
    alerts.push({
      id: `alert-${Date.now()}-overlap`,
      type: 'overlap',
      severity: 'medium',
      message: `${overlaps.length} other job(s) scheduled for same hauler on this date`,
      timestamp: new Date().toISOString(),
    });
  }
  
  return alerts;
}

// Select best hauler based on route and requirements
function selectBestHauler(
  haulers: Hauler[],
  trucksNeeded: number,
  route: Route,
  prioritizeReliability: boolean = true
): Hauler | undefined {
  const available = haulers.filter(h => 
    h.status === 'active' && h.trucksAvailable >= trucksNeeded
  );
  
  if (available.length === 0) return undefined;
  
  if (prioritizeReliability) {
    return available.sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0];
  } else {
    // Prioritize cost
    return available.sort((a, b) => 
      (a.costPerMile * route.distance) - (b.costPerMile * route.distance)
    )[0];
  }
}

// Generate AI-powered schedule for approved matches
export function generateSchedules(
  matches: Match[],
  sites: Site[],
  haulers: Hauler[],
  existingSchedules: Schedule[],
  startDate: Date = new Date()
): Schedule[] {
  const approvedMatches = matches.filter(m => m.status === 'approved');
  const newSchedules: Schedule[] = [];
  
  approvedMatches.forEach((match, index) => {
    const exportSite = sites.find(s => s.id === match.exportSiteId);
    const importSite = sites.find(s => s.id === match.importSiteId);
    
    if (!exportSite || !importSite) return;
    
    // Generate routes
    const routes = generateRoutes(exportSite, importSite, match.distance);
    
    // Choose route based on match priority (high score = prioritize fastest)
    const selectedRoute = match.score > 80 ? routes.fastest : routes.cheapest;
    
    // Calculate schedule date (stagger by index)
    const scheduleDate = new Date(startDate);
    scheduleDate.setDate(scheduleDate.getDate() + Math.floor(index / 2));
    
    const volume = Math.min(exportSite.volume, importSite.volume);
    const trucksNeeded = calculateTrucksNeeded(volume);
    
    // Select best hauler
    const hauler = selectBestHauler(haulers, trucksNeeded, selectedRoute);
    
    const startTime = index % 2 === 0 ? '07:00' : '13:00'; // Morning or afternoon
    const endTimeHour = parseInt(startTime.split(':')[0]) + Math.ceil(selectedRoute.duration / 60) + 1;
    const endTime = `${endTimeHour.toString().padStart(2, '0')}:00`;
    
    const schedule: Schedule = {
      id: `schedule-${match.id}-${Date.now()}`,
      matchId: match.id,
      haulerId: hauler?.id,
      date: scheduleDate.toISOString().split('T')[0],
      startTime,
      endTime,
      route: selectedRoute,
      volumeScheduled: volume,
      trucksNeeded,
      status: hauler ? 'scheduled' : 'conflict',
      alerts: [],
      weatherDelay: predictWeatherDelay(scheduleDate),
      trafficDelay: predictTrafficDelay(selectedRoute, startTime),
      createdAt: new Date().toISOString(),
      isAiGenerated: true,
    };
    
    // Generate alerts
    schedule.alerts = generateAlerts(schedule, hauler, [...existingSchedules, ...newSchedules]);
    
    newSchedules.push(schedule);
  });
  
  return newSchedules;
}

// Simulate schedule changes for what-if analysis
export function simulateSchedule(
  schedule: Schedule,
  newHaulerId?: string,
  newDate?: string,
  newVolume?: number,
  newRouteType?: RouteType,
  haulers?: Hauler[],
  sites?: Site[],
  matches?: Match[]
): Schedule {
  const simulated = { ...schedule };
  
  if (newHaulerId) {
    const hauler = haulers?.find(h => h.id === newHaulerId);
    if (hauler) {
      simulated.haulerId = newHaulerId;
      simulated.route = {
        ...simulated.route,
        cost: simulated.route.distance * hauler.costPerMile,
      };
    }
  }
  
  if (newDate) {
    simulated.date = newDate;
    simulated.weatherDelay = predictWeatherDelay(new Date(newDate));
  }
  
  if (newVolume) {
    simulated.volumeScheduled = newVolume;
    simulated.trucksNeeded = calculateTrucksNeeded(newVolume);
  }
  
  return simulated;
}
