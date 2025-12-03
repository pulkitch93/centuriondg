export type AuthType = 'api_key' | 'oauth' | 'none';
export type SyncFrequency = 'manual' | 'hourly' | 'daily';
export type IntegrationStatus = 'active' | 'inactive' | 'error';

export interface MunicipalityIntegration {
  id: string;
  city: string;
  state: string;
  apiBaseUrl: string;
  authType: AuthType;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  endpointPath?: string;
  syncFrequency: SyncFrequency;
  status: IntegrationStatus;
  lastSyncTime?: string;
  lastSyncResult?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permit {
  id: string;
  externalPermitId: string;
  municipalityId: string;
  projectName: string;
  projectType: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contractorName: string;
  contactEmail: string;
  contactPhone: string;
  estimatedStartDate?: string;
  description: string;
  estimatedEarthworkFlag: 'yes' | 'no' | 'unknown';
  syncedAt: string;
}

export interface SyncHistoryEntry {
  id: string;
  municipalityId: string;
  syncTime: string;
  permitsCreated: number;
  permitsUpdated: number;
  errors?: string[];
  status: 'success' | 'partial' | 'failed';
}
