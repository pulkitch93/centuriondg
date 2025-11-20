import { complianceStorage } from './complianceStorage';
import { ComplianceDocument, ComplianceAlert } from '@/types/compliance';

export const initializeComplianceData = () => {
  const existingDocs = complianceStorage.getDocuments();
  
  if (existingDocs.length === 0) {
    const sampleDocuments: ComplianceDocument[] = [
      {
        id: 'DOC-5501',
        type: 'soil-manifest',
        name: 'Soil Transport Manifest - January 2025',
        fileName: 'soil_manifest_jan2025.pdf',
        uploadedAt: '2025-01-15T10:30:00Z',
        uploadedBy: 'Operations Manager',
        permitNumber: 'MAN-2025-NC-5501',
        issueDate: '2025-01-15',
        expirationDate: '2025-02-28',
        authority: 'NC Department of Environmental Quality',
        linkedJobId: 'J-3003',
        linkedSiteId: 'EX-101',
        status: 'valid',
        verifiedBy: 'Compliance Officer',
        verifiedAt: '2025-01-15T14:00:00Z',
        complianceNotes: 'All required fields completed. Approved for transport.',
        auditTrail: [
          {
            id: 'AUD-1',
            timestamp: '2025-01-15T10:30:00Z',
            action: 'Document Uploaded',
            performedBy: 'Operations Manager',
            details: 'Initial upload via compliance portal'
          },
          {
            id: 'AUD-2',
            timestamp: '2025-01-15T14:00:00Z',
            action: 'Verified',
            performedBy: 'Compliance Officer',
            details: 'OCR extraction verified and approved'
          }
        ],
        signatures: [
          {
            id: 'SIG-1',
            signedBy: 'John Smith',
            signedAt: '2025-01-15T10:30:00Z',
            role: 'Operations Manager'
          }
        ]
      },
      {
        id: 'DOC-5502',
        type: 'environmental-permit',
        name: 'Environmental Excavation Permit',
        fileName: 'env_permit_ex102.pdf',
        uploadedAt: '2024-12-20T09:00:00Z',
        uploadedBy: 'Project Coordinator',
        permitNumber: 'ENV-2025-NC-337',
        issueDate: '2025-01-15',
        expirationDate: '2025-02-15',
        requiredAction: 'Renewal within 7 days',
        authority: 'Charlotte-Mecklenburg Environmental Services',
        linkedSiteId: 'EX-102',
        status: 'expiring-soon',
        verifiedBy: 'Environmental Specialist',
        verifiedAt: '2024-12-20T11:00:00Z',
        complianceNotes: 'Permit expires soon. Renewal application submitted.',
        auditTrail: [
          {
            id: 'AUD-3',
            timestamp: '2024-12-20T09:00:00Z',
            action: 'Document Uploaded',
            performedBy: 'Project Coordinator',
            details: 'Environmental permit for EX-102'
          },
          {
            id: 'AUD-4',
            timestamp: '2024-12-20T11:00:00Z',
            action: 'Verified',
            performedBy: 'Environmental Specialist',
            details: 'Permit details verified'
          },
          {
            id: 'AUD-5',
            timestamp: '2025-01-08T15:30:00Z',
            action: 'Expiration Alert',
            performedBy: 'System',
            details: 'Auto-generated expiration warning - 7 days remaining'
          }
        ],
        signatures: [
          {
            id: 'SIG-2',
            signedBy: 'Sarah Johnson',
            signedAt: '2024-12-20T09:00:00Z',
            role: 'Project Coordinator'
          }
        ]
      },
      {
        id: 'DOC-5503',
        type: 'hauler-insurance',
        name: 'Commercial Auto Insurance Certificate',
        fileName: 'insurance_h02.pdf',
        uploadedAt: '2024-11-01T08:00:00Z',
        uploadedBy: 'Finance Department',
        permitNumber: 'INS-H02-2025',
        issueDate: '2024-11-01',
        expirationDate: '2025-03-20',
        authority: 'State Farm Insurance',
        linkedHaulerId: 'H-02',
        status: 'valid',
        verifiedBy: 'Risk Manager',
        verifiedAt: '2024-11-01T10:00:00Z',
        complianceNotes: '$2M liability coverage. Meets all requirements.',
        auditTrail: [
          {
            id: 'AUD-6',
            timestamp: '2024-11-01T08:00:00Z',
            action: 'Document Uploaded',
            performedBy: 'Finance Department',
            details: 'Updated insurance certificate for H-02'
          },
          {
            id: 'AUD-7',
            timestamp: '2024-11-01T10:00:00Z',
            action: 'Verified',
            performedBy: 'Risk Manager',
            details: 'Coverage limits verified'
          }
        ],
        signatures: [
          {
            id: 'SIG-3',
            signedBy: 'Mike Davis',
            signedAt: '2024-11-01T08:00:00Z',
            role: 'Finance Manager'
          }
        ]
      },
      {
        id: 'DOC-5504',
        type: 'soil-test-result',
        name: 'Phase II Environmental Site Assessment',
        fileName: 'soil_test_ex101.pdf',
        uploadedAt: '2025-01-10T13:00:00Z',
        uploadedBy: 'Environmental Consultant',
        permitNumber: 'LAB-2025-0089',
        issueDate: '2025-01-08',
        authority: 'EnviroLab Analytics',
        linkedSiteId: 'EX-101',
        linkedMaterialId: 'MAT-001',
        status: 'valid',
        verifiedBy: 'Geotechnical Engineer',
        verifiedAt: '2025-01-10T15:00:00Z',
        complianceNotes: 'No contaminants detected. Approved for beneficial reuse.',
        auditTrail: [
          {
            id: 'AUD-8',
            timestamp: '2025-01-10T13:00:00Z',
            action: 'Document Uploaded',
            performedBy: 'Environmental Consultant',
            details: 'Soil testing results from third-party lab'
          },
          {
            id: 'AUD-9',
            timestamp: '2025-01-10T15:00:00Z',
            action: 'Verified',
            performedBy: 'Geotechnical Engineer',
            details: 'Test results reviewed and approved'
          }
        ],
        signatures: [
          {
            id: 'SIG-4',
            signedBy: 'Dr. Emily Chen',
            signedAt: '2025-01-10T13:00:00Z',
            role: 'Environmental Consultant'
          }
        ]
      },
      {
        id: 'DOC-5505',
        type: 'transport-permit',
        name: 'Overweight Vehicle Permit',
        fileName: 'transport_permit_h01.pdf',
        uploadedAt: '2025-01-05T07:00:00Z',
        uploadedBy: 'Logistics Coordinator',
        permitNumber: 'OW-2025-NC-1122',
        issueDate: '2025-01-05',
        expirationDate: '2025-01-19',
        requiredAction: 'Renewal required for continued operations',
        authority: 'NC Department of Transportation',
        linkedHaulerId: 'H-01',
        status: 'expiring-soon',
        verifiedBy: 'Fleet Manager',
        verifiedAt: '2025-01-05T09:00:00Z',
        complianceNotes: 'Valid for routes 77 and 485. Weight limit 80,000 lbs.',
        auditTrail: [
          {
            id: 'AUD-10',
            timestamp: '2025-01-05T07:00:00Z',
            action: 'Document Uploaded',
            performedBy: 'Logistics Coordinator',
            details: 'Overweight permit for H-01 fleet'
          },
          {
            id: 'AUD-11',
            timestamp: '2025-01-05T09:00:00Z',
            action: 'Verified',
            performedBy: 'Fleet Manager',
            details: 'Route restrictions noted'
          }
        ],
        signatures: [
          {
            id: 'SIG-5',
            signedBy: 'Tom Wilson',
            signedAt: '2025-01-05T07:00:00Z',
            role: 'Logistics Coordinator'
          }
        ]
      }
    ];

    complianceStorage.setDocuments(sampleDocuments);

    // Generate alerts based on document status
    const alerts: ComplianceAlert[] = [
      {
        id: 'ALERT-001',
        type: 'expiring-soon',
        severity: 'high',
        title: 'Environmental Permit Expiring Soon',
        message: 'ENV-2025-NC-337 expires on Feb 15, 2025. Renewal required within 7 days.',
        documentId: 'DOC-5502',
        siteId: 'EX-102',
        dueDate: '2025-02-08',
        acknowledged: false,
        timestamp: '2025-01-08T15:30:00Z'
      },
      {
        id: 'ALERT-002',
        type: 'expiring-soon',
        severity: 'medium',
        title: 'Transport Permit Renewal Required',
        message: 'Overweight vehicle permit OW-2025-NC-1122 expires Jan 19, 2025.',
        documentId: 'DOC-5505',
        dueDate: '2025-01-19',
        acknowledged: false,
        timestamp: '2025-01-12T08:00:00Z'
      },
      {
        id: 'ALERT-003',
        type: 'action-required',
        severity: 'medium',
        title: 'Soil Manifest Expiring',
        message: 'Soil manifest MAN-2025-NC-5501 expires Feb 28. Plan renewal for continued operations.',
        documentId: 'DOC-5501',
        jobId: 'J-3003',
        dueDate: '2025-02-21',
        acknowledged: false,
        timestamp: '2025-01-15T12:00:00Z'
      },
      {
        id: 'ALERT-004',
        type: 'missing-document',
        severity: 'critical',
        title: 'Missing Safety Certification',
        message: 'Safety certification for hauler H-03 is missing. Required for operation.',
        jobId: 'J-3005',
        dueDate: '2025-01-20',
        acknowledged: false,
        timestamp: '2025-01-14T10:00:00Z'
      }
    ];

    complianceStorage.setAlerts(alerts);
  }
};
