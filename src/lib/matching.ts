import { Site, Match, SiteType } from '@/types/site';

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate match score (0-100)
function calculateMatchScore(exportSite: Site, importSite: Site, distance: number): number {
  let score = 100;
  
  // Distance penalty (closer is better)
  if (distance > 50) score -= 30;
  else if (distance > 25) score -= 15;
  else if (distance > 10) score -= 5;
  
  // Soil type compatibility
  if (exportSite.soilType !== importSite.soilType) score -= 20;
  
  // Volume compatibility
  const volumeRatio = Math.min(exportSite.volume, importSite.volume) / Math.max(exportSite.volume, importSite.volume);
  score -= (1 - volumeRatio) * 15;
  
  // Contamination penalty
  if (exportSite.contaminated) score -= 25;
  
  // Schedule overlap
  const exportStart = new Date(exportSite.scheduleStart);
  const exportEnd = new Date(exportSite.scheduleEnd);
  const importStart = new Date(importSite.scheduleStart);
  const importEnd = new Date(importSite.scheduleEnd);
  
  const hasOverlap = exportStart <= importEnd && importStart <= exportEnd;
  if (!hasOverlap) score -= 30;
  
  return Math.max(0, Math.min(100, score));
}

// Generate match reasons
function getMatchReasons(exportSite: Site, importSite: Site, distance: number, score: number): string[] {
  const reasons: string[] = [];
  
  if (distance < 10) reasons.push('Excellent proximity - minimal haul distance');
  else if (distance < 25) reasons.push('Good proximity for cost efficiency');
  
  if (exportSite.soilType === importSite.soilType) {
    reasons.push(`Perfect soil type match: ${exportSite.soilType}`);
  }
  
  const volumeRatio = Math.min(exportSite.volume, importSite.volume) / Math.max(exportSite.volume, importSite.volume);
  if (volumeRatio > 0.8) {
    reasons.push('Volume requirements align well');
  }
  
  if (!exportSite.contaminated) {
    reasons.push('Clean fill - no contamination concerns');
  }
  
  if (score > 80) reasons.push('High overall compatibility score');
  
  return reasons;
}

export function generateMatches(sites: Site[]): Match[] {
  const exportSites = sites.filter(s => s.type === 'export' && s.status === 'pending');
  const importSites = sites.filter(s => s.type === 'import' && s.status === 'pending');
  
  const matches: Match[] = [];
  
  exportSites.forEach(exportSite => {
    importSites.forEach(importSite => {
      const distance = calculateDistance(
        exportSite.coordinates.lat,
        exportSite.coordinates.lng,
        importSite.coordinates.lat,
        importSite.coordinates.lng
      );
      
      const score = calculateMatchScore(exportSite, importSite, distance);
      
      // Only create matches with score > 40
      if (score > 40) {
        const costSavings = Math.round(distance * 8 * Math.min(exportSite.volume, importSite.volume));
        const carbonReduction = Math.round(distance * 0.4 * Math.min(exportSite.volume, importSite.volume));
        const reasons = getMatchReasons(exportSite, importSite, distance, score);
        
        matches.push({
          id: `match-${exportSite.id}-${importSite.id}`,
          exportSiteId: exportSite.id,
          importSiteId: importSite.id,
          score: Math.round(score),
          distance: Math.round(distance * 10) / 10,
          costSavings,
          carbonReduction,
          reasons,
          status: 'suggested',
          createdAt: new Date().toISOString(),
        });
      }
    });
  });
  
  return matches.sort((a, b) => b.score - a.score);
}
