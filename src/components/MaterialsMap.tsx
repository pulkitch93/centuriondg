import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Site } from '@/types/site';
import { GeotechReport } from '@/types/geotechnical';

interface MaterialsMapProps {
  sites: Site[];
  reports: GeotechReport[];
}

export default function MaterialsMap({ sites, reports }: MaterialsMapProps) {
  // Group sites by soil classification from reports
  const siteClassifications = new Map<string, string>();
  
  reports.forEach(report => {
    if (report.siteId) {
      siteClassifications.set(report.siteId, report.classification);
    }
  });

  const getClassificationColor = (classification?: string) => {
    switch (classification) {
      case 'structural-fill': return 'bg-secondary';
      case 'select-fill': return 'bg-status-approved';
      case 'general-fill': return 'bg-status-matched';
      case 'unsuitable': return 'bg-status-pending';
      case 'contaminated': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  const getClassificationLabel = (classification?: string) => {
    if (!classification) return 'No Report';
    return classification.replace('-', ' ').split(' ').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  // Calculate map bounds
  const latitudes = sites.map(s => s.coordinates.lat);
  const longitudes = sites.map(s => s.coordinates.lng);
  
  const minLat = Math.min(...latitudes) - 0.1;
  const maxLat = Math.max(...latitudes) + 0.1;
  const minLng = Math.min(...longitudes) - 0.1;
  const maxLng = Math.max(...longitudes) + 0.1;

  // Simple coordinate to pixel conversion
  const coordToPixel = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  return (
    <Card className="p-6 shadow-elevated">
      <h3 className="font-semibold text-foreground mb-4">Sites Map - Soil Classifications</h3>
      
      <div className="relative bg-muted/30 rounded-lg" style={{ paddingTop: '66.67%' }}>
        <div className="absolute inset-0">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Sites markers */}
          {sites.map(site => {
            const classification = siteClassifications.get(site.id);
            const { x, y } = coordToPixel(site.coordinates.lat, site.coordinates.lng);
            
            return (
              <div
                key={site.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`w-6 h-6 rounded-full ${getClassificationColor(classification)} flex items-center justify-center shadow-lg transition-transform group-hover:scale-125`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-card border border-border rounded-lg p-3 shadow-elevated whitespace-nowrap">
                    <p className="font-semibold text-foreground text-sm">{site.name}</p>
                    <p className="text-xs text-muted-foreground">{site.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {site.type}
                      </Badge>
                      {classification && (
                        <Badge className={`${getClassificationColor(classification)}/20 text-xs`}>
                          {getClassificationLabel(classification)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {site.volume.toLocaleString()} yd³ • {site.soilType}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-secondary" />
          <span className="text-sm text-muted-foreground">Structural Fill</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-status-approved" />
          <span className="text-sm text-muted-foreground">Select Fill</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-status-matched" />
          <span className="text-sm text-muted-foreground">General Fill</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-status-pending" />
          <span className="text-sm text-muted-foreground">Unsuitable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Contaminated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">No Report</span>
        </div>
      </div>
    </Card>
  );
}
