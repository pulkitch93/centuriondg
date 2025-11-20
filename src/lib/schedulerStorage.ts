import { Hauler, Schedule } from '@/types/scheduler';

const HAULERS_KEY = 'centurion_haulers';
const SCHEDULES_KEY = 'centurion_schedules';

// Initialize with sample haulers if none exist
const initializeHaulers = (): Hauler[] => {
  return [
    {
      id: 'hauler-1',
      name: 'Rapid Logistics',
      reliabilityScore: 92,
      trucksAvailable: 8,
      costPerMile: 3.5,
      status: 'active',
    },
    {
      id: 'hauler-2',
      name: 'GreenHaul Transport',
      reliabilityScore: 88,
      trucksAvailable: 5,
      costPerMile: 4.0,
      status: 'active',
    },
    {
      id: 'hauler-3',
      name: 'Budget Movers',
      reliabilityScore: 75,
      trucksAvailable: 12,
      costPerMile: 2.8,
      status: 'active',
    },
    {
      id: 'hauler-4',
      name: 'Premier Fleet',
      reliabilityScore: 95,
      trucksAvailable: 6,
      costPerMile: 4.5,
      status: 'active',
    },
  ];
};

export const schedulerStorage = {
  getHaulers: (): Hauler[] => {
    const data = localStorage.getItem(HAULERS_KEY);
    if (!data) {
      const haulers = initializeHaulers();
      localStorage.setItem(HAULERS_KEY, JSON.stringify(haulers));
      return haulers;
    }
    return JSON.parse(data);
  },
  
  setHaulers: (haulers: Hauler[]) => {
    localStorage.setItem(HAULERS_KEY, JSON.stringify(haulers));
  },
  
  getSchedules: (): Schedule[] => {
    const data = localStorage.getItem(SCHEDULES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setSchedules: (schedules: Schedule[]) => {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  },
};
