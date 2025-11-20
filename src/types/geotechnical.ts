export type SoilClassification = 
  | 'structural-fill' 
  | 'select-fill' 
  | 'general-fill' 
  | 'unsuitable' 
  | 'contaminated';

export interface SoilProperties {
  moistureContent?: number; // percentage
  compaction?: number; // percentage
  density?: number; // lb/ft³
  grainSize?: {
    gravel?: number; // percentage
    sand?: number; // percentage
    silt?: number; // percentage
    clay?: number; // percentage
  };
  contaminants?: string[];
  organicContent?: number; // percentage
  pH?: number;
  liquidLimit?: number;
  plasticLimit?: number;
}

export interface GeotechReport {
  id: string;
  name: string;
  siteId?: string; // Link to export/import site
  uploadDate: string;
  fileType: 'pdf' | 'image' | 'text';
  fileUrl?: string; // For display purposes
  
  // Extracted data
  classification: SoilClassification;
  suitabilityScore: number; // 1-100
  properties: SoilProperties;
  
  // AI Analysis
  aiExtracted: boolean;
  reuseRecommendations: string[];
  riskFactors: string[];
  treatmentOptions: string[];
  
  // Metadata
  location?: string;
  depth?: number; // feet
  testDate?: string;
  laboratory?: string;
  notes?: string;
}

export interface SoilComparison {
  reports: GeotechReport[];
  commonProperties: string[];
  differences: string[];
  bestMatch?: string; // report ID
}
