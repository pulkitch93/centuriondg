import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { geotechStorage } from '@/lib/geotechnicalStorage';
import { compareReports } from '@/lib/soilClassification';
import { GeotechReport, SoilClassification } from '@/types/geotechnical';
import { storage } from '@/lib/storage';
import { Site } from '@/types/site';
import { 
  ArrowLeft, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench,
  MapPin,
  Droplets,
  Mountain,
  Scale,
  TestTube
} from 'lucide-react';

export default function MaterialProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<GeotechReport | null>(null);
  const [similarReports, setSimilarReports] = useState<GeotechReport[]>([]);
  const [compatibleSites, setCompatibleSites] = useState<Site[]>([]);

  useEffect(() => {
    const allReports = geotechStorage.getReports();
    const foundReport = allReports.find(r => r.id === id);
    
    if (foundReport) {
      setReport(foundReport);
      
      // Find similar reports
      const similar = allReports
        .filter(r => r.id !== id && r.classification === foundReport.classification)
        .slice(0, 3);
      setSimilarReports(similar);

      // Find compatible sites
      if (foundReport.siteId) {
        const sites = storage.getSites();
        const compatible = sites.filter(s => s.soilType.toLowerCase().includes(foundReport.classification.split('-')[0]));
        setCompatibleSites(compatible);
      }
    }
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Report not found</p>
          <Link to="/materials" className="mt-4 inline-block">
            <Button variant="outline">Back to Materials Hub</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getClassificationColor = (classification: SoilClassification) => {
    switch (classification) {
      case 'structural-fill': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'select-fill': return 'bg-status-approved/20 text-status-approved border-status-approved/30';
      case 'general-fill': return 'bg-status-matched/20 text-status-matched border-status-matched/30';
      case 'unsuitable': return 'bg-status-pending/20 text-status-pending border-status-pending/30';
      case 'contaminated': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-secondary';
    if (score >= 70) return 'text-status-approved';
    if (score >= 50) return 'text-status-matched';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/materials">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Materials Hub
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{report.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Uploaded {new Date(report.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/sites')}>
                View Compatible Sites
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 shadow-elevated lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-2">
                <Badge className={getClassificationColor(report.classification)}>
                  {report.classification.replace('-', ' ').toUpperCase()}
                </Badge>
                {report.aiExtracted && (
                  <Badge variant="outline" className="border-accent text-accent ml-2">
                    AI Extracted
                  </Badge>
                )}
                <h2 className="text-xl font-semibold text-foreground mt-2">Classification & Suitability</h2>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(report.suitabilityScore)}`}>
                  {report.suitabilityScore}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Suitability Score</p>
                <Progress value={report.suitabilityScore} className="w-32 mt-2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {report.properties.moistureContent !== undefined && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Droplets className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Moisture Content</p>
                    <p className="text-lg font-bold text-foreground">{report.properties.moistureContent.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {report.properties.compaction !== undefined && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Mountain className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Compaction</p>
                    <p className="text-lg font-bold text-foreground">{report.properties.compaction.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {report.properties.density !== undefined && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Scale className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Density</p>
                    <p className="text-lg font-bold text-foreground">{report.properties.density.toFixed(1)} lb/ft³</p>
                  </div>
                </div>
              )}

              {report.properties.pH !== undefined && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <TestTube className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">pH Level</p>
                    <p className="text-lg font-bold text-foreground">{report.properties.pH.toFixed(1)}</p>
                  </div>
                </div>
              )}

              {report.properties.organicContent !== undefined && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <FlaskConical className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Organic Content</p>
                    <p className="text-lg font-bold text-foreground">{report.properties.organicContent.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>

            {report.properties.contaminants && report.properties.contaminants.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                <p className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Contaminants Detected
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.properties.contaminants.map((contaminant, idx) => (
                    <Badge key={idx} variant="destructive">{contaminant}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-elevated">
            <h3 className="font-semibold text-foreground mb-4">Grain Size Distribution</h3>
            {report.properties.grainSize ? (
              <div className="space-y-3">
                {report.properties.grainSize.gravel !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Gravel</span>
                      <span className="font-semibold text-foreground">{report.properties.grainSize.gravel}%</span>
                    </div>
                    <Progress value={report.properties.grainSize.gravel} />
                  </div>
                )}
                {report.properties.grainSize.sand !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Sand</span>
                      <span className="font-semibold text-foreground">{report.properties.grainSize.sand}%</span>
                    </div>
                    <Progress value={report.properties.grainSize.sand} />
                  </div>
                )}
                {report.properties.grainSize.silt !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Silt</span>
                      <span className="font-semibold text-foreground">{report.properties.grainSize.silt}%</span>
                    </div>
                    <Progress value={report.properties.grainSize.silt} />
                  </div>
                )}
                {report.properties.grainSize.clay !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Clay</span>
                      <span className="font-semibold text-foreground">{report.properties.grainSize.clay}%</span>
                    </div>
                    <Progress value={report.properties.grainSize.clay} />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No grain size data available</p>
            )}
          </Card>
        </div>

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="similar">Similar Samples</TabsTrigger>
            <TabsTrigger value="sites">Compatible Sites</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 shadow-elevated border-l-4 border-l-status-approved">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-status-approved" />
                  Reuse Recommendations
                </h3>
                <ul className="space-y-2">
                  {report.reuseRecommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 shadow-elevated border-l-4 border-l-status-pending">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-status-pending" />
                  Risk Factors
                </h3>
                <ul className="space-y-2">
                  {report.riskFactors.length > 0 ? (
                    report.riskFactors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-status-pending mt-0.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">No significant risks identified</li>
                  )}
                </ul>
              </Card>

              <Card className="p-6 shadow-elevated border-l-4 border-l-accent">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-accent" />
                  Treatment Options
                </h3>
                <ul className="space-y-2">
                  {report.treatmentOptions.length > 0 ? (
                    report.treatmentOptions.map((treatment, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Wrench className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>{treatment}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">No treatment required</li>
                  )}
                </ul>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="similar">
            {similarReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarReports.map(similar => (
                  <Link key={similar.id} to={`/materials/${similar.id}`}>
                    <Card className="p-6 hover:shadow-elevated transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={getClassificationColor(similar.classification)}>
                          {similar.classification.replace('-', ' ')}
                        </Badge>
                        <p className={`text-2xl font-bold ${getScoreColor(similar.suitabilityScore)}`}>
                          {similar.suitabilityScore}
                        </p>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{similar.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {similar.properties.moistureContent && (
                          <p>Moisture: {similar.properties.moistureContent.toFixed(1)}%</p>
                        )}
                        {similar.properties.compaction && (
                          <p>Compaction: {similar.properties.compaction.toFixed(0)}%</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No similar samples found</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sites">
            {compatibleSites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compatibleSites.map(site => (
                  <Link key={site.id} to={`/sites/${site.id}`}>
                    <Card className="p-6 hover:shadow-elevated transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{site.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{site.location}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Soil Type</p>
                          <p className="font-semibold text-foreground capitalize">{site.soilType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volume</p>
                          <p className="font-semibold text-foreground">{site.volume} yd³</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No compatible sites found</p>
                <Link to="/sites" className="mt-4 inline-block">
                  <Button variant="outline">Browse All Sites</Button>
                </Link>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
