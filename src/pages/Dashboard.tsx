import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Site, Match } from '@/types/site';
import { MapPin, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    setSites(storage.getSites());
    setMatches(storage.getMatches());
  }, []);

  const exportSites = sites.filter(s => s.type === 'export');
  const importSites = sites.filter(s => s.type === 'import');
  const suggestedMatches = matches.filter(m => m.status === 'suggested');
  const approvedMatches = matches.filter(m => m.status === 'approved');

  const totalVolume = sites.reduce((sum, site) => sum + site.volume, 0);
  const totalSavings = approvedMatches.reduce((sum, match) => sum + match.costSavings, 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Centurion DG Platform</h1>
              <p className="text-sm text-muted-foreground">Intelligent Earthwork Logistics</p>
            </div>
            <Link to="/sites">
              <Button className="bg-primary hover:bg-primary-dark">
                View Job Board
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-subtle border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Export Sites</p>
                <p className="text-3xl font-bold text-foreground mt-1">{exportSites.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Import Sites</p>
                <p className="text-3xl font-bold text-foreground mt-1">{importSites.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Matches</p>
                <p className="text-3xl font-bold text-foreground mt-1">{suggestedMatches.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-status-approved">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-foreground mt-1">{approvedMatches.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-status-approved/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-status-approved" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 shadow-elevated">
            <h2 className="text-lg font-semibold text-foreground mb-4">Total Volume Managed</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{totalVolume.toLocaleString()}</span>
              <span className="text-muted-foreground">cubic yards</span>
            </div>
          </Card>

          <Card className="p-6 shadow-elevated">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cost Savings (Approved)</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-secondary">${totalSavings.toLocaleString()}</span>
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
          </Card>
        </div>

        <Card className="mt-8 p-8 shadow-elevated text-center">
          <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Start Creating Sites</h2>
          <p className="text-muted-foreground mb-6">Add export and import sites to let our AI find the best matches</p>
          <Link to="/sites">
            <Button size="lg" className="bg-primary hover:bg-primary-dark">
              Go to Job Board
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
}
