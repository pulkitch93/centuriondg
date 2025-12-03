import { Permit } from '@/types/municipality';

export interface PermitScore {
  score: number; // 0-100
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
}

// Keywords that strongly indicate earthwork
const EARTHWORK_KEYWORDS = [
  'excavation', 'grading', 'site prep', 'foundation', 'basement',
  'underground', 'parking garage', 'retaining wall', 'fill',
  'cut and fill', 'mass grading', 'clearing', 'demolition',
  'earthwork', 'dirt', 'soil', 'trenching', 'utility'
];

const PROJECT_TYPE_SCORES: Record<string, number> = {
  'Commercial': 75,
  'Mixed-Use': 70,
  'Industrial': 80,
  'Residential': 60,
  'Infrastructure': 85,
  'Retail': 55,
  'Office': 50,
  'Healthcare': 65,
  'Education': 60,
};

// Simulates AI analysis of permit data to score earthwork likelihood
export function calculateEarthworkScore(permit: Permit): PermitScore {
  const factors: string[] = [];
  let baseScore = 50;
  
  // Factor 1: Existing earthwork flag
  if (permit.estimatedEarthworkFlag === 'yes') {
    baseScore += 30;
    factors.push('Earthwork flag: Yes');
  } else if (permit.estimatedEarthworkFlag === 'no') {
    baseScore -= 30;
    factors.push('Earthwork flag: No');
  }
  
  // Factor 2: Project type analysis
  const typeScore = PROJECT_TYPE_SCORES[permit.projectType] || 50;
  const typeAdjustment = (typeScore - 50) * 0.3;
  baseScore += typeAdjustment;
  if (typeAdjustment > 5) {
    factors.push(`High earthwork project type: ${permit.projectType}`);
  } else if (typeAdjustment < -5) {
    factors.push(`Lower earthwork project type: ${permit.projectType}`);
  }
  
  // Factor 3: Description keyword analysis
  const descLower = (permit.description + ' ' + permit.projectName).toLowerCase();
  const matchedKeywords = EARTHWORK_KEYWORDS.filter(kw => descLower.includes(kw));
  
  if (matchedKeywords.length > 0) {
    baseScore += Math.min(matchedKeywords.length * 8, 25);
    factors.push(`Keywords detected: ${matchedKeywords.slice(0, 3).join(', ')}`);
  }
  
  // Factor 4: Project scale indicators
  if (descLower.includes('phase') || descLower.includes('multi')) {
    baseScore += 10;
    factors.push('Multi-phase project indicator');
  }
  
  if (descLower.includes('new construction') || descLower.includes('ground-up')) {
    baseScore += 15;
    factors.push('New construction project');
  }
  
  // Clamp score to 0-100
  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore)));
  
  // Determine confidence based on data quality
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (permit.estimatedEarthworkFlag !== 'unknown' && factors.length >= 3) {
    confidence = 'high';
  } else if (factors.length <= 1) {
    confidence = 'low';
  }
  
  return {
    score: finalScore,
    confidence,
    factors
  };
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-status-approved';
  if (score >= 50) return 'text-status-matched';
  if (score >= 25) return 'text-status-pending';
  return 'text-muted-foreground';
}

export function getScoreBgColor(score: number): string {
  if (score >= 75) return 'bg-status-approved/20';
  if (score >= 50) return 'bg-status-matched/20';
  if (score >= 25) return 'bg-status-pending/20';
  return 'bg-muted';
}
