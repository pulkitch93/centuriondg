import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { Site, Match } from '@/types/site';
import { PageHeader } from '@/components/PageHeader';
import { 
  MapPin, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  DollarSign,
  Leaf,
  Ruler
} from 'lucide-react';

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [exportSite, setExportSite] = useState<Site | null>(null);
  const [importSite, setImportSite] = useState<Site | null>(null);

  useEffect(() => {
    const allSites = storage.getSites();
    const allMatches = storage.getMatches();
    
    const foundMatch = allMatches.find(m => m.id === id);
    if (foundMatch) {
      setMatch(foundMatch);
      setExportSite(allSites.find(s => s.id === foundMatch.exportSiteId) || null);
      setImportSite(allSites.find(s => s.id === foundMatch.importSiteId) || null);
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

  const handleApprove = () => {
    if (!match) return;
    
    const allMatches = storage.getMatches();
    const updatedMatches = allMatches.map(m => 
      m.id === match.id ? { ...m, status: 'approved' as const } : m
    );
    storage.setMatches(updatedMatches);
    setMatch({ ...match, status: 'approved' });
  };

  if (!match || !exportSite || !importSite) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Match not found</p>
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
            title="Match Details"
            description="AI-generated site match analysis"
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
        {/* Match Score Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Match Score</p>
                <p className="text-4xl font-bold text-accent">{match.score}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
              {match.status !== 'approved' && (
                <Button onClick={handleApprove} className="bg-status-approved hover:bg-status-approved/90">
                  Approve Match
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Sites Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary">Export Site</Badge>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{exportSite.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{exportSite.location}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Volume: </span>
                <span className="font-medium text-foreground">{exportSite.volume.toLocaleString()} yd³</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Material: </span>
                <span className="font-medium text-foreground">{exportSite.soilType}</span>
              </div>
            </div>
            <Link to={`/sites/${exportSite.id}`}>
              <Button variant="outline" className="w-full mt-4">View Site Details</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-secondary/20 text-secondary">Import Site</Badge>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{importSite.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{importSite.location}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Volume: </span>
                <span className="font-medium text-foreground">{importSite.volume.toLocaleString()} yd³</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Material: </span>
                <span className="font-medium text-foreground">{importSite.soilType}</span>
              </div>
            </div>
            <Link to={`/sites/${importSite.id}`}>
              <Button variant="outline" className="w-full mt-4">View Site Details</Button>
            </Link>
          </Card>
        </div>

        {/* Match Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <Ruler className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Distance</p>
            <p className="text-2xl font-bold text-foreground">{match.distance} miles</p>
          </Card>
          
          <Card className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cost Savings</p>
            <p className="text-2xl font-bold text-secondary">${match.costSavings.toLocaleString()}</p>
          </Card>
          
          <Card className="p-6 text-center">
            <Leaf className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">CO₂ Reduction</p>
            <p className="text-2xl font-bold text-emerald-500">{match.carbonReduction} kg</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
