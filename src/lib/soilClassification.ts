import { SoilClassification, SoilProperties, GeotechReport } from '@/types/geotechnical';

// Calculate suitability score based on soil properties
export function calculateSuitabilityScore(properties: SoilProperties): number {
  let score = 100;
  
  // Moisture content impact
  if (properties.moistureContent) {
    if (properties.moistureContent > 20) score -= 20;
    else if (properties.moistureContent > 15) score -= 10;
    else if (properties.moistureContent > 10) score -= 5;
  }
  
  // Compaction impact
  if (properties.compaction) {
    if (properties.compaction < 85) score -= 30;
    else if (properties.compaction < 90) score -= 15;
    else if (properties.compaction < 95) score -= 5;
  }
  
  // Contaminants impact
  if (properties.contaminants && properties.contaminants.length > 0) {
    score -= properties.contaminants.length * 25;
  }
  
  // Organic content impact
  if (properties.organicContent) {
    if (properties.organicContent > 10) score -= 20;
    else if (properties.organicContent > 5) score -= 10;
  }
  
  // pH impact
  if (properties.pH) {
    if (properties.pH < 5.5 || properties.pH > 8.5) score -= 15;
    else if (properties.pH < 6.0 || properties.pH > 8.0) score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Classify soil based on properties
export function classifySoil(properties: SoilProperties, score: number): SoilClassification {
  // Contaminated takes precedence
  if (properties.contaminants && properties.contaminants.length > 0) {
    return 'contaminated';
  }
  
  // High organic content or poor properties
  if (score < 40 || (properties.organicContent && properties.organicContent > 10)) {
    return 'unsuitable';
  }
  
  // Excellent properties for structural use
  if (score >= 85 && properties.compaction && properties.compaction >= 95) {
    return 'structural-fill';
  }
  
  // Good properties
  if (score >= 70) {
    return 'select-fill';
  }
  
  // Moderate properties
  return 'general-fill';
}

// Generate AI recommendations based on classification and properties
export function generateRecommendations(
  classification: SoilClassification,
  properties: SoilProperties,
  score: number
): {
  reuseRecommendations: string[];
  riskFactors: string[];
  treatmentOptions: string[];
} {
  const recommendations: string[] = [];
  const risks: string[] = [];
  const treatments: string[] = [];
  
  switch (classification) {
    case 'structural-fill':
      recommendations.push('Excellent for foundation support and load-bearing applications');
      recommendations.push('Suitable for highway embankments and retaining wall backfill');
      recommendations.push('Can be used for critical infrastructure projects');
      if (properties.compaction && properties.compaction >= 98) {
        recommendations.push('Meets DOT specifications for structural applications');
      }
      break;
      
    case 'select-fill':
      recommendations.push('Suitable for general backfill and grading projects');
      recommendations.push('Good for utility trench backfill');
      recommendations.push('Can be used for landscape grading and site preparation');
      if (properties.moistureContent && properties.moistureContent < 12) {
        recommendations.push('Low moisture content ideal for immediate placement');
      }
      break;
      
    case 'general-fill':
      recommendations.push('Acceptable for non-structural fills and mass grading');
      recommendations.push('Suitable for general landscaping applications');
      recommendations.push('May require moisture conditioning before placement');
      break;
      
    case 'unsuitable':
      recommendations.push('Not recommended for structural applications without treatment');
      recommendations.push('May be suitable for landscaping after amendment');
      risks.push('High organic content may cause settlement issues');
      treatments.push('Consider soil stabilization with lime or cement');
      treatments.push('Possible use after drying and recompaction');
      break;
      
    case 'contaminated':
      recommendations.push('Requires environmental remediation before reuse');
      recommendations.push('Contact environmental specialist for disposal options');
      risks.push('Contains hazardous materials - handle with care');
      risks.push('May require special handling and disposal permits');
      treatments.push('Professional remediation required');
      treatments.push('Consider soil washing or thermal treatment');
      break;
  }
  
  // Additional risk factors based on properties
  if (properties.moistureContent && properties.moistureContent > 15) {
    risks.push('High moisture content may require drying time');
    treatments.push('Allow material to dry or use moisture conditioning');
  }
  
  if (properties.compaction && properties.compaction < 90) {
    risks.push('Low compaction - may not meet project specifications');
    treatments.push('Recompaction required with proper moisture control');
  }
  
  if (properties.organicContent && properties.organicContent > 3) {
    risks.push('Organic content may decompose and cause settlement');
    treatments.push('Remove organic material or stabilize with additives');
  }
  
  if (properties.pH && (properties.pH < 6.0 || properties.pH > 8.0)) {
    risks.push('pH levels outside optimal range for construction');
    treatments.push('Consider pH adjustment with lime or sulfur');
  }
  
  return {
    reuseRecommendations: recommendations,
    riskFactors: risks,
    treatmentOptions: treatments,
  };
}

// Simulate AI extraction from file content (in production, this would use actual OCR/AI)
export function extractSoilDataFromText(text: string): Partial<SoilProperties> {
  const properties: Partial<SoilProperties> = {};
  
  // Simple pattern matching for demo purposes
  // In production, this would use proper NLP/ML models
  
  const moistureMatch = text.match(/moisture[:\s]+(\d+\.?\d*)%?/i);
  if (moistureMatch) properties.moistureContent = parseFloat(moistureMatch[1]);
  
  const compactionMatch = text.match(/compaction[:\s]+(\d+\.?\d*)%?/i);
  if (compactionMatch) properties.compaction = parseFloat(compactionMatch[1]);
  
  const densityMatch = text.match(/density[:\s]+(\d+\.?\d*)\s*(lb|pcf)/i);
  if (densityMatch) properties.density = parseFloat(densityMatch[1]);
  
  const phMatch = text.match(/ph[:\s]+(\d+\.?\d*)/i);
  if (phMatch) properties.pH = parseFloat(phMatch[1]);
  
  // Check for contaminants
  const contaminants: string[] = [];
  if (/lead/i.test(text)) contaminants.push('Lead');
  if (/arsenic/i.test(text)) contaminants.push('Arsenic');
  if (/petroleum/i.test(text)) contaminants.push('Petroleum');
  if (/asbestos/i.test(text)) contaminants.push('Asbestos');
  if (contaminants.length > 0) properties.contaminants = contaminants;
  
  return properties;
}

// Compare multiple reports and find similarities
export function compareReports(reports: GeotechReport[]): {
  commonProperties: string[];
  differences: string[];
  averageScore: number;
} {
  if (reports.length < 2) {
    return { commonProperties: [], differences: [], averageScore: 0 };
  }
  
  const common: string[] = [];
  const differences: string[] = [];
  
  // Check classification similarity
  const classifications = reports.map(r => r.classification);
  const uniqueClassifications = [...new Set(classifications)];
  
  if (uniqueClassifications.length === 1) {
    common.push(`All samples classified as ${uniqueClassifications[0]}`);
  } else {
    differences.push(`Mixed classifications: ${uniqueClassifications.join(', ')}`);
  }
  
  // Check moisture content
  const moistures = reports
    .map(r => r.properties.moistureContent)
    .filter((m): m is number => m !== undefined);
  
  if (moistures.length > 0) {
    const avgMoisture = moistures.reduce((a, b) => a + b, 0) / moistures.length;
    const variance = moistures.reduce((sum, m) => sum + Math.pow(m - avgMoisture, 2), 0) / moistures.length;
    
    if (variance < 2) {
      common.push(`Consistent moisture content (~${avgMoisture.toFixed(1)}%)`);
    } else {
      differences.push(`Variable moisture content (${Math.min(...moistures).toFixed(1)}% - ${Math.max(...moistures).toFixed(1)}%)`);
    }
  }
  
  // Average suitability score
  const averageScore = reports.reduce((sum, r) => sum + r.suitabilityScore, 0) / reports.length;
  
  return {
    commonProperties: common,
    differences: differences,
    averageScore: Math.round(averageScore),
  };
}
