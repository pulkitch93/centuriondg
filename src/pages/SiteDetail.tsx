import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { Site, Match } from '@/types/site';
import { GeotechReport } from '@/types/geotechnical';
import { geotechStorage } from '@/lib/geotechnicalStorage';
import { PageHeader } from '@/components/PageHeader';
import { 
  MapPin, 
  Calendar, 
  Package, 
  ArrowLeft, 
  Building, 
  AlertTriangle,
  FileText,
  Truck
} from 'lucide-react';

export default function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [report, setReport] = useState<GeotechReport | null>(null);
  const [relatedMatches, setRelatedMatches] = useState<Match[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    const allSites = storage.getSites();
    const allMatches = storage.getMatches();
    const allReports = geotechStorage.getReports();
    
    setSites(allSites);
    
    const foundSite = allSites.find(s => s.id === id);
    if (foundSite) {
      setSite(foundSite);
      
      // Find geotechnical report for this site
      const siteReport = allReports.find(r => r.siteId === id);
      if (siteReport) {
        setReport(siteReport);
      }
      
      // Find related matches
      const matches = allMatches.filter(
        m => m.exportSiteId === id || m.importSiteId === id
      );
      setRelatedMatches(matches);
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-status-pending/20 text-status-pending border-status-pending/30';
      case 'matched': return 'bg-status-matched/20 text-status-matched border-status-matched/30';
      case 'approved': return 'bg-status-approved/20 text-status-approved border-status-approved/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!site) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Site not found</p>
          <Button onClick={() => navigate('/sites')}>Back to Job Board</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <PageHeader 
            title={site.name}
            description={`${site.type === 'export' ? 'Export' : 'Import'} Site Details`}
            actions={
              <Button variant="outline" onClick={() => navigate('/sites')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Job Board
              </Button>
            }
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={site.type === 'export' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}>
                    {site.type === 'export' ? 'Export Site' : 'Import Site'}
                  </Badge>
                  <Badge className={getStatusColor(site.status)}>{site.status}</Badge>
                </div>
              </div>
              {site.contaminated && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Contaminated
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{site.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Volume & Material</p>
                    <p className="font-medium text-foreground">{site.volume.toLocaleString()} yd³</p>
                    <p className="text-sm text-muted-foreground">{site.soilType}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Project Owner</p>
                    <p className="font-medium text-foreground">{site.projectOwner}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium text-foreground">
                      {new Date(site.scheduleStart).toLocaleDateString()} - {new Date(site.scheduleEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {site.coordinates && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Coordinates</p>
                      <p className="font-medium text-foreground">
                        {site.coordinates.lat.toFixed(4)}, {site.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Geotechnical Report */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Geotechnical Report
            </h3>
            {report ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Classification</p>
                  <Badge variant="outline" className="mt-1">
                    {report.classification.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suitability Score</p>
                  <p className="text-2xl font-bold text-accent">{report.suitabilityScore}/100</p>
                </div>
                {report.properties.moistureContent && (
                  <div>
                    <p className="text-sm text-muted-foreground">Moisture Content</p>
                    <p className="font-medium text-foreground">{report.properties.moistureContent}%</p>
                  </div>
                )}
                {report.properties.compaction && (
                  <div>
                    <p className="text-sm text-muted-foreground">Compaction</p>
                    <p className="font-medium text-foreground">{report.properties.compaction}%</p>
                  </div>
                )}
                <Link to={`/materials/${report.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Full Report
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No geotechnical report available for this site.</p>
            )}
          </Card>
        </div>

        {/* Related Matches */}
        {relatedMatches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent" />
              Related Matches ({relatedMatches.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedMatches.map(match => {
                const exportSite = sites.find(s => s.id === match.exportSiteId);
                const importSite = sites.find(s => s.id === match.importSiteId);
                const otherSite = site.type === 'export' ? importSite : exportSite;
                
                return (
                  <Card key={match.id} className="p-4 hover:shadow-elevated transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-accent/20 text-accent">Score: {match.score}%</Badge>
                      <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {site.type === 'export' ? 'Matched Import Site' : 'Matched Export Site'}
                      </p>
                      <p className="font-semibold text-foreground">{otherSite?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{otherSite?.location}</p>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-muted-foreground">{match.distance} mi</span>
                      <span className="text-secondary font-medium">${match.costSavings.toLocaleString()} savings</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
