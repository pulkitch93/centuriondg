import { ComplianceDocument, ComplianceAlert } from '@/types/compliance';

const DOCUMENTS_KEY = 'centurion_compliance_documents';
const ALERTS_KEY = 'centurion_compliance_alerts';

export const complianceStorage = {
  // Documents
  getDocuments: (): ComplianceDocument[] => {
    const data = localStorage.getItem(DOCUMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setDocuments: (documents: ComplianceDocument[]) => {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  },
  
  addDocument: (document: ComplianceDocument) => {
    const documents = complianceStorage.getDocuments();
    documents.push(document);
    complianceStorage.setDocuments(documents);
  },
  
  updateDocument: (id: string, updates: Partial<ComplianceDocument>) => {
    const documents = complianceStorage.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
      documents[index] = { ...documents[index], ...updates };
      complianceStorage.setDocuments(documents);
    }
  },
  
  // Alerts
  getAlerts: (): ComplianceAlert[] => {
    const data = localStorage.getItem(ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setAlerts: (alerts: ComplianceAlert[]) => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  },
  
  addAlert: (alert: ComplianceAlert) => {
    const alerts = complianceStorage.getAlerts();
    alerts.push(alert);
    complianceStorage.setAlerts(alerts);
  },
  
  acknowledgeAlert: (id: string, acknowledgedBy: string) => {
    const alerts = complianceStorage.getAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index].acknowledged = true;
      alerts[index].acknowledgedBy = acknowledgedBy;
      alerts[index].acknowledgedAt = new Date().toISOString();
      complianceStorage.setAlerts(alerts);
    }
  },
};
