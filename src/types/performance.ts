export interface ExecutiveKPIs {
  totalVolumeWeek: number; // cubic yards
  avgCostPerCY: number;
  avgHaulDistanceSaved: number; // miles
  profitMargin: number; // percentage
  haulerReliabilityAvg: number; // percentage
  fuelSavings: number; // gallons
  co2Reduction: number; // tons
}

export interface ProfitabilityMetrics {
  byJob: Array<{
    jobId: string;
    jobName: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  byRegion: Array<{
    region: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  byHauler: Array<{
    haulerId: string;
    haulerName: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
}

export interface TrendData {
  date: string;
  volume: number;
  cost: number;
  costPerMile: number;
  revenue: number;
  profit: number;
}

export interface ForecastData {
  period: string; // "Next 7 days", "Next 30 days", etc.
  demandForFill: number; // cubic yards
  expectedSupply: number; // cubic yards
  gap: number; // positive = surplus, negative = shortage
  confidence: number; // percentage
}

export interface ScenarioParams {
  fuelCostChange: number; // percentage
  volumeChange: number; // percentage
  haulerRateChange: number; // percentage
}

export interface ScenarioResult {
  originalMargin: number;
  newMargin: number;
  originalCostPerCY: number;
  newCostPerCY: number;
  originalProfit: number;
  newProfit: number;
  impact: string;
}

export interface SustainabilityMetrics {
  carbonSaved: number; // tons
  mileageReduced: number; // miles
  fuelSaved: number; // gallons
  landfillDiverted: number; // cubic yards
  costSavingsVsLandfill: number; // dollars
}
