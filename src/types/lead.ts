export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted_to_job';

export interface Lead {
  id: string;
  permitId: string;
  projectName: string;
  contractorName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  address: string;
  description: string;
  leadOwner: string;
  leadStatus: LeadStatus;
  notes: string;
  jobId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PermitLeadStatus = 'not_created' | 'lead_created' | 'converted_to_job';
