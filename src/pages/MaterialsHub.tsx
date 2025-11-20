import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIBadge } from '@/components/ui/ai-badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { geotechStorage } from '@/lib/geotechnicalStorage';
import { GeotechReport, SoilClassification } from '@/types/geotechnical';
import { Plus, Search, FlaskConical, FileText, Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Target, Zap } from 'lucide-react';
import ReportUpload from '@/components/ReportUpload';
import { MaterialAnalysisDialog } from '@/components/MaterialAnalysisDialog';
import { PageHeader } from '@/components/PageHeader';

export default function MaterialsHub() {
  const [reports, setReports] = useState<GeotechReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<GeotechReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const loadReports = () => {
    const allReports = geotechStorage.getReports();
    setReports(allReports);
    setFilteredReports(allReports);
  };

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    let filtered = reports;

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterClassification !== 'all') {
      filtered = filtered.filter(r => r.classification === filterClassification);
    }

    setFilteredReports(filtered);
  }, [searchQuery, filterClassification, reports]);

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

  const classificationCounts = {
    'structural-fill': reports.filter(r => r.classification === 'structural-fill').length,
    'select-fill': reports.filter(r => r.classification === 'select-fill').length,
    'general-fill': reports.filter(r => r.classification === 'general-fill').length,
    'unsuitable': reports.filter(r => r.classification === 'unsuitable').length,
    'contaminated': reports.filter(r => r.classification === 'contaminated').length,
  };

  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.suitabilityScore, 0) / reports.length)
    : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <PageHeader 
            title="Materials Intelligence Hub" 
            description="Geotechnical reports & soil classification"
            actions={
              <Button onClick={() => setShowUpload(true)} className="bg-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                Upload Report
              </Button>
            }
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 shadow-subtle border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-foreground mt-1">{reports.length}</p>
              </div>
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
          </Card>

          <Card className="p-4 shadow-subtle border-l-4 border-l-secondary">
            <div>
              <p className="text-xs text-muted-foreground">Structural Fill</p>
              <p className="text-2xl font-bold text-foreground mt-1">{classificationCounts['structural-fill']}</p>
            </div>
          </Card>

          <Card className="p-4 shadow-subtle border-l-4 border-l-status-approved">
            <div>
              <p className="text-xs text-muted-foreground">Select Fill</p>
              <p className="text-2xl font-bold text-foreground mt-1">{classificationCounts['select-fill']}</p>
            </div>
          </Card>

          <Card className="p-4 shadow-subtle border-l-4 border-l-status-matched">
            <div>
              <p className="text-xs text-muted-foreground">General Fill</p>
              <p className="text-2xl font-bold text-foreground mt-1">{classificationCounts['general-fill']}</p>
            </div>
          </Card>

          <Card className="p-4 shadow-subtle border-l-4 border-l-status-pending">
            <div>
              <p className="text-xs text-muted-foreground">Unsuitable</p>
              <p className="text-2xl font-bold text-foreground mt-1">{classificationCounts.unsuitable}</p>
            </div>
          </Card>

          <Card className="p-4 shadow-subtle border-l-4 border-l-destructive">
            <div>
              <p className="text-xs text-muted-foreground">Contaminated</p>
              <p className="text-2xl font-bold text-foreground mt-1">{classificationCounts.contaminated}</p>
            </div>
          </Card>
        </div>

        {/* AI Prescriptive Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-elevated relative overflow-hidden bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/30">
            <div className="absolute top-3 right-3">
              <AIBadge size="md" variant="pill" />
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">Optimal Sourcing Match</h3>
                <p className="text-sm text-muted-foreground">AI-recommended material pairing</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-card/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Structural Fill Match</span>
                  <Badge className="bg-secondary/20 text-secondary">94% Compatible</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  IM-203 needs 1,200 CY structural fill. EX-101 has matching soil classification with 87% compaction rate.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={() => setShowAnalysis(true)}
              >
                <Sparkles className="w-3 h-3 mr-2" />
                View Full Analysis
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-elevated relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30">
            <div className="absolute top-3 right-3">
              <AIBadge size="md" variant="pill" />
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">Quality Prediction</h3>
                <p className="text-sm text-muted-foreground">Material performance forecast</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compaction Stability</span>
                <span className="font-bold text-secondary">Excellent</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Moisture Variance Risk</span>
                <span className="font-bold text-status-approved">Low</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Long-term Suitability</span>
                <span className="font-bold text-secondary">92%</span>
              </div>
              <div className="pt-2 mt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Based on historical data from 47 similar projects
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-elevated relative overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/30">
            <div className="absolute top-3 right-3">
              <AIBadge size="md" variant="pill" />
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">Smart Recommendations</h3>
                <p className="text-sm text-muted-foreground">Automated material insights</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5" />
                <p className="text-sm text-foreground">
                  Test EX-104 for contamination before use (soil pH: 8.2)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5" />
                <p className="text-sm text-foreground">
                  Blend EX-102 + EX-105 for optimal gradation
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-status-pending mt-0.5" />
                <p className="text-sm text-foreground">
                  Schedule geotechnical review for Report GT-007
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 shadow-subtle">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterClassification} onValueChange={setFilterClassification}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="structural-fill">Structural Fill</SelectItem>
                <SelectItem value="select-fill">Select Fill</SelectItem>
                <SelectItem value="general-fill">General Fill</SelectItem>
                <SelectItem value="unsuitable">Unsuitable</SelectItem>
                <SelectItem value="contaminated">Contaminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <Card className="p-12 text-center shadow-elevated">
            <FlaskConical className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Reports Yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload geotechnical reports to get AI-powered soil classification
            </p>
            <Button onClick={() => setShowUpload(true)} className="bg-primary hover:bg-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              Upload First Report
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <Link key={report.id} to={`/materials/${report.id}`}>
                <Card className="p-6 hover:shadow-elevated transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{report.name}</h3>
                    </div>
                    {report.aiExtracted && (
                      <Badge variant="outline" className="border-accent text-accent">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getClassificationColor(report.classification)}>
                        {report.classification.replace('-', ' ')}
                      </Badge>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(report.suitabilityScore)}`}>
                          {report.suitabilityScore}
                        </p>
                        <p className="text-xs text-muted-foreground">score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t border-border">
                      {report.properties.moistureContent && (
                        <div>
                          <p className="text-muted-foreground">Moisture</p>
                          <p className="font-semibold text-foreground">{report.properties.moistureContent.toFixed(1)}%</p>
                        </div>
                      )}
                      {report.properties.compaction && (
                        <div>
                          <p className="text-muted-foreground">Compaction</p>
                          <p className="font-semibold text-foreground">{report.properties.compaction.toFixed(0)}%</p>
                        </div>
                      )}
                    </div>

                    {report.reuseRecommendations.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center gap-1 text-sm text-status-approved mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">{report.reuseRecommendations.length} Recommendations</span>
                        </div>
                      </div>
                    )}

                    {report.riskFactors.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-status-pending">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold">{report.riskFactors.length} Risk Factors</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground pt-2">
                      Uploaded {new Date(report.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <ReportUpload
        open={showUpload}
        onOpenChange={setShowUpload}
        onUploadComplete={loadReports}
      />

      <MaterialAnalysisDialog
        open={showAnalysis}
        onOpenChange={setShowAnalysis}
      />
    </div>
  );
}
