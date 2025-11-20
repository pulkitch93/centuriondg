export type DocumentType = 
  | 'soil-manifest' 
  | 'environmental-permit' 
  | 'hauler-insurance' 
  | 'soil-test-result'
  | 'geotechnical-report'
  | 'transport-permit'
  | 'safety-certification';

export type DocumentStatus = 'valid' | 'expiring-soon' | 'expired' | 'pending-review' | 'missing';
export type ComplianceRisk = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceDocument {
  id: string;
  type: DocumentType;
  name: string;
  fileName: string;
  fileUrl?: string; // Base64 or blob URL for client-side storage
  uploadedAt: string;
  uploadedBy: string;
  
  // OCR Extracted Data
  permitNumber?: string;
  issueDate?: string;
  expirationDate?: string;
  requiredAction?: string;
  authority?: string;
  
  // Linkages
  linkedJobId?: string;
  linkedSiteId?: string;
  linkedHaulerId?: string;
  linkedMaterialId?: string;
  
  // Status
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  
  // Compliance
  complianceNotes?: string;
  auditTrail: AuditEntry[];
  
  // Signatures
  signatures: Signature[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

export interface Signature {
  id: string;
  signedBy: string;
  signedAt: string;
  role: string;
  signatureData?: string; // Base64 encoded signature image
}

export interface ComplianceAlert {
  id: string;
  type: 'missing-document' | 'expired-document' | 'expiring-soon' | 'action-required';
  severity: ComplianceRisk;
  title: string;
  message: string;
  documentId?: string;
  jobId?: string;
  siteId?: string;
  dueDate?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  timestamp: string;
}

export interface ComplianceSummary {
  totalDocuments: number;
  validDocuments: number;
  expiringSoon: number;
  expired: number;
  pendingReview: number;
  riskLevel: ComplianceRisk;
  activeAlerts: number;
  criticalAlerts: number;
}
