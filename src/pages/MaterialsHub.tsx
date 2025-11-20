import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { geotechStorage } from '@/lib/geotechnicalStorage';
import { GeotechReport, SoilClassification } from '@/types/geotechnical';
import { ArrowLeft, Plus, Search, FlaskConical, FileText, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import ReportUpload from '@/components/ReportUpload';

export default function MaterialsHub() {
  const [reports, setReports] = useState<GeotechReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<GeotechReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Materials Intelligence Hub</h1>
                <p className="text-sm text-muted-foreground">Geotechnical reports & soil classification</p>
              </div>
            </div>
            <Button onClick={() => setShowUpload(true)} className="bg-primary hover:bg-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              Upload Report
            </Button>
          </div>
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
    </div>
  );
}
