import { Driver, DispatchTicket } from '@/types/dispatch';

const DRIVERS_KEY = 'centurion_drivers';
const DISPATCH_TICKETS_KEY = 'centurion_dispatch_tickets';

export const dispatchStorage = {
  getDrivers: (): Driver[] => {
    const data = localStorage.getItem(DRIVERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setDrivers: (drivers: Driver[]) => {
    localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
  },
  
  getDispatchTickets: (): DispatchTicket[] => {
    const data = localStorage.getItem(DISPATCH_TICKETS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setDispatchTickets: (tickets: DispatchTicket[]) => {
    localStorage.setItem(DISPATCH_TICKETS_KEY, JSON.stringify(tickets));
  },
};
