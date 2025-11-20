export type JobStatus = 'pending' | 'in-route' | 'loading' | 'loaded' | 'delivering' | 'completed' | 'delayed';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'weather' | 'delay' | 'quality' | 'utilization' | 'idle' | 'route-disruption';

export interface Job {
  id: string;
  scheduleId?: string;
  exportSiteId: string;
  importSiteId: string;
  haulerId: string;
  volumePlanned: number; // cubic yards
  volumeActual: number; // cubic yards delivered so far
  trucksActive: number;
  trucksAssigned: number;
  status: JobStatus;
  startTime: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  alerts: string[]; // Alert IDs
  notes?: string;
  createdAt: string;
}

export interface OperationsAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  jobId?: string;
  driverId?: string;
  siteId?: string;
  riskPercentage?: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface HaulerMessage {
  id: string;
  haulerId: string;
  senderId: string; // operations user
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'normal' | 'urgent';
}

export interface ShiftReport {
  id: string;
  date: string;
  shift: 'day' | 'night';
  totalJobs: number;
  completedJobs: number;
  delayedJobs: number;
  totalVolume: number;
  trucksActive: number;
  incidents: number;
  efficiency: number; // percentage
  topPerformer?: string; // driver ID
  notes?: string;
  createdAt: string;
}
