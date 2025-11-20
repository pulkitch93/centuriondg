import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { generateMatches } from '@/lib/matching';
import { Site, Match } from '@/types/site';
import { GeotechReport } from '@/types/geotechnical';
import { geotechStorage } from '@/lib/geotechnicalStorage';
import { Plus, Sparkles, MapPin, Calendar, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaterialsMap from '@/components/MaterialsMap';
import { PageHeader } from '@/components/PageHeader';

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [reports, setReports] = useState<GeotechReport[]>([]);

  useEffect(() => {
    setSites(storage.getSites());
    setMatches(storage.getMatches());
    setReports(geotechStorage.getReports());
  }, []);

  const runAIMatching = () => {
    const newMatches = generateMatches(sites);
    storage.setMatches(newMatches);
    setMatches(newMatches);
  };

  const exportSites = sites.filter(s => s.type === 'export');
  const importSites = sites.filter(s => s.type === 'import');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-status-pending/20 text-status-pending border-status-pending/30';
      case 'matched': return 'bg-status-matched/20 text-status-matched border-status-matched/30';
      case 'approved': return 'bg-status-approved/20 text-status-approved border-status-approved/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const SiteCard = ({ site }: { site: Site }) => {
    // Find geotechnical report for this site
    const siteReport = reports.find(r => r.siteId === site.id);
    
    return (
      <Card className="p-6 hover:shadow-elevated transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{site.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {site.location}
            </p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(site.status)}>{site.status}</Badge>
            {siteReport && (
              <div className="mt-2">
                <Link to={`/materials/${siteReport.id}`}>
                  <Badge variant="outline" className="border-accent text-accent cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    Geo Report
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{site.volume.toLocaleString()} yd³ • {site.soilType}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(site.scheduleStart).toLocaleDateString()} - {new Date(site.scheduleEnd).toLocaleDateString()}</span>
          </div>
          <div className="text-muted-foreground">
            Owner: {site.projectOwner}
          </div>
          {site.contaminated && (
            <Badge variant="destructive" className="mt-2">Contaminated</Badge>
          )}
          {siteReport && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Soil Classification:</p>
              <Badge className="mt-1" variant="outline">
                {siteReport.classification.replace('-', ' ')} • Score: {siteReport.suitabilityScore}
              </Badge>
            </div>
          )}
        </div>

        <Link to={`/sites/${site.id}`} className="mt-4 block">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <PageHeader 
            title="Job Board" 
            description="Manage export & import sites"
            actions={
              <>
                <Button onClick={runAIMatching} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run AI Matching
                </Button>
                <Link to="/sites/new">
                  <Button className="bg-primary hover:bg-primary-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    New Site
                  </Button>
                </Link>
              </>
            }
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Sites ({sites.length})</TabsTrigger>
            <TabsTrigger value="export">Export ({exportSites.length})</TabsTrigger>
            <TabsTrigger value="import">Import ({importSites.length})</TabsTrigger>
            <TabsTrigger value="matches">AI Matches ({matches.length})</TabsTrigger>
            <TabsTrigger value="map">Materials Map</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.length === 0 ? (
                <Card className="col-span-full p-12 text-center">
                  <p className="text-muted-foreground mb-4">No sites yet. Create your first site to get started.</p>
                  <Link to="/sites/new">
                    <Button>Create Site</Button>
                  </Link>
                </Card>
              ) : (
                sites.map(site => <SiteCard key={site.id} site={site} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exportSites.map(site => <SiteCard key={site.id} site={site} />)}
            </div>
          </TabsContent>

          <TabsContent value="import">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {importSites.map(site => <SiteCard key={site.id} site={site} />)}
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <div className="grid grid-cols-1 gap-4">
              {matches.length === 0 ? (
                <Card className="p-12 text-center">
                  <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No matches yet. Click "Run AI Matching" to generate matches.</p>
                </Card>
              ) : (
                matches.map(match => {
                  const exportSite = sites.find(s => s.id === match.exportSiteId);
                  const importSite = sites.find(s => s.id === match.importSiteId);
                  if (!exportSite || !importSite) return null;

                  return (
                    <Link key={match.id} to={`/matches/${match.id}`}>
                      <Card className="p-6 hover:shadow-elevated transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-accent/20 text-accent">Score: {match.score}%</Badge>
                              <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Export</p>
                                <p className="font-semibold text-foreground">{exportSite.name}</p>
                                <p className="text-sm text-muted-foreground">{exportSite.location}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Import</p>
                                <p className="font-semibold text-foreground">{importSite.name}</p>
                                <p className="text-sm text-muted-foreground">{importSite.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{match.distance}</span> miles
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-semibold text-secondary">${match.costSavings.toLocaleString()}</span> savings
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{match.carbonReduction}</span> kg CO₂ reduced
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <MaterialsMap sites={sites} reports={reports} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
