import { GeotechReport } from '@/types/geotechnical';

const REPORTS_KEY = 'centurion_geotech_reports';

export const geotechStorage = {
  getReports: (): GeotechReport[] => {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setReports: (reports: GeotechReport[]) => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },
  
  addReport: (report: GeotechReport) => {
    const reports = geotechStorage.getReports();
    geotechStorage.setReports([...reports, report]);
  },
  
  updateReport: (id: string, updates: Partial<GeotechReport>) => {
    const reports = geotechStorage.getReports();
    const updated = reports.map(r => r.id === id ? { ...r, ...updates } : r);
    geotechStorage.setReports(updated);
  },
  
  deleteReport: (id: string) => {
    const reports = geotechStorage.getReports();
    geotechStorage.setReports(reports.filter(r => r.id !== id));
  },
};
