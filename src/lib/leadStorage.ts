import { Lead } from '@/types/lead';

const LEADS_KEY = 'centurion_leads';

export const leadStorage = {
  getLeads: (): Lead[] => {
    const data = localStorage.getItem(LEADS_KEY);
    return data ? JSON.parse(data) : [];
  },

  setLeads: (leads: Lead[]) => {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  },

  addLead: (lead: Lead) => {
    const leads = leadStorage.getLeads();
    leads.push(lead);
    leadStorage.setLeads(leads);
  },

  updateLead: (id: string, updates: Partial<Lead>) => {
    const leads = leadStorage.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates, updatedAt: new Date().toISOString() };
      leadStorage.setLeads(leads);
    }
  },

  deleteLead: (id: string) => {
    const leads = leadStorage.getLeads().filter(l => l.id !== id);
    leadStorage.setLeads(leads);
  },

  getLeadByPermitId: (permitId: string): Lead | undefined => {
    return leadStorage.getLeads().find(l => l.permitId === permitId);
  },

  getLeadById: (id: string): Lead | undefined => {
    return leadStorage.getLeads().find(l => l.id === id);
  },
};
