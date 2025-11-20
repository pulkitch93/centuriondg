import { dispatchStorage } from './dispatchStorage';
import { DispatchTicket } from '@/types/dispatch';

export function initializeHistoricalData() {
  const existingTickets = dispatchStorage.getDispatchTickets();
  
  // Check if historical data already exists
  const hasHistoricalData = existingTickets.some(t => t.id.startsWith('T-H'));
  if (hasHistoricalData) {
    return; // Already initialized
  }
  
  // Generate 30 days of historical data
  const now = new Date();
  const historicalTickets: DispatchTicket[] = [];
  
  // Create consistent daily loads over the past 30 days
  for (let day = 30; day > 10; day--) {
    const baseTime = now.getTime() - day * 24 * 60 * 60 * 1000;
    
    // 3-5 deliveries per day
    const deliveriesPerDay = 3 + Math.floor(Math.random() * 3);
    
    for (let delivery = 0; delivery < deliveriesPerDay; delivery++) {
      const driverIds = ['driver-1', 'driver-2', 'driver-3', 'driver-4', 'driver-5', 'driver-7', 'driver-8'];
      const haulerCompanies = ['Rapid Logistics', 'GreenHaul Transport', 'Budget Movers', 'Premier Fleet', 'Queen City Hauling', 'Carolina Dirt Movers'];
      const exportSiteIds = ['EX-101', 'EX-102', 'EX-103', 'EX-104', 'EX-105'];
      const importSiteIds = ['IM-201', 'IM-202', 'IM-203', 'IM-204', 'IM-205'];
      
      const driverId = driverIds[Math.floor(Math.random() * driverIds.length)];
      const haulerCompany = haulerCompanies[Math.floor(Math.random() * haulerCompanies.length)];
      const exportSiteId = exportSiteIds[Math.floor(Math.random() * exportSiteIds.length)];
      const importSiteId = importSiteIds[Math.floor(Math.random() * importSiteIds.length)];
      const volume = 15 + Math.floor(Math.random() * 11); // 15-25 CY
      
      const createdOffset = delivery * 4 * 60 * 60 * 1000; // 4 hours apart
      const acceptOffset = 15 * 60 * 1000; // 15 min after creation
      const startOffset = 30 * 60 * 1000; // 30 min after creation
      const loadOffset = 75 * 60 * 1000; // 75 min after creation
      const deliverOffset = 135 * 60 * 1000; // 135 min after creation
      
      historicalTickets.push({
        id: `T-H${day}-${delivery}`,
        scheduleId: `DS-${5001 + (day % 3)}`,
        driverId,
        haulerCompany,
        exportSiteId,
        importSiteId,
        volume,
        status: 'delivered',
        createdAt: new Date(baseTime + createdOffset).toISOString(),
        acceptedAt: new Date(baseTime + createdOffset + acceptOffset).toISOString(),
        startedAt: new Date(baseTime + createdOffset + startOffset).toISOString(),
        loadedAt: new Date(baseTime + createdOffset + loadOffset).toISOString(),
        deliveredAt: new Date(baseTime + createdOffset + deliverOffset).toISOString(),
        loadPhotoUrl: 'uploaded',
        unloadPhotoUrl: 'uploaded',
        digitalSignature: `signature-H${day}-${delivery}`,
        actualVolume: volume,
        customerRating: 3.5 + Math.random() * 1.5, // 3.5-5.0 rating
        fuelUsed: (7 + Math.random() * 6), // 7-13 gallons
        gpsTrack: [],
        issues: [],
      });
    }
  }
  
  // Combine with existing tickets
  const allTickets = [...existingTickets, ...historicalTickets];
  dispatchStorage.setDispatchTickets(allTickets);
}
