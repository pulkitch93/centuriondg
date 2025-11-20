export type TruckType = 'dump-truck' | 'tri-axle' | 'quad-axle' | 'semi-trailer' | 'articulated';
export type DispatchStatus = 'pending' | 'accepted' | 'en-route-pickup' | 'loading' | 'en-route-delivery' | 'unloading' | 'delivered' | 'cancelled';
export type IssueType = 'delay' | 'breakdown' | 'site-closed' | 'weather' | 'access-denied' | 'other';

export interface Driver {
  id: string;
  name: string;
  haulerId: string;
  truckType: TruckType;
  truckCapacity: number; // cubic yards
  licensePlate: string;
  certifications: string[];
  performanceScore: number; // 0-100
  phone: string;
  status: 'available' | 'on-job' | 'off-duty';
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface DispatchTicket {
  id: string;
  scheduleId?: string; // Link to schedule if AI-generated
  driverId?: string;
  haulerCompany: string;
  exportSiteId: string;
  importSiteId: string;
  volume: number; // cubic yards
  status: DispatchStatus;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  loadedAt?: string;
  deliveredAt?: string;
  loadPhotoUrl?: string;
  unloadPhotoUrl?: string;
  digitalSignature?: string;
  actualVolume?: number;
  gpsTrack: Array<{
    lat: number;
    lng: number;
    timestamp: string;
  }>;
  eta?: string;
  issues: Issue[];
  notes?: string;
}

export interface Issue {
  id: string;
  type: IssueType;
  description: string;
  timestamp: string;
  resolved: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface HaulerPerformanceMetrics {
  haulerId: string;
  totalHauls: number;
  onTimeDeliveries: number;
  averageDelay: number; // minutes
  issuesReported: number;
  customerRating: number; // 0-5
}
