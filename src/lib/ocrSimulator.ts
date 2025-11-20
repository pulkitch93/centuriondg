// Simulated OCR extraction using pattern matching
// In production, this would use a real OCR service like Tesseract.js or cloud OCR APIs

export interface OCRResult {
  permitNumber?: string;
  issueDate?: string;
  expirationDate?: string;
  requiredAction?: string;
  authority?: string;
  confidence: number;
}

export const simulateOCR = (fileName: string, documentType: string): OCRResult => {
  // Simulate OCR extraction based on document type
  const baseDate = new Date();
  
  const patterns: Record<string, OCRResult> = {
    'soil-manifest': {
      permitNumber: `MAN-${baseDate.getFullYear()}-NC-${Math.floor(Math.random() * 9000) + 1000}`,
      issueDate: new Date(baseDate.setDate(baseDate.getDate() - 5)).toISOString().split('T')[0],
      expirationDate: new Date(baseDate.setMonth(baseDate.getMonth() + 1)).toISOString().split('T')[0],
      authority: 'NC Department of Environmental Quality',
      confidence: 0.95
    },
    'environmental-permit': {
      permitNumber: `ENV-${baseDate.getFullYear()}-NC-${Math.floor(Math.random() * 900) + 100}`,
      issueDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(baseDate.setMonth(baseDate.getMonth() + 6)).toISOString().split('T')[0],
      requiredAction: 'Renewal required 30 days before expiration',
      authority: 'Charlotte-Mecklenburg Environmental Services',
      confidence: 0.92
    },
    'hauler-insurance': {
      permitNumber: `INS-H${Math.floor(Math.random() * 90) + 10}-${baseDate.getFullYear()}`,
      issueDate: new Date(baseDate.setMonth(baseDate.getMonth() - 2)).toISOString().split('T')[0],
      expirationDate: new Date(baseDate.setMonth(baseDate.getMonth() + 10)).toISOString().split('T')[0],
      authority: 'Commercial Insurance Provider',
      confidence: 0.88
    },
    'soil-test-result': {
      permitNumber: `LAB-${baseDate.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      issueDate: new Date(baseDate.setDate(baseDate.getDate() - 3)).toISOString().split('T')[0],
      authority: 'EnviroLab Analytics',
      confidence: 0.94
    },
    'transport-permit': {
      permitNumber: `OW-${baseDate.getFullYear()}-NC-${Math.floor(Math.random() * 9000) + 1000}`,
      issueDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(baseDate.setDate(baseDate.getDate() + 14)).toISOString().split('T')[0],
      requiredAction: 'Valid for specified routes only',
      authority: 'NC Department of Transportation',
      confidence: 0.91
    },
    'safety-certification': {
      permitNumber: `SAFE-${baseDate.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      issueDate: new Date(baseDate.setMonth(baseDate.getMonth() - 1)).toISOString().split('T')[0],
      expirationDate: new Date(baseDate.setFullYear(baseDate.getFullYear() + 1)).toISOString().split('T')[0],
      authority: 'OSHA Safety Division',
      confidence: 0.93
    }
  };

  return patterns[documentType] || {
    permitNumber: `DOC-${baseDate.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    issueDate: new Date().toISOString().split('T')[0],
    authority: 'Unknown Authority',
    confidence: 0.75
  };
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  // In production, this would use actual OCR
  // For demo, return simulated extracted text
  return `
    DOCUMENT EXTRACT
    ================
    
    Permit Number: ${Math.random().toString(36).substring(2, 15).toUpperCase()}
    Issue Date: ${new Date().toISOString().split('T')[0]}
    Expiration Date: ${new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    
    Authority: Regulatory Authority
    
    Required Actions:
    - Maintain compliance with all regulations
    - Submit renewal 30 days prior to expiration
    - Report any changes in operations
    
    This is a simulated OCR extraction for demonstration purposes.
  `;
};
