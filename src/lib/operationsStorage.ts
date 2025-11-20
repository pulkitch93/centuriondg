import { Job, OperationsAlert, HaulerMessage, ShiftReport } from '@/types/operations';

const JOBS_KEY = 'centurion_jobs';
const ALERTS_KEY = 'centurion_alerts';
const MESSAGES_KEY = 'centurion_messages';
const SHIFT_REPORTS_KEY = 'centurion_shift_reports';

export const operationsStorage = {
  // Jobs
  getJobs: (): Job[] => {
    const data = localStorage.getItem(JOBS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setJobs: (jobs: Job[]) => {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  },
  
  // Alerts
  getAlerts: (): OperationsAlert[] => {
    const data = localStorage.getItem(ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setAlerts: (alerts: OperationsAlert[]) => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  },
  
  // Messages
  getMessages: (): HaulerMessage[] => {
    const data = localStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setMessages: (messages: HaulerMessage[]) => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  },
  
  // Shift Reports
  getShiftReports: (): ShiftReport[] => {
    const data = localStorage.getItem(SHIFT_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  setShiftReports: (reports: ShiftReport[]) => {
    localStorage.setItem(SHIFT_REPORTS_KEY, JSON.stringify(reports));
  },
};
