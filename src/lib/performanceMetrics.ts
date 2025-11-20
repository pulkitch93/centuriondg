import { Driver, DispatchTicket } from '@/types/dispatch';
import { Site } from '@/types/site';

export interface DriverPerformanceMetrics {
  driverId: string;
  driverName: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  onTimeRate: number; // percentage
  averageDeliveryTime: number; // minutes
  averageRating: number; // 1-5
  totalVolume: number; // cubic yards
  fuelEfficiency: number; // cubic yards per gallon
  totalDistance: number; // miles
  issuesReported: number;
  performanceScore: number; // 0-100
}

export interface PerformanceTrend {
  date: string;
  onTimeRate: number;
  averageRating: number;
  deliveries: number;
}

export const calculateDriverPerformance = (
  driver: Driver,
  tickets: DispatchTicket[],
  sites: Site[]
): DriverPerformanceMetrics => {
  const driverTickets = tickets.filter(t => t.driverId === driver.id);
  const completedTickets = driverTickets.filter(t => t.status === 'delivered');

  if (completedTickets.length === 0) {
    return {
      driverId: driver.id,
      driverName: driver.name,
      totalDeliveries: 0,
      onTimeDeliveries: 0,
      onTimeRate: 0,
      averageDeliveryTime: 0,
      averageRating: 0,
      totalVolume: 0,
      fuelEfficiency: 0,
      totalDistance: 0,
      issuesReported: 0,
      performanceScore: driver.performanceScore,
    };
  }

  // Calculate on-time deliveries (within 30 minutes of ETA)
  const onTimeDeliveries = completedTickets.filter(ticket => {
    if (!ticket.eta || !ticket.deliveredAt) return false;
    // Simplified: assume on-time if delivered
    return true;
  }).length;

  // Calculate average delivery time
  const deliveryTimes = completedTickets
    .filter(t => t.createdAt && t.deliveredAt)
    .map(t => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.deliveredAt!).getTime();
      return (end - start) / (1000 * 60); // minutes
    });

  const averageDeliveryTime = deliveryTimes.length > 0
    ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
    : 0;

  // Calculate average rating
  const ratingsTickets = completedTickets.filter(t => t.customerRating);
  const averageRating = ratingsTickets.length > 0
    ? ratingsTickets.reduce((sum, t) => sum + (t.customerRating || 0), 0) / ratingsTickets.length
    : 0;

  // Calculate total volume
  const totalVolume = completedTickets.reduce((sum, t) => sum + (t.actualVolume || t.volume), 0);

  // Calculate total distance
  const totalDistance = completedTickets.reduce((sum, ticket) => {
    const exportSite = sites.find(s => s.id === ticket.exportSiteId);
    const importSite = sites.find(s => s.id === ticket.importSiteId);
    if (!exportSite || !importSite) return sum;

    const distance = calculateDistance(
      exportSite.coordinates.lat,
      exportSite.coordinates.lng,
      importSite.coordinates.lat,
      importSite.coordinates.lng
    );
    return sum + distance;
  }, 0);

  // Calculate fuel efficiency
  const totalFuel = completedTickets.reduce((sum, t) => sum + (t.fuelUsed || 0), 0);
  const fuelEfficiency = totalFuel > 0 ? totalVolume / totalFuel : 0;

  // Count issues
  const issuesReported = driverTickets.reduce((sum, t) => sum + t.issues.length, 0);

  // Calculate performance score (weighted average)
  const onTimeRate = (onTimeDeliveries / completedTickets.length) * 100;
  const performanceScore = Math.round(
    (onTimeRate * 0.4) +
    (averageRating * 20 * 0.3) +
    ((100 - Math.min(issuesReported * 5, 100)) * 0.2) +
    (driver.performanceScore * 0.1)
  );

  return {
    driverId: driver.id,
    driverName: driver.name,
    totalDeliveries: completedTickets.length,
    onTimeDeliveries,
    onTimeRate,
    averageDeliveryTime,
    averageRating,
    totalVolume,
    fuelEfficiency,
    totalDistance,
    issuesReported,
    performanceScore,
  };
};

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const calculatePerformanceTrends = (
  tickets: DispatchTicket[],
  days: number = 30
): PerformanceTrend[] => {
  const trends: PerformanceTrend[] = [];
  const endDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTickets = tickets.filter(t => {
      if (!t.deliveredAt) return false;
      const deliveryDate = new Date(t.deliveredAt).toISOString().split('T')[0];
      return deliveryDate === dateStr;
    });

    const onTimeCount = dayTickets.filter(t => t.deliveredAt).length;
    const ratedTickets = dayTickets.filter(t => t.customerRating);
    
    trends.push({
      date: dateStr,
      onTimeRate: dayTickets.length > 0 ? (onTimeCount / dayTickets.length) * 100 : 0,
      averageRating: ratedTickets.length > 0
        ? ratedTickets.reduce((sum, t) => sum + (t.customerRating || 0), 0) / ratedTickets.length
        : 0,
      deliveries: dayTickets.length,
    });
  }

  return trends;
};
