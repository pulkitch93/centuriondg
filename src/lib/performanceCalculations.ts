import { 
  ExecutiveKPIs, 
  ProfitabilityMetrics, 
  TrendData, 
  ForecastData, 
  ScenarioParams, 
  ScenarioResult,
  SustainabilityMetrics 
} from '@/types/performance';
import { storage } from './storage';
import { schedulerStorage } from './schedulerStorage';
import { dispatchStorage } from './dispatchStorage';
import { operationsStorage } from './operationsStorage';

const LANDFILL_COST_PER_CY = 12;
const CO2_PER_MILE = 0.95;
const FUEL_GALLONS_PER_MILE = 0.12;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number) => (value * Math.PI) / 180;

export function calculateExecutiveKPIs(daysBack: number = 7): ExecutiveKPIs {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const dispatches = dispatchStorage.getDispatchTickets();
  const haulers = schedulerStorage.getHaulers();
  const sites = storage.getSites();
  
  const recentDispatches = dispatches.filter(d => 
    d.deliveredAt && new Date(d.deliveredAt) >= cutoffDate
  );
  
  const totalVolume = recentDispatches.reduce((sum, d) => sum + (d.actualVolume || d.volume), 0);
  
  let totalCost = 0;
  let totalDistance = 0;
  
  recentDispatches.forEach(d => {
    const exportSite = sites.find(s => s.id === d.exportSiteId);
    const importSite = sites.find(s => s.id === d.importSiteId);
    
    if (exportSite && importSite) {
      const distance = calculateDistance(
        exportSite.coordinates.lat, exportSite.coordinates.lng,
        importSite.coordinates.lat, importSite.coordinates.lng
      );
      totalDistance += distance;
      totalCost += distance * 3.5;
    }
  });
  
  const avgCostPerCY = totalVolume > 0 ? totalCost / totalVolume : 0;
  const avgDistancePerHaul = recentDispatches.length > 0 ? totalDistance / recentDispatches.length : 0;
  const avgLandfillDistance = 45;
  const avgHaulDistanceSaved = avgLandfillDistance - avgDistancePerHaul;
  
  const revenue = totalVolume * 8;
  const profitMargin = revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0;
  
  const haulerReliabilityAvg = haulers.reduce((sum, h) => sum + h.reliabilityScore, 0) / Math.max(haulers.length, 1);
  
  const actualFuel = totalDistance * FUEL_GALLONS_PER_MILE;
  const landfillFuel = recentDispatches.length * avgLandfillDistance * FUEL_GALLONS_PER_MILE;
  const fuelSavings = landfillFuel - actualFuel;
  const co2Reduction = (fuelSavings * 10) / 1000;
  
  return {
    totalVolumeWeek: Math.round(totalVolume),
    avgCostPerCY: Number(avgCostPerCY.toFixed(2)),
    avgHaulDistanceSaved: Number(avgHaulDistanceSaved.toFixed(1)),
    profitMargin: Number(profitMargin.toFixed(1)),
    haulerReliabilityAvg: Number(haulerReliabilityAvg.toFixed(1)),
    fuelSavings: Math.round(fuelSavings),
    co2Reduction: Number(co2Reduction.toFixed(1))
  };
}

export function calculateProfitability(): ProfitabilityMetrics {
  const dispatches = dispatchStorage.getDispatchTickets();
  const jobs = operationsStorage.getJobs();
  const sites = storage.getSites();
  const haulers = schedulerStorage.getHaulers();
  
  const jobDispatchMap = new Map<string, typeof dispatches>();
  dispatches.forEach(d => {
    const job = jobs.find(j => j.exportSiteId === d.exportSiteId && j.importSiteId === d.importSiteId);
    if (job) {
      const existing = jobDispatchMap.get(job.id) || [];
      jobDispatchMap.set(job.id, [...existing, d]);
    }
  });
  
  const byJob = Array.from(jobDispatchMap.entries()).map(([jobId, jobDispatches]) => {
    const job = jobs.find(j => j.id === jobId);
    const exportSite = job ? sites.find(s => s.id === job.exportSiteId) : null;
    const importSite = job ? sites.find(s => s.id === job.importSiteId) : null;
    
    let totalCost = 0;
    let totalRevenue = 0;
    
    jobDispatches.forEach(d => {
      const volume = d.actualVolume || d.volume;
      totalRevenue += volume * 8;
      
      if (exportSite && importSite) {
        const distance = calculateDistance(
          exportSite.coordinates.lat, exportSite.coordinates.lng,
          importSite.coordinates.lat, importSite.coordinates.lng
        );
        totalCost += distance * 3.5;
      }
    });
    
    return {
      jobId,
      jobName: `${exportSite?.name || 'Unknown'} → ${importSite?.name || 'Unknown'}`,
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalRevenue - totalCost,
      margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
    };
  });
  
  const regionMetrics = new Map<string, { revenue: number; cost: number }>();
  dispatches.forEach(d => {
    const exportSite = sites.find(s => s.id === d.exportSiteId);
    const importSite = sites.find(s => s.id === d.importSiteId);
    const region = exportSite ? exportSite.location.split(',')[0].trim() : 'Unknown';
    
    const existing = regionMetrics.get(region) || { revenue: 0, cost: 0 };
    const volume = d.actualVolume || d.volume;
    existing.revenue += volume * 8;
    
    if (exportSite && importSite) {
      const distance = calculateDistance(
        exportSite.coordinates.lat, exportSite.coordinates.lng,
        importSite.coordinates.lat, importSite.coordinates.lng
      );
      existing.cost += distance * 3.5;
    }
    
    regionMetrics.set(region, existing);
  });
  
  const byRegion = Array.from(regionMetrics.entries()).map(([region, data]) => ({
    region,
    revenue: data.revenue,
    cost: data.cost,
    profit: data.revenue - data.cost,
    margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0
  }));
  
  const haulerMetrics = new Map<string, { revenue: number; cost: number; name: string }>();
  dispatches.forEach(d => {
    const haulerId = d.haulerCompany || 'unassigned';
    const existing = haulerMetrics.get(haulerId) || { revenue: 0, cost: 0, name: haulerId };
    const volume = d.actualVolume || d.volume;
    existing.revenue += volume * 8;
    
    const exportSite = sites.find(s => s.id === d.exportSiteId);
    const importSite = sites.find(s => s.id === d.importSiteId);
    
    if (exportSite && importSite) {
      const distance = calculateDistance(
        exportSite.coordinates.lat, exportSite.coordinates.lng,
        importSite.coordinates.lat, importSite.coordinates.lng
      );
      existing.cost += distance * 3.5;
    }
    
    const hauler = haulers.find(h => h.name === haulerId);
    if (hauler) existing.name = hauler.name;
    
    haulerMetrics.set(haulerId, existing);
  });
  
  const byHauler = Array.from(haulerMetrics.entries()).map(([haulerId, data]) => ({
    haulerId,
    haulerName: data.name,
    revenue: data.revenue,
    cost: data.cost,
    profit: data.revenue - data.cost,
    margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0
  }));
  
  return { byJob, byRegion, byHauler };
}

export function calculateTrends(daysBack: number = 30): TrendData[] {
  const dispatches = dispatchStorage.getDispatchTickets();
  const sites = storage.getSites();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const dailyData = new Map<string, { volume: number; cost: number; distance: number; count: number }>();
  
  dispatches.forEach(d => {
    if (!d.deliveredAt) return;
    const date = d.deliveredAt.split('T')[0];
    if (new Date(date) >= cutoffDate) {
      const existing = dailyData.get(date) || { volume: 0, cost: 0, distance: 0, count: 0 };
      const volume = d.actualVolume || d.volume;
      existing.volume += volume;
      
      const exportSite = sites.find(s => s.id === d.exportSiteId);
      const importSite = sites.find(s => s.id === d.importSiteId);
      
      if (exportSite && importSite) {
        const distance = calculateDistance(
          exportSite.coordinates.lat, exportSite.coordinates.lng,
          importSite.coordinates.lat, importSite.coordinates.lng
        );
        existing.distance += distance;
        existing.cost += distance * 3.5;
      }
      
      existing.count += 1;
      dailyData.set(date, existing);
    }
  });
  
  const trends: TrendData[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const data = dailyData.get(dateStr) || { volume: 0, cost: 0, distance: 0, count: 0 };
    const revenue = data.volume * 8;
    
    trends.push({
      date: dateStr,
      volume: data.volume,
      cost: data.cost,
      costPerMile: data.distance > 0 ? data.cost / data.distance : 0,
      revenue,
      profit: revenue - data.cost
    });
  }
  
  return trends;
}

export function generateForecast(): ForecastData[] {
  const sites = storage.getSites();
  const historicalTrends = calculateTrends(30);
  
  const avgDailyVolume = historicalTrends.reduce((sum, t) => sum + t.volume, 0) / historicalTrends.length;
  
  const forecasts: ForecastData[] = [];
  const demand7Day = avgDailyVolume * 7 * 1.1;
  const importSites = sites.filter(s => s.type === 'import' && new Date(s.scheduleEnd) > new Date());
  const supply7Day = importSites.reduce((sum, s) => sum + s.volume, 0) * 0.3;
  
  forecasts.push({
    period: 'Next 7 days',
    demandForFill: Math.round(demand7Day),
    expectedSupply: Math.round(supply7Day),
    gap: Math.round(supply7Day - demand7Day),
    confidence: 75
  });
  
  const demand30Day = avgDailyVolume * 30 * 1.15;
  const supply30Day = importSites.reduce((sum, s) => sum + s.volume, 0);
  
  forecasts.push({
    period: 'Next 30 days',
    demandForFill: Math.round(demand30Day),
    expectedSupply: Math.round(supply30Day),
    gap: Math.round(supply30Day - demand30Day),
    confidence: 60
  });
  
  return forecasts;
}

export function runScenarioSimulation(params: ScenarioParams): ScenarioResult {
  const kpis = calculateExecutiveKPIs(7);
  const trends = calculateTrends(7);
  
  const originalProfit = trends.reduce((sum, t) => sum + t.profit, 0);
  const originalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0);
  const originalCost = trends.reduce((sum, t) => sum + t.cost, 0);
  const originalMargin = kpis.profitMargin;
  
  const fuelImpact = (params.fuelCostChange / 100) * 0.3;
  const volumeImpact = params.volumeChange / 100;
  const rateImpact = params.haulerRateChange / 100;
  
  const newCost = originalCost * (1 + fuelImpact + rateImpact);
  const newRevenue = originalRevenue * (1 + volumeImpact);
  const newProfit = newRevenue - newCost;
  const newMargin = newRevenue > 0 ? ((newRevenue - newCost) / newRevenue) * 100 : 0;
  const newCostPerCY = kpis.avgCostPerCY * (1 + fuelImpact + rateImpact);
  
  let impact = '';
  const marginDiff = newMargin - originalMargin;
  if (marginDiff < -5) impact = 'Significant negative impact';
  else if (marginDiff < -2) impact = 'Moderate negative impact';
  else if (marginDiff < 2) impact = 'Minimal impact';
  else if (marginDiff < 5) impact = 'Moderate positive impact';
  else impact = 'Significant positive impact';
  
  return {
    originalMargin,
    newMargin: Number(newMargin.toFixed(1)),
    originalCostPerCY: kpis.avgCostPerCY,
    newCostPerCY: Number(newCostPerCY.toFixed(2)),
    originalProfit: Math.round(originalProfit),
    newProfit: Math.round(newProfit),
    impact
  };
}

export function calculateSustainability(daysBack: number = 30): SustainabilityMetrics {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const dispatches = dispatchStorage.getDispatchTickets();
  const sites = storage.getSites();
  const recentDispatches = dispatches.filter(d => 
    d.deliveredAt && new Date(d.deliveredAt) >= cutoffDate
  );
  
  let totalDistance = 0;
  let totalVolume = 0;
  
  recentDispatches.forEach(d => {
    totalVolume += d.actualVolume || d.volume;
    
    const exportSite = sites.find(s => s.id === d.exportSiteId);
    const importSite = sites.find(s => s.id === d.importSiteId);
    
    if (exportSite && importSite) {
      totalDistance += calculateDistance(
        exportSite.coordinates.lat, exportSite.coordinates.lng,
        importSite.coordinates.lat, importSite.coordinates.lng
      );
    }
  });
  
  const avgLandfillDistance = 45;
  const landfillDistance = recentDispatches.length * avgLandfillDistance;
  const mileageReduced = landfillDistance - totalDistance;
  const fuelSaved = mileageReduced * FUEL_GALLONS_PER_MILE;
  const carbonSaved = (mileageReduced * CO2_PER_MILE) / 1000;
  const costSavingsVsLandfill = totalVolume * LANDFILL_COST_PER_CY;
  
  return {
    carbonSaved: Number(carbonSaved.toFixed(1)),
    mileageReduced: Math.round(mileageReduced),
    fuelSaved: Math.round(fuelSaved),
    landfillDiverted: Math.round(totalVolume),
    costSavingsVsLandfill: Math.round(costSavingsVsLandfill)
  };
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
