export type SiteType = 'export' | 'import';
export type SoilType = 'clay' | 'sand' | 'loam' | 'gravel' | 'mixed';
export type SiteStatus = 'pending' | 'matched' | 'approved' | 'rejected';

export interface Site {
  id: string;
  type: SiteType;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  soilType: SoilType;
  volume: number; // cubic yards
  scheduleStart: string;
  scheduleEnd: string;
  contaminated: boolean;
  priceExpectation?: number;
  projectOwner: string;
  status: SiteStatus;
  matchedSiteId?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  exportSiteId: string;
  importSiteId: string;
  score: number;
  distance: number; // miles
  costSavings: number;
  carbonReduction: number; // kg CO2
  reasons: string[];
  status: 'suggested' | 'approved' | 'rejected';
  createdAt: string;
}
