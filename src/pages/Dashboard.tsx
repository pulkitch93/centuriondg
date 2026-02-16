import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIBadge } from '@/components/ui/ai-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { storage } from '@/lib/storage';
import { schedulerStorage } from '@/lib/schedulerStorage';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { operationsStorage } from '@/lib/operationsStorage';
import { municipalityStorage } from '@/lib/municipalityStorage';
import { leadStorage } from '@/lib/leadStorage';
import { initializeSampleData } from '@/lib/initializeData';
import { initializePermitData } from '@/lib/initPermitData';
import { calculateEarthworkScore } from '@/lib/permitScoring';
import { Site, Match } from '@/types/site';
import { Permit } from '@/types/municipality';
import { Lead } from '@/types/lead';
import { MapPin, TrendingUp, Sparkles, CheckCircle2, Users, Truck, Shield, BarChart3, FileText, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [jobs, setJobs] = useState(operationsStorage.getJobs());
  const [permits, setPermits] = useState<Permit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
    initializePermitData();
    
    setSites(storage.getSites());
    setMatches(storage.getMatches());
    setJobs(operationsStorage.getJobs());
    setPermits(municipalityStorage.getPermits());
    setLeads(leadStorage.getLeads());
  }, []);

  const exportSites = sites.filter(s => s.type === 'export');
  const importSites = sites.filter(s => s.type === 'import');
  const suggestedMatches = matches.filter(m => m.status === 'suggested');
  const approvedMatches = matches.filter(m => m.status === 'approved');

  const totalVolume = sites.reduce((sum, site) => sum + site.volume, 0);
  const totalSavings = approvedMatches.reduce((sum, match) => sum + match.costSavings, 0);
  
  // Permits & Leads insights
  const earthworkPermits = permits.filter(p => p.estimatedEarthworkFlag === 'yes');
  const activeLeads = leads.filter(l => l.leadStatus !== 'converted_to_job' && l.leadStatus !== 'disqualified');
  const highScorePermits = useMemo(() => 
    permits.filter(p => calculateEarthworkScore(p).score >= 70).length, 
    [permits]
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-card shadow-subtle">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/" className="hover:opacity-80 transition-opacity">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">EarthFlow Platform</h1>
                      <p className="text-sm text-muted-foreground">Intelligent Earthwork Logistics</p>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Go to marketing landing page</TooltipContent>
              </Tooltip>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/operations">
                      <Button variant="default" className="bg-primary">Operations Center</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Real-time job monitoring & live map</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/materials">
                      <Button variant="outline">Materials Hub</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>AI-powered soil matching & sourcing</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/haulers">
                      <Button variant="outline">Hauler Network</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Manage trucking partners & drivers</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/dispatches">
                      <Button variant="outline">Dispatches</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Track dispatch tickets & deliveries</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/scheduler">
                      <Button variant="outline">Scheduler</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>AI-optimized hauling schedules</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/compliance">
                      <Button variant="outline">Compliance</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Document management & audit trails</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/permits-leads">
                      <Button variant="outline">Permits & Leads</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Convert permits to sales leads</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/sites">
                      <Button variant="outline">Job Board</Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Manage export/import sites & AI matches</TooltipContent>
                </Tooltip>
              </div>
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

          <Card className="p-6 shadow-elevated border-l-4 border-l-accent relative overflow-hidden bg-gradient-to-br from-accent/5 to-primary/5">
            <div className="absolute top-2 right-2">
              <AIBadge size="sm" variant="pill" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  AI Matches
                  <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">{suggestedMatches.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center animate-pulse-subtle">
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

        {/* Permits & Leads Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 shadow-elevated border-l-4 border-l-primary relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="absolute top-2 right-2">
              <AIBadge size="sm" variant="minimal" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  High-Score Permits
                  <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">{highScorePermits}</p>
                <p className="text-xs text-muted-foreground">AI Score ≥70%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-status-approved">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Earthwork Permits</p>
                <p className="text-3xl font-bold text-foreground mt-1">{earthworkPermits.length}</p>
                <p className="text-xs text-muted-foreground">of {permits.length} total</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-status-approved/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-status-approved" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-3xl font-bold text-foreground mt-1">{activeLeads.length}</p>
                <p className="text-xs text-muted-foreground">{leads.filter(l => l.leadStatus === 'converted_to_job').length} converted</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="p-8 shadow-elevated text-center relative overflow-hidden bg-gradient-to-br from-accent/5 to-primary/5">
            <div className="absolute top-3 right-3">
              <AIBadge size="md" variant="pill" />
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse-subtle">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">AI-Powered Site Matching</h2>
            <p className="text-muted-foreground mb-6">Add export and import sites to let our AI find the best matches and optimize costs</p>
            <Link to="/sites">
              <Button size="lg" className="bg-primary hover:bg-primary-dark">
                Go to Job Board
              </Button>
            </Link>
          </Card>

          <Card className="p-8 shadow-elevated text-center">
            <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Executive Intelligence</h2>
            <p className="text-muted-foreground mb-6">Track KPIs, profitability, forecasts, and sustainability metrics</p>
            <Link to="/performance">
              <Button size="lg" className="bg-primary hover:bg-primary-dark">
                View Performance Dashboard
              </Button>
            </Link>
          </Card>
        </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
