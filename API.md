# Centurion DG Platform - API Reference

This document provides comprehensive documentation for all storage modules, utility functions, and their usage examples.

---

## Table of Contents

1. [Storage Modules](#storage-modules)
   - [Core Storage](#core-storage)
   - [Scheduler Storage](#scheduler-storage)
   - [Dispatch Storage](#dispatch-storage)
   - [Operations Storage](#operations-storage)
   - [Compliance Storage](#compliance-storage)
   - [Lead Storage](#lead-storage)
   - [Geotechnical Storage](#geotechnical-storage)
   - [Municipality Storage](#municipality-storage)
2. [Utility Functions](#utility-functions)
   - [Core Utilities](#core-utilities)
   - [Matching Algorithm](#matching-algorithm)
   - [Scheduler Functions](#scheduler-functions)
   - [Performance Calculations](#performance-calculations)
   - [Performance Metrics](#performance-metrics)
   - [Auto Dispatch](#auto-dispatch)
   - [Soil Classification](#soil-classification)
   - [Permit Scoring](#permit-scoring)
   - [OCR Simulator](#ocr-simulator)
3. [Type Definitions](#type-definitions)

---

## Storage Modules

All storage modules use `localStorage` for client-side persistence with JSON serialization.

### Core Storage

**File:** `src/lib/storage.ts`

Manages sites and matches data.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getSites()` | - | `Site[]` | Retrieves all sites |
| `setSites(sites)` | `sites: Site[]` | `void` | Saves sites array |
| `getMatches()` | - | `Match[]` | Retrieves all matches |
| `setMatches(matches)` | `matches: Match[]` | `void` | Saves matches array |

**Usage Examples:**

```typescript
import { storage } from '@/lib/storage';

// Get all sites
const sites = storage.getSites();

// Add a new site
const newSite: Site = {
  id: crypto.randomUUID(),
  name: 'New Construction Site',
  type: 'export',
  // ... other properties
};
storage.setSites([...sites, newSite]);

// Get and update matches
const matches = storage.getMatches();
const updatedMatches = matches.map(m => 
  m.id === targetId ? { ...m, status: 'approved' } : m
);
storage.setMatches(updatedMatches);
```

---

### Scheduler Storage

**File:** `src/lib/schedulerStorage.ts`

Manages haulers and schedules with auto-initialization.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getHaulers()` | - | `Hauler[]` | Gets haulers (initializes if empty) |
| `setHaulers(haulers)` | `haulers: Hauler[]` | `void` | Saves haulers array |
| `getSchedules()` | - | `Schedule[]` | Gets all schedules |
| `setSchedules(schedules)` | `schedules: Schedule[]` | `void` | Saves schedules array |

**Usage Examples:**

```typescript
import { schedulerStorage } from '@/lib/schedulerStorage';

// Get haulers (auto-initializes with sample data)
const haulers = schedulerStorage.getHaulers();

// Update hauler availability
const updatedHaulers = haulers.map(h =>
  h.id === haulerId ? { ...h, trucksAvailable: 5 } : h
);
schedulerStorage.setHaulers(updatedHaulers);

// Add a new schedule
const schedules = schedulerStorage.getSchedules();
const newSchedule: Schedule = {
  id: crypto.randomUUID(),
  matchId: 'match-123',
  // ... other properties
};
schedulerStorage.setSchedules([...schedules, newSchedule]);
```

---

### Dispatch Storage

**File:** `src/lib/dispatchStorage.ts`

Manages drivers and dispatch tickets.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDrivers()` | - | `Driver[]` | Gets all drivers |
| `setDrivers(drivers)` | `drivers: Driver[]` | `void` | Saves drivers array |
| `getDispatchTickets()` | - | `DispatchTicket[]` | Gets all dispatch tickets |
| `setDispatchTickets(tickets)` | `tickets: DispatchTicket[]` | `void` | Saves tickets array |

**Usage Examples:**

```typescript
import { dispatchStorage } from '@/lib/dispatchStorage';

// Get all drivers
const drivers = dispatchStorage.getDrivers();

// Update driver status
const updatedDrivers = drivers.map(d =>
  d.id === driverId ? { ...d, status: 'available' } : d
);
dispatchStorage.setDrivers(updatedDrivers);

// Create a new dispatch ticket
const tickets = dispatchStorage.getDispatchTickets();
const newTicket: DispatchTicket = {
  id: crypto.randomUUID(),
  driverId: 'driver-1',
  status: 'pending',
  // ... other properties
};
dispatchStorage.setDispatchTickets([...tickets, newTicket]);
```

---

### Operations Storage

**File:** `src/lib/operationsStorage.ts`

Manages jobs, alerts, messages, and shift reports.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getJobs()` | - | `Job[]` | Gets all jobs |
| `setJobs(jobs)` | `jobs: Job[]` | `void` | Saves jobs array |
| `getAlerts()` | - | `OperationsAlert[]` | Gets all alerts |
| `setAlerts(alerts)` | `alerts: OperationsAlert[]` | `void` | Saves alerts array |
| `getMessages()` | - | `HaulerMessage[]` | Gets all messages |
| `setMessages(messages)` | `messages: HaulerMessage[]` | `void` | Saves messages array |
| `getShiftReports()` | - | `ShiftReport[]` | Gets all shift reports |
| `setShiftReports(reports)` | `reports: ShiftReport[]` | `void` | Saves reports array |

**Usage Examples:**

```typescript
import { operationsStorage } from '@/lib/operationsStorage';

// Create a new job
const jobs = operationsStorage.getJobs();
const newJob: Job = {
  id: crypto.randomUUID(),
  name: 'Downtown Fill Project',
  status: 'active',
  // ... other properties
};
operationsStorage.setJobs([...jobs, newJob]);

// Acknowledge an alert
const alerts = operationsStorage.getAlerts();
const updated = alerts.map(a =>
  a.id === alertId ? { ...a, acknowledged: true } : a
);
operationsStorage.setAlerts(updated);
```

---

### Compliance Storage

**File:** `src/lib/complianceStorage.ts`

Manages compliance documents and alerts with convenience methods.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDocuments()` | - | `ComplianceDocument[]` | Gets all documents |
| `setDocuments(documents)` | `documents: ComplianceDocument[]` | `void` | Saves documents array |
| `addDocument(document)` | `document: ComplianceDocument` | `void` | Adds single document |
| `updateDocument(id, updates)` | `id: string, updates: Partial<ComplianceDocument>` | `void` | Updates document by ID |
| `getAlerts()` | - | `ComplianceAlert[]` | Gets all compliance alerts |
| `setAlerts(alerts)` | `alerts: ComplianceAlert[]` | `void` | Saves alerts array |
| `addAlert(alert)` | `alert: ComplianceAlert` | `void` | Adds single alert |
| `acknowledgeAlert(id, acknowledgedBy)` | `id: string, acknowledgedBy: string` | `void` | Acknowledges alert |

**Usage Examples:**

```typescript
import { complianceStorage } from '@/lib/complianceStorage';

// Add a new compliance document
complianceStorage.addDocument({
  id: crypto.randomUUID(),
  type: 'environmental-permit',
  name: 'EPA Permit 2024',
  status: 'valid',
  expirationDate: '2025-12-31',
  // ... other properties
});

// Update document status
complianceStorage.updateDocument(docId, {
  status: 'expired',
  notes: 'Renewal submitted'
});

// Acknowledge a compliance alert
complianceStorage.acknowledgeAlert(alertId, 'John Smith');
```

---

### Lead Storage

**File:** `src/lib/leadStorage.ts`

Manages sales leads with query methods.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getLeads()` | - | `Lead[]` | Gets all leads |
| `setLeads(leads)` | `leads: Lead[]` | `void` | Saves leads array |
| `addLead(lead)` | `lead: Lead` | `void` | Adds single lead |
| `updateLead(id, updates)` | `id: string, updates: Partial<Lead>` | `void` | Updates lead (auto-updates `updatedAt`) |
| `deleteLead(id)` | `id: string` | `void` | Deletes lead by ID |
| `getLeadByPermitId(permitId)` | `permitId: string` | `Lead \| undefined` | Finds lead by permit ID |
| `getLeadById(id)` | `id: string` | `Lead \| undefined` | Finds lead by ID |

**Usage Examples:**

```typescript
import { leadStorage } from '@/lib/leadStorage';

// Create lead from permit
leadStorage.addLead({
  id: crypto.randomUUID(),
  permitId: 'permit-123',
  companyName: 'ABC Construction',
  status: 'new',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // ... other properties
});

// Update lead status
leadStorage.updateLead(leadId, {
  status: 'contacted',
  notes: 'Follow-up scheduled'
});

// Find lead by permit
const lead = leadStorage.getLeadByPermitId('permit-123');
```

---

### Geotechnical Storage

**File:** `src/lib/geotechnicalStorage.ts`

Manages geotechnical reports.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getReports()` | - | `GeotechReport[]` | Gets all reports |
| `setReports(reports)` | `reports: GeotechReport[]` | `void` | Saves reports array |
| `addReport(report)` | `report: GeotechReport` | `void` | Adds single report |
| `updateReport(id, updates)` | `id: string, updates: Partial<GeotechReport>` | `void` | Updates report by ID |
| `deleteReport(id)` | `id: string` | `void` | Deletes report by ID |

**Usage Examples:**

```typescript
import { geotechStorage } from '@/lib/geotechnicalStorage';

// Add a geotechnical report
geotechStorage.addReport({
  id: crypto.randomUUID(),
  siteId: 'site-123',
  classification: 'select-fill',
  suitabilityScore: 85,
  properties: {
    moistureContent: 12,
    compaction: 95,
    // ... other properties
  },
  // ... other fields
});

// Update report with new analysis
geotechStorage.updateReport(reportId, {
  classification: 'structural-fill',
  suitabilityScore: 92
});
```

---

### Municipality Storage

**File:** `src/lib/municipalityStorage.ts`

Manages municipality integrations, permits, and sync history.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getIntegrations()` | - | `MunicipalityIntegration[]` | Gets all integrations |
| `setIntegrations(integrations)` | `integrations: MunicipalityIntegration[]` | `void` | Saves integrations |
| `addIntegration(integration)` | `integration: MunicipalityIntegration` | `void` | Adds integration |
| `updateIntegration(id, updates)` | `id: string, updates: Partial<MunicipalityIntegration>` | `void` | Updates integration |
| `deleteIntegration(id)` | `id: string` | `void` | Deletes integration |
| `getPermits()` | - | `Permit[]` | Gets all permits |
| `setPermits(permits)` | `permits: Permit[]` | `void` | Saves permits |
| `addPermits(permits)` | `permits: Permit[]` | `void` | Adds multiple permits |
| `getPermitsByMunicipality(id)` | `municipalityId: string` | `Permit[]` | Filters permits by municipality |
| `getSyncHistory()` | - | `SyncHistoryEntry[]` | Gets sync history |
| `setSyncHistory(history)` | `history: SyncHistoryEntry[]` | `void` | Saves sync history |
| `addSyncHistoryEntry(entry)` | `entry: SyncHistoryEntry` | `void` | Adds sync entry (prepends) |
| `getSyncHistoryByMunicipality(id)` | `municipalityId: string` | `SyncHistoryEntry[]` | Filters history by municipality |

**Async Functions:**

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `testConnection(integration)` | `integration: MunicipalityIntegration` | `Promise<{ success: boolean; message: string }>` | Tests API connection |
| `runSync(integration)` | `integration: MunicipalityIntegration` | `Promise<SyncHistoryEntry>` | Syncs permits from municipality |

**Usage Examples:**

```typescript
import { municipalityStorage, testConnection, runSync } from '@/lib/municipalityStorage';

// Add a municipality integration
municipalityStorage.addIntegration({
  id: crypto.randomUUID(),
  city: 'Charlotte',
  state: 'NC',
  apiBaseUrl: 'https://api.charlotte.gov/permits',
  authType: 'api_key',
  apiKey: 'xxx',
  syncFrequency: 'daily',
  isActive: true,
  // ... other properties
});

// Test connection
const result = await testConnection(integration);
if (result.success) {
  console.log('Connected:', result.message);
}

// Run sync operation
const syncEntry = await runSync(integration);
console.log(`Synced ${syncEntry.permitsCreated} new permits`);

// Get permits for a specific city
const charlottePermits = municipalityStorage.getPermitsByMunicipality('charlotte-id');
```

---

## Utility Functions

### Core Utilities

**File:** `src/lib/utils.ts`

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `cn(...inputs)` | `inputs: ClassValue[]` | `string` | Merges Tailwind CSS classes |

**Usage Example:**

```typescript
import { cn } from '@/lib/utils';

// Merge class names with conditional classes
<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'bg-primary' : 'bg-secondary'
)} />
```

---

### Matching Algorithm

**File:** `src/lib/matching.ts`

AI-powered site matching for earthwork logistics.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `calculateDistance(lat1, lon1, lat2, lon2)` | `number, number, number, number` | `number` | Haversine distance in miles |
| `calculateMatchScore(exportSite, importSite, distance)` | `Site, Site, number` | `number` | Compatibility score (0-100) |
| `getMatchReasons(exportSite, importSite, distance)` | `Site, Site, number` | `string[]` | Human-readable match reasons |
| `generateMatches(sites)` | `Site[]` | `Match[]` | Generates all viable matches |

**Usage Example:**

```typescript
import { generateMatches, calculateDistance } from '@/lib/matching';

// Generate matches for all sites
const sites = storage.getSites();
const matches = generateMatches(sites);

// Filter high-quality matches
const goodMatches = matches.filter(m => m.score >= 70);

// Calculate distance between two points
const distance = calculateDistance(35.2271, -80.8431, 35.7796, -78.6382);
```

**Scoring Factors:**
- Distance penalty: -1 point per mile
- Soil type mismatch: -20 points
- Volume difference (>50%): -15 points
- Contamination: -30 points
- Schedule conflict: -25 points

---

### Scheduler Functions

**File:** `src/lib/scheduler.ts`

Route optimization and schedule generation.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `generateRoutes(exportSite, importSite, distance)` | `Site, Site, number` | `{ fastest, cheapest, greenest }` | Three route options |
| `calculateTrucksNeeded(volume)` | `number` | `number` | Trucks needed for volume |
| `predictWeatherDelay(date)` | `Date` | `number` | Weather delay estimate (hours) |
| `predictTrafficDelay(route, startTime)` | `Route, string` | `number` | Traffic delay estimate (hours) |
| `generateAlerts(schedule, hauler, allSchedules)` | `Schedule, Hauler \| undefined, Schedule[]` | `Alert[]` | Schedule alerts |
| `selectBestHauler(haulers, trucksNeeded, route, prioritizeReliability)` | `Hauler[], number, Route, boolean` | `Hauler \| undefined` | Optimal hauler selection |
| `generateSchedules(matches, sites, haulers, existingSchedules, startDate)` | `Match[], Site[], Hauler[], Schedule[], Date` | `Schedule[]` | Generate schedules from matches |
| `simulateSchedule(schedule, newHaulerId, newDate, newVolume, newRouteType, haulers, sites, matches)` | Multiple optional params | `Schedule` | Simulate schedule changes |

**Usage Example:**

```typescript
import { generateRoutes, generateSchedules, simulateSchedule } from '@/lib/scheduler';

// Generate route options
const routes = generateRoutes(exportSite, importSite, 25);
console.log('Fastest:', routes.fastest.duration, 'hours');
console.log('Cheapest:', routes.cheapest.cost, 'dollars');
console.log('Greenest:', routes.greenest.carbonEmissions, 'kg CO2');

// Generate schedules from approved matches
const approvedMatches = matches.filter(m => m.status === 'approved');
const schedules = generateSchedules(
  approvedMatches,
  sites,
  haulers,
  existingSchedules,
  new Date()
);

// Simulate what-if scenario
const simulated = simulateSchedule(
  schedule,
  'hauler-2',      // Try different hauler
  '2024-02-15',    // New date
  500,             // Different volume
  'cheapest'       // Route type
);
```

---

### Performance Calculations

**File:** `src/lib/performanceCalculations.ts`

Executive KPIs, profitability, trends, and forecasting.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `calculateExecutiveKPIs(daysBack)` | `number` (default: 7) | `ExecutiveKPIs` | Key performance indicators |
| `calculateProfitability()` | - | `ProfitabilityMetrics` | Profit by job/region/hauler |
| `calculateTrends(daysBack)` | `number` (default: 30) | `TrendData[]` | Daily performance trends |
| `generateForecast()` | - | `ForecastData[]` | Supply/demand forecasts |
| `runScenarioSimulation(params)` | `ScenarioParams` | `ScenarioResult` | What-if scenario results |
| `calculateSustainability(daysBack)` | `number` (default: 30) | `SustainabilityMetrics` | Environmental impact metrics |
| `exportToCSV(data, filename)` | `any[], string` | `void` | Export data to CSV file |

**Usage Examples:**

```typescript
import { 
  calculateExecutiveKPIs, 
  calculateTrends, 
  runScenarioSimulation,
  exportToCSV 
} from '@/lib/performanceCalculations';

// Get weekly KPIs
const kpis = calculateExecutiveKPIs(7);
console.log('Volume:', kpis.totalVolumeWeek, 'CY');
console.log('Profit Margin:', kpis.profitMargin, '%');
console.log('CO2 Reduced:', kpis.co2Reduction, 'tons');

// Get 30-day trends
const trends = calculateTrends(30);

// Run scenario simulation
const scenario = runScenarioSimulation({
  fuelCostChange: 15,      // 15% fuel increase
  volumeChange: 10,        // 10% more volume
  haulerRateChange: 5      // 5% rate increase
});
console.log('Impact:', scenario.impact);
console.log('New Margin:', scenario.newMargin, '%');

// Export to CSV
exportToCSV(trends, 'performance-trends.csv');
```

---

### Performance Metrics

**File:** `src/lib/performanceMetrics.ts`

Driver-level performance analytics.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `calculateDriverPerformance(driver, tickets, sites)` | `Driver, DispatchTicket[], Site[]` | `DriverPerformanceMetrics` | Individual driver metrics |
| `calculatePerformanceTrends(tickets, days)` | `DispatchTicket[], number` | `PerformanceTrend[]` | Daily performance trends |

**Usage Example:**

```typescript
import { calculateDriverPerformance, calculatePerformanceTrends } from '@/lib/performanceMetrics';

// Get driver performance
const metrics = calculateDriverPerformance(driver, tickets, sites);
console.log('On-time Rate:', metrics.onTimeRate, '%');
console.log('Performance Score:', metrics.performanceScore);

// Get team trends
const trends = calculatePerformanceTrends(tickets, 30);
```

---

### Auto Dispatch

**File:** `src/lib/autoDispatch.ts`

AI-powered driver assignment optimization.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `findOptimalDriver(drivers, pickupSite, requiredVolume, activeTickets)` | `Driver[], Site, number, DispatchTicket[]` | `DriverScore \| null` | Best driver with score breakdown |
| `getDriverRecommendations(drivers, pickupSite, requiredVolume, activeTickets, topN)` | `Driver[], Site, number, DispatchTicket[], number` | `DriverScore[]` | Top N driver recommendations |

**Scoring Breakdown:**
- **Proximity** (25%): Distance to pickup site
- **Availability** (30%): Current driver status
- **Capacity** (20%): Truck capacity match
- **Performance** (15%): Historical performance score
- **Workload** (10%): Current active assignments

**Usage Example:**

```typescript
import { findOptimalDriver, getDriverRecommendations } from '@/lib/autoDispatch';

// Find best driver for a dispatch
const optimalDriver = findOptimalDriver(
  drivers,
  pickupSite,
  250,  // volume in CY
  activeTickets
);

if (optimalDriver) {
  console.log('Recommended:', optimalDriver.driver.name);
  console.log('Score:', optimalDriver.score);
  console.log('Breakdown:', optimalDriver.breakdown);
}

// Get top 5 recommendations
const recommendations = getDriverRecommendations(
  drivers,
  pickupSite,
  250,
  activeTickets,
  5
);
```

---

### Soil Classification

**File:** `src/lib/soilClassification.ts`

AI-powered soil analysis and recommendations.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `calculateSuitabilityScore(properties)` | `SoilProperties` | `number` | Score (0-100) |
| `classifySoil(properties, score)` | `SoilProperties, number` | `SoilClassification` | Classification type |
| `generateRecommendations(classification, properties, score)` | `SoilClassification, SoilProperties, number` | `{ reuseRecommendations, riskFactors, treatmentOptions }` | AI recommendations |
| `extractSoilDataFromText(text)` | `string` | `Partial<SoilProperties>` | Extract properties from text |
| `compareReports(reports)` | `GeotechReport[]` | `{ commonProperties, differences, averageScore }` | Compare multiple reports |

**Soil Classifications:**
- `structural-fill`: High quality, suitable for foundations
- `select-fill`: Good quality, general backfill
- `general-fill`: Acceptable for non-structural use
- `unsuitable`: Requires treatment
- `contaminated`: Requires remediation

**Usage Example:**

```typescript
import { 
  calculateSuitabilityScore, 
  classifySoil, 
  generateRecommendations 
} from '@/lib/soilClassification';

// Analyze soil properties
const properties: SoilProperties = {
  moistureContent: 12,
  compaction: 95,
  density: 125,
  pH: 7.2,
  organicContent: 2
};

const score = calculateSuitabilityScore(properties);
const classification = classifySoil(properties, score);
const recommendations = generateRecommendations(classification, properties, score);

console.log('Score:', score);
console.log('Classification:', classification);
console.log('Recommendations:', recommendations.reuseRecommendations);
console.log('Risks:', recommendations.riskFactors);
```

---

### Permit Scoring

**File:** `src/lib/permitScoring.ts`

AI scoring for earthwork likelihood in permits.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `calculateEarthworkScore(permit)` | `Permit` | `PermitScore` | Earthwork likelihood score |
| `getScoreColor(score)` | `number` | `string` | Color class for score |
| `getScoreBgColor(score)` | `number` | `string` | Background color class |

**Scoring Factors:**
- Earthwork flag (+30 if yes, -30 if no)
- Project type (Industrial: +24, Commercial: +7.5, etc.)
- Keywords (excavation, grading, foundation, etc.)
- Multi-phase indicator (+10)
- New construction (+15)

**Usage Example:**

```typescript
import { calculateEarthworkScore, getScoreColor } from '@/lib/permitScoring';

const score = calculateEarthworkScore(permit);
console.log('Score:', score.score);
console.log('Confidence:', score.confidence);
console.log('Factors:', score.factors);

// Apply styling
const colorClass = getScoreColor(score.score);
<span className={colorClass}>{score.score}%</span>
```

---

### OCR Simulator

**File:** `src/lib/ocrSimulator.ts`

Simulated document OCR extraction.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `simulateOCR(fileName, documentType)` | `string, string` | `OCRResult` | Extract document data |
| `extractTextFromFile(file)` | `File` | `Promise<string>` | Extract text from file |

**Supported Document Types:**
- `soil-manifest`
- `environmental-permit`
- `hauler-insurance`
- `soil-test-result`
- `transport-permit`
- `safety-certification`

**Usage Example:**

```typescript
import { simulateOCR, extractTextFromFile } from '@/lib/ocrSimulator';

// Simulate OCR extraction
const result = simulateOCR('permit.pdf', 'environmental-permit');
console.log('Permit Number:', result.permitNumber);
console.log('Expiration:', result.expirationDate);
console.log('Confidence:', result.confidence);

// Extract text from uploaded file
const text = await extractTextFromFile(uploadedFile);
```

---

## Type Definitions

All TypeScript interfaces are defined in `src/types/`:

| File | Types |
|------|-------|
| `site.ts` | `Site`, `Match`, `SiteType`, `SoilType`, `MatchStatus` |
| `scheduler.ts` | `Hauler`, `Schedule`, `Route`, `RouteType`, `Alert` |
| `dispatch.ts` | `Driver`, `DispatchTicket`, `DriverStatus`, `TicketStatus` |
| `operations.ts` | `Job`, `OperationsAlert`, `HaulerMessage`, `ShiftReport` |
| `compliance.ts` | `ComplianceDocument`, `ComplianceAlert`, `DocumentStatus` |
| `lead.ts` | `Lead`, `LeadStatus`, `LeadSource` |
| `municipality.ts` | `MunicipalityIntegration`, `Permit`, `SyncHistoryEntry` |
| `geotechnical.ts` | `GeotechReport`, `SoilProperties`, `SoilClassification` |
| `performance.ts` | `ExecutiveKPIs`, `ProfitabilityMetrics`, `TrendData`, `ForecastData` |

---

## Best Practices

### 1. Always Refresh Data After Mutations

```typescript
// After setting data, re-fetch to ensure UI sync
storage.setSites(updatedSites);
const freshSites = storage.getSites();
setSitesState(freshSites);
```

### 2. Use Type Guards for Safety

```typescript
const lead = leadStorage.getLeadById(id);
if (lead) {
  // TypeScript knows lead is defined here
  console.log(lead.companyName);
}
```

### 3. Batch Updates When Possible

```typescript
// Instead of multiple individual updates
const sites = storage.getSites();
const updatedSites = sites.map(s => ({
  ...s,
  status: calculateNewStatus(s)
}));
storage.setSites(updatedSites); // Single write
```

### 4. Handle Empty States

```typescript
const matches = storage.getMatches();
if (matches.length === 0) {
  // Show empty state UI
}
```

---

*Last Updated: December 2024*
*Version: 1.0.0*
