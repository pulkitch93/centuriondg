import { MunicipalityIntegration, Permit, SyncHistoryEntry } from '@/types/municipality';

const INTEGRATIONS_KEY = 'centurion_municipality_integrations';
const PERMITS_KEY = 'centurion_permits';
const SYNC_HISTORY_KEY = 'centurion_sync_history';

export const municipalityStorage = {
  // Integrations
  getIntegrations: (): MunicipalityIntegration[] => {
    const data = localStorage.getItem(INTEGRATIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  setIntegrations: (integrations: MunicipalityIntegration[]) => {
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
  },

  addIntegration: (integration: MunicipalityIntegration) => {
    const integrations = municipalityStorage.getIntegrations();
    integrations.push(integration);
    municipalityStorage.setIntegrations(integrations);
  },

  updateIntegration: (id: string, updates: Partial<MunicipalityIntegration>) => {
    const integrations = municipalityStorage.getIntegrations();
    const index = integrations.findIndex(i => i.id === id);
    if (index !== -1) {
      integrations[index] = { ...integrations[index], ...updates, updatedAt: new Date().toISOString() };
      municipalityStorage.setIntegrations(integrations);
    }
  },

  deleteIntegration: (id: string) => {
    const integrations = municipalityStorage.getIntegrations().filter(i => i.id !== id);
    municipalityStorage.setIntegrations(integrations);
  },

  // Permits
  getPermits: (): Permit[] => {
    const data = localStorage.getItem(PERMITS_KEY);
    return data ? JSON.parse(data) : [];
  },

  setPermits: (permits: Permit[]) => {
    localStorage.setItem(PERMITS_KEY, JSON.stringify(permits));
  },

  addPermits: (newPermits: Permit[]) => {
    const permits = municipalityStorage.getPermits();
    permits.push(...newPermits);
    municipalityStorage.setPermits(permits);
  },

  getPermitsByMunicipality: (municipalityId: string): Permit[] => {
    return municipalityStorage.getPermits().filter(p => p.municipalityId === municipalityId);
  },

  // Sync History
  getSyncHistory: (): SyncHistoryEntry[] => {
    const data = localStorage.getItem(SYNC_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  setSyncHistory: (history: SyncHistoryEntry[]) => {
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
  },

  addSyncHistoryEntry: (entry: SyncHistoryEntry) => {
    const history = municipalityStorage.getSyncHistory();
    history.unshift(entry);
    municipalityStorage.setSyncHistory(history);
  },

  getSyncHistoryByMunicipality: (municipalityId: string): SyncHistoryEntry[] => {
    return municipalityStorage.getSyncHistory().filter(h => h.municipalityId === municipalityId);
  },
};

// Simulate API connection test
export const testConnection = async (integration: MunicipalityIntegration): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate different outcomes
  const random = Math.random();
  if (!integration.apiBaseUrl || !integration.apiBaseUrl.startsWith('http')) {
    return { success: false, message: 'Invalid API base URL format' };
  }
  if (integration.authType === 'api_key' && !integration.apiKey) {
    return { success: false, message: 'API key is required but not provided' };
  }
  if (integration.authType === 'oauth' && (!integration.clientId || !integration.clientSecret)) {
    return { success: false, message: 'OAuth credentials incomplete' };
  }
  if (random < 0.1) {
    return { success: false, message: 'Connection timeout - server not responding' };
  }
  if (random < 0.15) {
    return { success: false, message: 'Invalid credentials - authentication failed' };
  }
  
  return { success: true, message: 'Connection successful, permits endpoint reachable' };
};

// Simulate sync operation
export const runSync = async (integration: MunicipalityIntegration): Promise<SyncHistoryEntry> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const random = Math.random();
  const permitsCreated = Math.floor(Math.random() * 15) + 1;
  const permitsUpdated = Math.floor(Math.random() * 8);
  
  // Generate sample permits
  const newPermits: Permit[] = [];
  const projectTypes = ['Commercial', 'Residential', 'Industrial', 'Infrastructure', 'Mixed Use'];
  const statuses = ['Approved', 'Pending', 'Under Review', 'Issued'];
  const contractors = ['ABC Construction', 'BuildRight Inc', 'Metro Developers', 'Summit Builders', 'Apex Contractors'];
  
  for (let i = 0; i < permitsCreated; i++) {
    newPermits.push({
      id: crypto.randomUUID(),
      externalPermitId: `${integration.city.substring(0, 3).toUpperCase()}-${Date.now()}-${i}`,
      municipalityId: integration.id,
      projectName: `${['Oak', 'Pine', 'Cedar', 'Maple', 'Elm'][Math.floor(Math.random() * 5)]} ${['Plaza', 'Tower', 'Center', 'Complex', 'Park'][Math.floor(Math.random() * 5)]}`,
      projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      address: `${Math.floor(Math.random() * 9000) + 1000} ${['Main', 'Oak', 'First', 'Commerce', 'Industrial'][Math.floor(Math.random() * 5)]} ${['St', 'Ave', 'Blvd', 'Dr'][Math.floor(Math.random() * 4)]}`,
      city: integration.city,
      state: integration.state,
      zip: `${Math.floor(Math.random() * 90000) + 10000}`,
      contractorName: contractors[Math.floor(Math.random() * contractors.length)],
      contactEmail: `contact@${contractors[Math.floor(Math.random() * contractors.length)].toLowerCase().replace(/\s/g, '')}.com`,
      contactPhone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      estimatedStartDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `New ${projectTypes[Math.floor(Math.random() * projectTypes.length)].toLowerCase()} development project`,
      estimatedEarthworkFlag: ['yes', 'no', 'unknown'][Math.floor(Math.random() * 3)] as 'yes' | 'no' | 'unknown',
      syncedAt: new Date().toISOString(),
    });
  }
  
  municipalityStorage.addPermits(newPermits);
  
  const entry: SyncHistoryEntry = {
    id: crypto.randomUUID(),
    municipalityId: integration.id,
    syncTime: new Date().toISOString(),
    permitsCreated,
    permitsUpdated,
    status: random < 0.1 ? 'partial' : 'success',
    errors: random < 0.1 ? ['Some records skipped due to validation errors'] : undefined,
  };
  
  municipalityStorage.addSyncHistoryEntry(entry);
  municipalityStorage.updateIntegration(integration.id, {
    lastSyncTime: entry.syncTime,
    lastSyncResult: entry.status === 'success' ? `${permitsCreated} created, ${permitsUpdated} updated` : 'Completed with errors',
  });
  
  return entry;
};
