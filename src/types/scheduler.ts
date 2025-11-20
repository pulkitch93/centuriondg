export type RouteType = 'fastest' | 'cheapest' | 'greenest';
export type HaulerStatus = 'active' | 'inactive';
export type ScheduleStatus = 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'conflict';

export interface Hauler {
  id: string;
  name: string;
  reliabilityScore: number; // 0-100
  trucksAvailable: number;
  costPerMile: number;
  status: HaulerStatus;
}

export interface Route {
  id: string;
  type: RouteType;
  distance: number; // miles
  duration: number; // minutes
  cost: number;
  carbonEmissions: number; // kg CO2
  waypoints: Array<{ lat: number; lng: number }>;
}

export interface Schedule {
  id: string;
  matchId: string;
  haulerId?: string;
  date: string;
  startTime: string;
  endTime: string;
  route: Route;
  volumeScheduled: number; // cubic yards
  trucksNeeded: number;
  status: ScheduleStatus;
  alerts: Alert[];
  weatherDelay?: number; // percentage chance
  trafficDelay?: number; // additional minutes
  createdAt: string;
  isAiGenerated: boolean;
}

export interface Alert {
  id: string;
  type: 'conflict' | 'insufficient-trucks' | 'weather' | 'traffic' | 'overlap';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
}

export interface SimulationParams {
  scheduleId: string;
  newHaulerId?: string;
  newDate?: string;
  newVolume?: number;
  newRoute?: RouteType;
}
