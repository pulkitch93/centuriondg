# Centurion DG Platform - Architecture Documentation

This document provides a comprehensive overview of the Centurion DG Platform architecture, including component relationships, data flow, and system design patterns.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Application Layer Structure](#application-layer-structure)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Module Dependencies](#module-dependencies)
5. [Storage Architecture](#storage-architecture)
6. [Component Hierarchy](#component-hierarchy)
7. [Routing Structure](#routing-structure)
8. [AI Integration Architecture](#ai-integration-architecture)

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[React Components]
        Pages[Page Components]
        Shared[Shared UI Components]
    end
    
    subgraph "Business Logic Layer"
        Hooks[Custom Hooks]
        Utils[Utility Functions]
        Calculations[Business Calculations]
    end
    
    subgraph "Data Layer"
        Storage[localStorage Modules]
        Types[TypeScript Interfaces]
        Init[Data Initialization]
    end
    
    subgraph "External Services"
        Mapbox[Mapbox GL]
        Charts[Recharts]
    end
    
    UI --> Hooks
    Pages --> Shared
    Pages --> Hooks
    Hooks --> Storage
    Hooks --> Utils
    Utils --> Calculations
    Storage --> Types
    Init --> Storage
    Pages --> Mapbox
    Pages --> Charts
```

---

## Application Layer Structure

```mermaid
graph LR
    subgraph "Entry Point"
        Main[main.tsx]
        App[App.tsx]
    end
    
    subgraph "Routing"
        Router[React Router]
        Routes[Route Definitions]
    end
    
    subgraph "Pages"
        Marketing[Marketing Landing]
        Dashboard[Dashboard Hub]
        Operations[Operations Center]
        Materials[Materials Hub]
        Haulers[Hauler Network]
        Dispatches[Dispatch Management]
        Scheduler[Logistics Scheduler]
        Compliance[Compliance Center]
        Permits[Permits & Leads]
        Performance[Performance Dashboard]
    end
    
    Main --> App
    App --> Router
    Router --> Routes
    Routes --> Marketing
    Routes --> Dashboard
    Routes --> Operations
    Routes --> Materials
    Routes --> Haulers
    Routes --> Dispatches
    Routes --> Scheduler
    Routes --> Compliance
    Routes --> Permits
    Routes --> Performance
```

---

## Data Flow Architecture

### Core Data Flow Pattern

```mermaid
flowchart TD
    subgraph "User Interface"
        A[User Action]
        B[Component State]
        C[UI Update]
    end
    
    subgraph "State Management"
        D[React useState/useEffect]
        E[Custom Hooks]
    end
    
    subgraph "Data Persistence"
        F[Storage Module]
        G[localStorage]
    end
    
    subgraph "Business Logic"
        H[Calculation Functions]
        I[Matching Algorithms]
        J[Scheduling Logic]
    end
    
    A --> D
    D --> E
    E --> F
    F --> G
    E --> H
    H --> I
    I --> J
    J --> B
    B --> C
    G --> F
    F --> E
```

### Permits to Jobs Conversion Flow

```mermaid
flowchart LR
    subgraph "Data Sources"
        A[Municipality API]
        B[Manual Entry]
    end
    
    subgraph "Permit Processing"
        C[Permit Inbox]
        D[Earthwork Filter]
        E[Lead Creation]
    end
    
    subgraph "Lead Management"
        F[Lead Pipeline]
        G[Status Tracking]
        H[Contact Management]
    end
    
    subgraph "Job Creation"
        I[Job Board]
        J[Schedule Assignment]
        K[Dispatch Generation]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
```

---

## Module Dependencies

```mermaid
graph TD
    subgraph "Core Modules"
        Dashboard[Dashboard]
        Sites[Sites Management]
    end
    
    subgraph "Operations Modules"
        Operations[Operations Center]
        Dispatches[Dispatches]
        LiveTracking[Live Tracking]
    end
    
    subgraph "Planning Modules"
        Scheduler[Scheduler]
        Materials[Materials Hub]
    end
    
    subgraph "Business Modules"
        Permits[Permits & Leads]
        Compliance[Compliance Center]
        Performance[Performance Dashboard]
    end
    
    subgraph "Support Modules"
        Haulers[Hauler Network]
        AIAssistant[AI Assistant]
    end
    
    Dashboard --> Operations
    Dashboard --> Materials
    Dashboard --> Haulers
    Dashboard --> Dispatches
    Dashboard --> Scheduler
    Dashboard --> Compliance
    Dashboard --> Permits
    
    Sites --> Materials
    Sites --> Scheduler
    Sites --> Operations
    
    Haulers --> Dispatches
    Haulers --> Scheduler
    Haulers --> Operations
    
    Permits --> Sites
    Permits --> Operations
    
    Dispatches --> LiveTracking
    Dispatches --> Performance
    
    Scheduler --> Dispatches
    
    AIAssistant -.-> Dashboard
    AIAssistant -.-> Operations
    AIAssistant -.-> Performance
```

---

## Storage Architecture

```mermaid
graph TB
    subgraph "Storage Modules"
        A[storage.ts]
        B[schedulerStorage.ts]
        C[dispatchStorage.ts]
        D[operationsStorage.ts]
        E[complianceStorage.ts]
        F[leadStorage.ts]
        G[geotechnicalStorage.ts]
        H[municipalityStorage.ts]
    end
    
    subgraph "localStorage Keys"
        A1[centurion_sites]
        A2[centurion_matches]
        B1[centurion_haulers]
        B2[centurion_schedules]
        C1[centurion_drivers]
        C2[centurion_dispatch_tickets]
        D1[centurion_jobs]
        D2[centurion_alerts]
        D3[centurion_messages]
        D4[centurion_shift_reports]
        E1[centurion_compliance_documents]
        E2[centurion_compliance_alerts]
        F1[centurion_leads]
        G1[centurion_geotech_reports]
        H1[centurion_municipalities]
        H2[centurion_permits]
    end
    
    A --> A1
    A --> A2
    B --> B1
    B --> B2
    C --> C1
    C --> C2
    D --> D1
    D --> D2
    D --> D3
    D --> D4
    E --> E1
    E --> E2
    F --> F1
    G --> G1
    H --> H1
    H --> H2
```

### Data Initialization Flow

```mermaid
sequenceDiagram
    participant App as App.tsx
    participant Init as initializeData.ts
    participant Storage as Storage Modules
    participant LS as localStorage
    
    App->>Init: Call initializeData()
    Init->>Storage: Check if data exists
    Storage->>LS: getItem(key)
    LS-->>Storage: null or existing data
    
    alt Data doesn't exist
        Init->>Init: Generate sample data
        Init->>Storage: Set initial data
        Storage->>LS: setItem(key, data)
    end
    
    Storage-->>Init: Data ready
    Init-->>App: Initialization complete
```

---

## Component Hierarchy

### Page Component Structure

```mermaid
graph TD
    subgraph "Common Components"
        PageHeader[PageHeader]
        Footer[Footer]
        FloatingChatbot[FloatingChatbot]
        ProductTour[ProductTour]
    end
    
    subgraph "UI Components - shadcn/ui"
        Card[Card]
        Button[Button]
        Dialog[Dialog]
        Table[Table]
        Tabs[Tabs]
        Badge[Badge]
        Tooltip[Tooltip]
        Select[Select]
        Input[Input]
    end
    
    subgraph "Custom Components"
        MaterialsMap[MaterialsMap]
        ReportUpload[ReportUpload]
        WhatIfSimulator[WhatIfSimulator]
        IntegrationForm[IntegrationForm]
        LeadFormDialog[LeadFormDialog]
        CreateJobDialog[CreateJobDialog]
    end
    
    subgraph "Page Layout"
        Page[Page Component]
        Page --> PageHeader
        Page --> Content[Main Content]
        Page --> Footer
        Page --> FloatingChatbot
    end
    
    Content --> Card
    Content --> Table
    Content --> Dialog
    Dialog --> Custom[Custom Dialog Components]
```

### Dashboard Component Structure

```mermaid
graph TD
    Dashboard[Dashboard.tsx]
    
    subgraph "Header Section"
        Title[Platform Title]
        AIBadge[AI Badge]
    end
    
    subgraph "Navigation Cards"
        OpsCard[Operations Center]
        MaterialsCard[Materials Hub]
        HaulersCard[Hauler Network]
        DispatchCard[Dispatches]
        SchedulerCard[Scheduler]
        ComplianceCard[Compliance]
        PermitsCard[Permits & Leads]
        JobsCard[Job Board]
    end
    
    subgraph "Shared Components"
        Tooltip[Tooltip Wrappers]
        Icons[Lucide Icons]
    end
    
    Dashboard --> Header Section
    Dashboard --> Navigation Cards
    Navigation Cards --> Tooltip
    Navigation Cards --> Icons
```

---

## Routing Structure

```mermaid
graph TD
    Root["/"]
    
    Root --> Marketing[Marketing Page]
    
    subgraph "Application Routes"
        Dashboard["/dashboard"]
        Sites["/sites"]
        NewSite["/sites/new"]
        Haulers["/haulers"]
        Dispatches["/dispatches"]
        DriverMobile["/driver/:driverId"]
        LiveTracking["/live-tracking"]
        Operations["/operations"]
        Scheduler["/scheduler"]
        ScheduleDetail["/scheduler/:scheduleId"]
        Materials["/materials"]
        MaterialProfile["/materials/:siteId"]
        Compliance["/compliance"]
        Permits["/permits"]
        Performance["/performance"]
        AIAssistant["/ai-assistant"]
        Integrations["/permit-integrations"]
    end
    
    Root --> Dashboard
    Dashboard --> Sites
    Sites --> NewSite
    Dashboard --> Haulers
    Dashboard --> Dispatches
    Dispatches --> DriverMobile
    Dispatches --> LiveTracking
    Dashboard --> Operations
    Dashboard --> Scheduler
    Scheduler --> ScheduleDetail
    Dashboard --> Materials
    Materials --> MaterialProfile
    Dashboard --> Compliance
    Dashboard --> Permits
    Dashboard --> Performance
    Dashboard --> AIAssistant
    Dashboard --> Integrations
```

---

## AI Integration Architecture

### AI Assistant Data Flow

```mermaid
flowchart TD
    subgraph "User Interface"
        A[Floating Chatbot]
        B[Mode Selection]
        C[User Input]
    end
    
    subgraph "AI Modes"
        D[Sales Mode]
        E[Ops Mode]
        F[Executive Mode]
    end
    
    subgraph "Data Sources"
        G[Sites Data]
        H[Dispatch Data]
        I[Performance Metrics]
        J[Lead Pipeline]
        K[Compliance Status]
    end
    
    subgraph "Response Generation"
        L[Context Analysis]
        M[Rule-Based Logic]
        N[Response Formatting]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    
    D --> G
    D --> J
    E --> H
    E --> G
    F --> I
    F --> K
    
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M
    M --> N
    N --> A
```

### AI-Powered Features Distribution

```mermaid
graph LR
    subgraph "AI Features"
        Matching[Site Matching Algorithm]
        Scheduling[Route Optimization]
        Scoring[Permit Scoring]
        Classification[Soil Classification]
        Forecasting[Performance Forecasting]
        OCR[Document OCR Simulation]
    end
    
    subgraph "Modules Using AI"
        Materials[Materials Hub]
        Scheduler[Scheduler]
        Permits[Permits Module]
        Compliance[Compliance Center]
        Performance[Performance Dashboard]
    end
    
    Matching --> Materials
    Scheduling --> Scheduler
    Scoring --> Permits
    Classification --> Materials
    Forecasting --> Performance
    OCR --> Compliance
```

---

## Type System Architecture

```mermaid
graph TD
    subgraph "Core Types"
        Site[site.ts - Site, Match]
        Scheduler[scheduler.ts - Hauler, Schedule, Route]
        Dispatch[dispatch.ts - Driver, DispatchTicket]
        Operations[operations.ts - Job, Alert, Message]
    end
    
    subgraph "Domain Types"
        Compliance[compliance.ts - Document, ComplianceAlert]
        Lead[lead.ts - Lead, LeadStatus]
        Municipality[municipality.ts - Municipality, Permit]
        Geotech[geotechnical.ts - GeotechReport]
        Performance[performance.ts - Metrics, Trends]
    end
    
    subgraph "Relationships"
        Site --> Scheduler
        Scheduler --> Dispatch
        Dispatch --> Operations
        Municipality --> Lead
        Lead --> Operations
        Site --> Geotech
    end
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI Framework** | React 18 | Component-based UI |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite | Fast development & builds |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | shadcn/ui | Pre-built accessible components |
| **Routing** | React Router v6 | Client-side routing |
| **Charts** | Recharts | Data visualization |
| **Maps** | Mapbox GL | Interactive mapping |
| **State** | React Hooks | Local state management |
| **Persistence** | localStorage | Client-side data storage |
| **Icons** | Lucide React | Icon library |
| **Animations** | Tailwind Animate | CSS animations |

---

## Design Patterns Used

### 1. **Container/Presentational Pattern**
- Pages act as containers managing state and data
- UI components handle presentation only

### 2. **Custom Hook Pattern**
- `use-toast.ts` - Toast notifications
- `use-mobile.tsx` - Responsive detection
- `use-tour.ts` - Product tour state

### 3. **Storage Abstraction Pattern**
- Each domain has dedicated storage module
- Consistent CRUD interface across all storage modules

### 4. **Initialization Pattern**
- Sample data initialized on first load
- Prevents empty state issues

### 5. **Component Composition**
- Small, focused components
- Composed into larger features

---

## Security Considerations

```mermaid
graph TD
    subgraph "Current Implementation"
        A[Client-Side Only]
        B[localStorage Storage]
        C[No Authentication]
        D[Sample Data]
    end
    
    subgraph "Production Considerations"
        E[Backend API Required]
        F[Database Storage]
        G[User Authentication]
        H[Role-Based Access]
        I[Data Encryption]
    end
    
    A -.-> E
    B -.-> F
    C -.-> G
    D -.-> H
    A -.-> I
```

---

## Performance Optimizations

1. **Code Splitting**: React Router lazy loading capable
2. **Component Memoization**: React.memo for heavy components
3. **Efficient Re-renders**: Proper dependency arrays in useEffect
4. **localStorage Caching**: Reduces computation on repeat visits
5. **Tailwind Purging**: Only used CSS classes in production

---

*Last Updated: December 2024*
*Version: 1.0.0*
