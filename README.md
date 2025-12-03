# Centurion DG Platform

**Intelligent Earthwork Logistics Management System**

A comprehensive web application for managing earthwork logistics operations, built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui components.

**Code URL**: https://lovable.dev/projects/05f7fae6-08c9-4be7-baa9-f2f330ae7980

**Application URL**: https://centuriondg.lovable.app/
---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Getting Started](#getting-started)
4. [Feature Modules](#feature-modules)
   - [Dashboard](#1-dashboard)
   - [Operations Control Center](#2-operations-control-center)
   - [Materials Intelligence Hub](#3-materials-intelligence-hub)
   - [Hauler Network](#4-hauler-network)
   - [Dispatches](#5-dispatches)
   - [Logistics Scheduler](#6-logistics-scheduler)
   - [Compliance Center](#7-compliance-center)
   - [Permits & Leads](#8-permits--leads)
   - [Job Board](#9-job-board-sites)
   - [Performance Dashboard](#10-performance-dashboard)
   - [AI Assistant](#11-ai-assistant-floating-chatbot)
   - [Guided Product Tour](#12-guided-product-tour)
5. [Architecture & Data Flow](#architecture--data-flow)
6. [Design System](#design-system)
7. [Deployment](#deployment)

---

## Overview

Centurion DG Platform is an enterprise-grade logistics management system designed for earthwork and soil hauling operations. It features AI-powered matching, predictive scheduling, compliance tracking, and real-time operations monitoring.

### Key Capabilities

- **AI-Powered Site Matching**: Automatically match export sites with import sites based on soil type, distance, volume, and schedule compatibility
- **Intelligent Scheduling**: Generate optimized haul schedules with route optimization (fastest, cheapest, greenest)
- **Real-Time Operations**: Monitor jobs, drivers, and deliveries with live GPS tracking
- **Compliance Management**: Document management with OCR extraction and audit trails
- **Sales Pipeline**: Convert municipal permits into qualified leads and jobs
- **Executive Analytics**: KPIs, profitability analysis, forecasting, and sustainability metrics

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS with custom design tokens |
| UI Components | shadcn/ui (Radix UI primitives) |
| Routing | React Router DOM v6 |
| State Management | React useState/useEffect with localStorage persistence |
| Charts | Recharts |
| Maps | Mapbox GL JS |
| Drag & Drop | @dnd-kit/core & @dnd-kit/sortable |
| Date Handling | date-fns |
| Notifications | Sonner (toast notifications) |

---

## Getting Started

### Prerequisites

- Node.js 18+ & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Feature Modules

### 1. Dashboard

**Route**: `/dashboard`

**Purpose**: Central hub providing an overview of all operations with quick navigation to all modules.

**How It Works**:
- Loads sample data on initialization via `initializeSampleData()` and `initializePermitData()`
- Displays real-time KPI cards: Export Sites, Import Sites, AI Matches, Approved Matches
- Shows volume managed and cost savings from approved matches
- Includes Permits & Leads insights with AI-scored permit counts
- All navigation buttons include tooltips describing each module's function

**Key Components**:
- KPI Cards with color-coded borders (`border-l-4`)
- AIBadge component highlighting AI-powered features
- TooltipProvider wrapping all interactive elements

**Data Sources**: `storage.ts`, `schedulerStorage.ts`, `dispatchStorage.ts`, `operationsStorage.ts`, `municipalityStorage.ts`, `leadStorage.ts`

---

### 2. Operations Control Center

**Route**: `/operations`

**Purpose**: Real-time monitoring of all active jobs, drivers, and operations with a live map interface.

**How It Works**:
- Displays live map with job locations using Mapbox GL
- Shows job status cards (active, completed, pending)
- Generates AI-powered operational alerts (weather, utilization, quality)
- Includes shift reports for daily summaries
- "Message Haulers" action button for fleet communication

**Key Features**:
- Live GPS tracking visualization
- Job status filtering and search
- AI-generated alerts with severity levels (high, medium, low)
- Shift report summaries with metrics

**Data Sources**: `operationsStorage.ts`, `initOperationsData.ts`

---

### 3. Materials Intelligence Hub

**Route**: `/materials`

**Purpose**: Geotechnical report management with AI-powered soil classification and material matching.

**How It Works**:
- Upload geotechnical reports (PDF, images) with simulated OCR extraction
- AI classifies soil into categories: Structural Fill, Select Fill, General Fill, Unsuitable, Contaminated
- Calculates suitability scores (0-100) based on soil properties
- Provides AI prescriptive insights for optimal sourcing matches

**Key Features**:
- **Report Upload**: `ReportUpload.tsx` component with OCR simulation (`ocrSimulator.ts`)
- **Soil Classification**: `soilClassification.ts` determines classification based on properties
- **AI Analysis**: `MaterialAnalysisDialog.tsx` shows detailed matching recommendations
- **Filtering**: Search by name/location, filter by classification type

**Data Flow**:
1. User uploads report → OCR extracts properties (moisture, compaction, plasticity)
2. `classifySoil()` determines classification
3. `calculateSuitabilityScore()` computes numeric score
4. Results stored in `geotechnicalStorage.ts`

---

### 4. Hauler Network

**Route**: `/haulers`

**Purpose**: Manage trucking partners and their driver fleets.

**How It Works**:
- Displays hauler companies with status (active/inactive) and reliability ratings
- Shows driver roster with availability status, certifications, and contact info
- Calculates fleet statistics: total haulers, active haulers, total drivers, available drivers
- All KPI cards include descriptive tooltips

**Key Features**:
- Hauler list with insurance expiry tracking
- Driver management per hauler
- Availability status indicators (available, on-job, off-duty)
- Performance ratings and truck capacity info

**Data Sources**: `schedulerStorage.ts` (haulers array with nested drivers)

---

### 5. Dispatches

**Route**: `/dispatches`

**Purpose**: Track dispatch tickets and deliveries with performance analytics.

**How It Works**:
- Creates dispatch tickets linking drivers, trucks, and sites
- Tracks ticket lifecycle: pending → in-transit → delivered → completed
- Records actual pickup/delivery times for performance calculation
- Calculates driver performance metrics using `performanceMetrics.ts`

**Key Features**:
- **Create Dispatch**: Dialog to assign driver, truck, pickup/delivery sites
- **Live Tracking**: Link to GPS tracking page (`/live-tracking`)
- **Performance Dashboard**: Link to driver performance analytics (`/performance`)
- **Auto-Dispatch**: `autoDispatch.ts` scores drivers based on proximity, availability, capacity, and workload

**Driver Scoring Algorithm** (`autoDispatch.ts`):
```
Score = (Proximity × 30%) + (Availability × 25%) + (Capacity × 20%) + (Performance × 15%) + (Workload × 10%)
```

---

### 6. Logistics Scheduler

**Route**: `/scheduler`

**Purpose**: AI-powered haul scheduling with route optimization and what-if simulation.

**How It Works**:
1. User approves matches in Job Board
2. Click "Generate AI Schedules" to create optimized schedules
3. AI selects best hauler, calculates route options, estimates times
4. Schedules can be dragged to different dates (DnD)
5. What-if simulator tests schedule changes

**Key Features**:
- **Route Optimization**: Three route types calculated per schedule
  - Fastest: Shortest duration
  - Cheapest: Lowest cost
  - Greenest: Minimum CO2 emissions
- **AI Alerts**: Weather delays, traffic predictions, hauler capacity warnings
- **Drag & Drop**: Reschedule by dragging to different date columns
- **What-If Simulator**: Test hauler changes, date shifts, volume adjustments
- **Mitigation Plans**: AI-suggested solutions for predicted bottlenecks

**Core Logic** (`scheduler.ts`):
- `generateRoutes()`: Creates three route options with distance, duration, cost, emissions
- `calculateTrucksNeeded()`: Volume ÷ truck capacity (20 CY default)
- `predictWeatherDelay()`: Seasonal weather impact simulation
- `selectBestHauler()`: Ranks haulers by availability, capacity, reliability

---

### 7. Compliance Center

**Route**: `/compliance`

**Purpose**: Document management for permits, manifests, certifications with audit trails.

**How It Works**:
- Upload compliance documents (soil manifests, permits, insurance, certifications)
- OCR extraction simulates data extraction from uploaded files
- Tracks document expiration with status: Valid, Expiring Soon, Expired, Pending Review
- Generates compliance alerts for critical/high-priority issues
- Maintains full audit trail of document activities

**Key Features**:
- **Document Upload**: `handleFileUpload()` with progress indicator and OCR simulation
- **AI Risk Detection**: Proactive alerts for expiring permits, missing documents
- **Auto-Verification**: Simulated OCR accuracy scoring
- **Audit Trail**: Every action logged with timestamp, user, and details
- **Risk Report**: `ComplianceRiskDialog.tsx` shows comprehensive risk analysis

**Document Types**: Soil Manifest, Environmental Permit, Hauler Insurance, Soil Test Result, Transport Permit, Safety Certification

**Data Sources**: `complianceStorage.ts`, `initComplianceData.ts`

---

### 8. Permits & Leads

**Route**: `/permits-leads`

**Purpose**: Convert municipal construction permits into qualified sales leads and jobs.

**How It Works**:
1. **Permit Inbox**: Displays permits synced from municipality integrations
2. **AI Scoring**: Each permit scored for earthwork likelihood (0-100)
3. **Create Lead**: Convert promising permits into sales leads
4. **Lead Management**: Track lead status through sales pipeline
5. **Convert to Job**: Create Job Board entries from qualified leads

**Workflow**:
```
Permit → Lead → Job
```

**AI Scoring** (`permitScoring.ts`):
- Analyzes project type, description keywords, estimated value
- Identifies earthwork indicators (excavation, grading, fill)
- Returns score with confidence level and reasoning

**Lead Statuses**: New → Contacted → Qualified → Converted to Job (or Disqualified)

**Key Components**:
- `PermitDetailsDrawer.tsx`: Full permit details with actions
- `LeadFormDialog.tsx`: Create/edit lead information
- `CreateJobDialog.tsx`: Convert lead to Job Board site

**Related Route**: `/permit-integrations` - Configure municipality API connections

---

### 9. Job Board (Sites)

**Route**: `/sites`

**Purpose**: Manage export/import sites and view AI-generated matches.

**How It Works**:
- Add export sites (have excess soil) and import sites (need soil)
- AI matching algorithm scores compatibility between sites
- Users review and approve/reject suggested matches
- Approved matches flow to Scheduler for haul planning

**Matching Algorithm** (`matching.ts`):
```typescript
Score = 100 - distancePenalty - soilPenalty - volumePenalty - contaminationPenalty - schedulePenalty
```

**Match Criteria**:
- **Distance**: Closer sites score higher (within 30 miles preferred)
- **Soil Type**: Matching soil classifications
- **Volume**: Similar volumes = better alignment
- **Contamination**: Clean soil preferred
- **Schedule**: Overlapping availability windows

**Site Types**: Export (source), Import (destination)

**Soil Types**: Topsoil, Fill Dirt, Clay, Sand, Gravel, Mixed, Rock

---

### 10. Performance Dashboard

**Route**: `/performance`

**Purpose**: Executive-level analytics with KPIs, trends, forecasting, and sustainability metrics.

**How It Works**:
- Calculates real-time KPIs from dispatch and operations data
- Generates 30-day trend analysis for key metrics
- Provides AI-powered forecasting with confidence intervals
- Includes what-if scenario modeling for business planning
- Tracks sustainability metrics (carbon offset, fuel efficiency)

**Key Sections**:
1. **Executive KPIs**: Weekly volume, cost per CY, profit margin, hauler reliability
2. **Sales Pipeline**: Permit-to-lead-to-job conversion funnel with conversion rates
3. **30-Day Trends**: Charts showing historical performance patterns
4. **Forecasting**: Projected volume, revenue, and costs with AI predictions
5. **Scenario Modeling**: Adjust fuel costs, volume, hauler rates to see impact
6. **Sustainability**: Carbon reduction, emissions tracking, eco-efficiency scores

**Calculations** (`performanceCalculations.ts`):
- `calculateExecutiveKPIs()`: Aggregates dispatch data for period
- `calculateProfitability()`: Revenue - costs breakdown
- `calculateTrends()`: Historical data aggregation
- `generateForecast()`: Projects future based on trends
- `runScenarioSimulation()`: What-if analysis

---

### 11. AI Assistant (Floating Chatbot)

**Component**: `FloatingChatbot.tsx`

**Purpose**: Context-aware AI assistant available on every page.

**How It Works**:
- Floating button in bottom-right corner of all pages
- Three specialized modes: Sales, Ops, Executive
- Generates responses based on localStorage data
- Uses rule-based logic to answer common questions

**Modes**:
- **Sales**: Lead status, conversion rates, permit insights
- **Ops**: Job status, driver availability, schedule conflicts
- **Executive**: KPIs, profitability, forecasts

**Implementation**:
- State managed locally in component
- Responses generated from analyzing stored data
- No external API calls - fully client-side

---

### 12. Guided Product Tour

**Components**: `ProductTour.tsx`, `use-tour.ts`

**Purpose**: Onboarding experience for new users.

**How It Works**:
- 10-step tour covering all major modules
- Triggered via "Take Product Tour" button on Marketing page
- Tracks completion status in localStorage
- Each step links to relevant module for hands-on exploration

**Tour Steps**:
1. Dashboard Overview
2. Operations Center
3. Materials Hub
4. Hauler Network
5. Dispatches
6. Scheduler
7. Compliance
8. Permits & Leads
9. Job Board
10. Performance Dashboard

**Hook**: `useTour()` manages tour state:
- `isOpen`, `currentStep`, `hasCompletedTour`
- `startTour()`, `nextStep()`, `prevStep()`, `completeTour()`

---

## Architecture & Data Flow

### Data Persistence

All data is stored in browser localStorage using typed storage modules:

| Module | Storage File | Purpose |
|--------|-------------|---------|
| Sites & Matches | `storage.ts` | Job Board data |
| Schedules & Haulers | `schedulerStorage.ts` | Logistics scheduling |
| Dispatches | `dispatchStorage.ts` | Dispatch tickets |
| Operations | `operationsStorage.ts` | Jobs, alerts, shifts |
| Compliance | `complianceStorage.ts` | Documents, audit trails |
| Permits | `municipalityStorage.ts` | Imported permits |
| Leads | `leadStorage.ts` | Sales leads |
| Geotechnical | `geotechnicalStorage.ts` | Soil reports |

### Initialization

Sample data is generated on first load:
- `initializeData.ts` - Sites, matches, dispatches
- `initPermitData.ts` - Sample permits for Charlotte/Raleigh
- `initOperationsData.ts` - Jobs, alerts, shift reports
- `initComplianceData.ts` - Sample compliance documents
- `initHistoricalData.ts` - Historical dispatch data (30+ days)

---

## Design System

### Theming

Custom design tokens defined in `index.css` and `tailwind.config.ts`:

- **Colors**: HSL-based with semantic naming (primary, secondary, accent, status-*)
- **Shadows**: Custom shadow-subtle, shadow-elevated
- **Animations**: pulse-subtle for AI indicators

### AI Feature Highlighting

AI-powered features are visually distinguished:
- `AIBadge` component with Sparkles icon
- Gradient backgrounds (`from-accent/5 to-primary/5`)
- Pulsing indicators for real-time AI processing

### Component Library

Built on shadcn/ui with customizations:
- All components in `src/components/ui/`
- Consistent styling via Tailwind classes
- Responsive design throughout

---

## Deployment

### Via Lovable

1. Open [Lovable](https://lovable.dev/projects/05f7fae6-08c9-4be7-baa9-f2f330ae7980)
2. Click Share → Publish

### Custom Domain

1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow DNS configuration instructions

See: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Credits

**Designed and developed by Pulkit Chaudhary**

---

*Last updated: December 2024*
