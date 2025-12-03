import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AIBadge } from '@/components/ui/ai-badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Fuel,
  Leaf,
  Download,
  Target,
  AlertCircle,
  BarChart3,
  Activity,
  FileText,
  Briefcase,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { 
  calculateExecutiveKPIs,
  calculateProfitability,
  calculateTrends,
  generateForecast,
  runScenarioSimulation,
  calculateSustainability,
  exportToCSV
} from '@/lib/performanceCalculations';
import { municipalityStorage } from '@/lib/municipalityStorage';
import { leadStorage } from '@/lib/leadStorage';
import { initializePermitData } from '@/lib/initPermitData';
import { calculateEarthworkScore } from '@/lib/permitScoring';
import { Permit } from '@/types/municipality';
import { Lead } from '@/types/lead';
import { PageHeader } from '@/components/PageHeader';

export default function PerformanceDashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(calculateExecutiveKPIs(7));
  const [profitability, setProfitability] = useState(calculateProfitability());
  const [trends, setTrends] = useState(calculateTrends(30));
  const [forecast, setForecast] = useState(generateForecast());
  const [sustainability, setSustainability] = useState(calculateSustainability(30));
  const [permits, setPermits] = useState<Permit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Scenario modeling state
  const [fuelCostChange, setFuelCostChange] = useState(0);
  const [volumeChange, setVolumeChange] = useState(0);
  const [haulerRateChange, setHaulerRateChange] = useState(0);
  const [scenarioResult, setScenarioResult] = useState(runScenarioSimulation({
    fuelCostChange: 0,
    volumeChange: 0,
    haulerRateChange: 0
  }));

  useEffect(() => {
    initializePermitData();
    setPermits(municipalityStorage.getPermits());
    setLeads(leadStorage.getLeads());
    
    const interval = setInterval(() => {
      setKpis(calculateExecutiveKPIs(7));
      setProfitability(calculateProfitability());
      setTrends(calculateTrends(30));
      setForecast(generateForecast());
      setSustainability(calculateSustainability(30));
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  
  // Permits & Leads metrics
  const permitMetrics = useMemo(() => {
    const earthworkPermits = permits.filter(p => p.estimatedEarthworkFlag === 'yes');
    const highScorePermits = permits.filter(p => calculateEarthworkScore(p).score >= 70);
    const avgScore = permits.length > 0 
      ? Math.round(permits.reduce((sum, p) => sum + calculateEarthworkScore(p).score, 0) / permits.length)
      : 0;
    const convertedLeads = leads.filter(l => l.leadStatus === 'converted_to_job');
    const conversionRate = leads.length > 0 ? Math.round((convertedLeads.length / leads.length) * 100) : 0;
    
    return {
      totalPermits: permits.length,
      earthworkPermits: earthworkPermits.length,
      highScorePermits: highScorePermits.length,
      avgScore,
      totalLeads: leads.length,
      convertedLeads: convertedLeads.length,
      conversionRate
    };
  }, [permits, leads]);

  const handleScenarioChange = () => {
    const result = runScenarioSimulation({
      fuelCostChange,
      volumeChange,
      haulerRateChange
    });
    setScenarioResult(result);
  };

  useEffect(() => {
    handleScenarioChange();
  }, [fuelCostChange, volumeChange, haulerRateChange]);

  const handleExport = (data: any[], filename: string) => {
    exportToCSV(data, filename);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Executive Intelligence Dashboard"
          description="Comprehensive business analytics and forecasting"
        />

        {/* Executive KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Weekly Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalVolumeWeek.toLocaleString()} CY</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost per CY</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.avgCostPerCY}</div>
              <p className="text-xs text-muted-foreground mt-1">Per cubic yard</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{kpis.profitMargin}%</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>Industry avg: 25%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hauler Reliability</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.haulerReliabilityAvg}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average score</p>
            </CardContent>
          </Card>
        </div>

        {/* Permits & Leads Pipeline */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Sales Pipeline Intelligence</CardTitle>
              <AIBadge size="sm" variant="minimal" />
            </div>
            <Link to="/permits-leads">
              <Button variant="outline" size="sm" className="gap-2">
                View Permits & Leads
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <div className="text-2xl font-bold">{permitMetrics.totalPermits}</div>
                <p className="text-xs text-muted-foreground">Total Permits</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <FileText className="h-5 w-5 text-status-approved mx-auto mb-1" />
                <div className="text-2xl font-bold text-status-approved">{permitMetrics.earthworkPermits}</div>
                <p className="text-xs text-muted-foreground">Earthwork Permits</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
                <div className="text-2xl font-bold text-primary">{permitMetrics.highScorePermits}</div>
                <p className="text-xs text-muted-foreground">High AI Score (≥70%)</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Target className="h-5 w-5 text-accent mx-auto mb-1" />
                <div className="text-2xl font-bold">{permitMetrics.avgScore}%</div>
                <p className="text-xs text-muted-foreground">Avg AI Score</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Briefcase className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <div className="text-2xl font-bold">{permitMetrics.totalLeads}</div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Briefcase className="h-5 w-5 text-status-approved mx-auto mb-1" />
                <div className="text-2xl font-bold text-status-approved">{permitMetrics.convertedLeads}</div>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-600">{permitMetrics.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Conversion Funnel</h4>
              <div className="flex flex-col items-center gap-2">
                {/* Permits Stage */}
                <div className="relative w-full max-w-2xl">
                  <div 
                    className="h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg flex items-center justify-between px-6 text-white"
                    style={{ width: '100%' }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Earthwork Permits</span>
                    </div>
                    <span className="text-xl font-bold">{permitMetrics.earthworkPermits}</span>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-0.5 w-8 bg-muted-foreground/30" />
                  <span className="text-xs">
                    {permitMetrics.earthworkPermits > 0 
                      ? Math.round((permitMetrics.totalLeads / permitMetrics.earthworkPermits) * 100) 
                      : 0}% converted to leads
                  </span>
                  <div className="h-0.5 w-8 bg-muted-foreground/30" />
                </div>

                {/* Leads Stage */}
                <div className="relative w-full max-w-2xl flex justify-center">
                  <div 
                    className="h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-between px-6 text-white"
                    style={{ width: `${Math.max(40, permitMetrics.earthworkPermits > 0 ? (permitMetrics.totalLeads / permitMetrics.earthworkPermits) * 100 : 60)}%` }}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      <span className="font-medium">Leads</span>
                    </div>
                    <span className="text-xl font-bold">{permitMetrics.totalLeads}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-0.5 w-8 bg-muted-foreground/30" />
                  <span className="text-xs">{permitMetrics.conversionRate}% converted to jobs</span>
                  <div className="h-0.5 w-8 bg-muted-foreground/30" />
                </div>

                {/* Jobs Stage */}
                <div className="relative w-full max-w-2xl flex justify-center">
                  <div 
                    className="h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-b-lg flex items-center justify-between px-6 text-white"
                    style={{ width: `${Math.max(25, permitMetrics.totalLeads > 0 ? (permitMetrics.convertedLeads / permitMetrics.totalLeads) * 100 : 30)}%` }}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      <span className="font-medium">Jobs</span>
                    </div>
                    <span className="text-xl font-bold">{permitMetrics.convertedLeads}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sustainability Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fuel Savings</CardTitle>
              <Fuel className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{kpis.fuelSavings.toLocaleString()} gal</div>
              <p className="text-xs text-muted-foreground mt-1">vs. landfill alternative</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Reduction</CardTitle>
              <Leaf className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{kpis.co2Reduction} tons</div>
              <p className="text-xs text-muted-foreground mt-1">Carbon emissions saved</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Distance Saved</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{kpis.avgHaulDistanceSaved} mi</div>
              <p className="text-xs text-muted-foreground mt-1">Per haul average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Quick Export
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport(trends, 'performance-trends.csv')}
            >
              Export Trends
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport(profitability.byJob, 'profitability-by-job.csv')}
            >
              Export Profitability
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport(forecast, 'forecast-data.csv')}
            >
              Export Forecast
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport([sustainability], 'sustainability-metrics.csv')}
            >
              Export Sustainability
            </Button>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>30-Day Performance Trends</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport(trends, 'trends.csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="volume" fill="#3b82f6" stroke="#3b82f6" name="Volume (CY)" fillOpacity={0.3} />
                    <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#10b981" name="Profit ($)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#ef4444" name="Cost ($)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Cost Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                      <Bar dataKey="cost" fill="#ef4444" name="Cost ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost per Mile Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="costPerMile" stroke="#8b5cf6" name="Cost/Mile ($)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profitability by Region</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport(profitability.byRegion, 'profitability-by-region.csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={profitability.byRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                    <Bar dataKey="cost" fill="#ef4444" name="Cost ($)" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profitability by Hauler</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport(profitability.byHauler, 'profitability-by-hauler.csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={profitability.byHauler} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="haulerName" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="profit" fill="#10b981" name="Profit ($)" />
                      <Bar dataKey="margin" fill="#8b5cf6" name="Margin (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Top 10 Jobs by Profit</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport(profitability.byJob, 'profitability-by-job.csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={profitability.byJob.sort((a, b) => b.profit - a.profit).slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="jobName" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="profit" fill="#10b981" name="Profit ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Job Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Job</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Cost</th>
                        <th className="text-right p-2">Profit</th>
                        <th className="text-right p-2">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitability.byJob.map((job, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2">{job.jobName}</td>
                          <td className="text-right p-2">${job.revenue.toLocaleString()}</td>
                          <td className="text-right p-2">${job.cost.toLocaleString()}</td>
                          <td className="text-right p-2 font-semibold text-green-600">${job.profit.toLocaleString()}</td>
                          <td className="text-right p-2">{job.margin.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Supply & Demand Forecasting</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport(forecast, 'forecast.csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {forecast.map((f, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{f.period}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <span className="font-semibold">{f.confidence}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Demand for Fill</p>
                          <p className="text-2xl font-bold text-orange-600">{f.demandForFill.toLocaleString()} CY</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Expected Supply</p>
                          <p className="text-2xl font-bold text-blue-600">{f.expectedSupply.toLocaleString()} CY</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Gap</p>
                          <p className={`text-2xl font-bold ${f.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {f.gap >= 0 ? '+' : ''}{f.gap.toLocaleString()} CY
                          </p>
                        </div>
                      </div>
                      {f.gap < 0 && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Supply Gap Warning</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              Projected deficit of {Math.abs(f.gap).toLocaleString()} CY. Consider activating additional import sites or reducing export commitments.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>What-If Scenario Modeling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fuel-cost">Fuel Cost Change (%)</Label>
                    <Input
                      id="fuel-cost"
                      type="number"
                      value={fuelCostChange}
                      onChange={(e) => setFuelCostChange(Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {fuelCostChange > 0 ? '+' : ''}{fuelCostChange}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume Change (%)</Label>
                    <Input
                      id="volume"
                      type="number"
                      value={volumeChange}
                      onChange={(e) => setVolumeChange(Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {volumeChange > 0 ? '+' : ''}{volumeChange}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hauler-rate">Hauler Rate Change (%)</Label>
                    <Input
                      id="hauler-rate"
                      type="number"
                      value={haulerRateChange}
                      onChange={(e) => setHaulerRateChange(Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {haulerRateChange > 0 ? '+' : ''}{haulerRateChange}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Profit Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current:</span>
                          <span className="font-semibold">{scenarioResult.originalMargin}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Projected:</span>
                          <span className={`font-bold text-lg ${scenarioResult.newMargin >= scenarioResult.originalMargin ? 'text-green-600' : 'text-red-600'}`}>
                            {scenarioResult.newMargin}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {scenarioResult.newMargin >= scenarioResult.originalMargin ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={scenarioResult.newMargin >= scenarioResult.originalMargin ? 'text-green-600' : 'text-red-600'}>
                            {(scenarioResult.newMargin - scenarioResult.originalMargin).toFixed(1)}% change
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Cost per CY</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current:</span>
                          <span className="font-semibold">${scenarioResult.originalCostPerCY}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Projected:</span>
                          <span className={`font-bold text-lg ${scenarioResult.newCostPerCY <= scenarioResult.originalCostPerCY ? 'text-green-600' : 'text-red-600'}`}>
                            ${scenarioResult.newCostPerCY}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {scenarioResult.newCostPerCY <= scenarioResult.originalCostPerCY ? (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          )}
                          <span className={scenarioResult.newCostPerCY <= scenarioResult.originalCostPerCY ? 'text-green-600' : 'text-red-600'}>
                            ${(scenarioResult.newCostPerCY - scenarioResult.originalCostPerCY).toFixed(2)} change
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current:</span>
                          <span className="font-semibold">${scenarioResult.originalProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Projected:</span>
                          <span className={`font-bold text-lg ${scenarioResult.newProfit >= scenarioResult.originalProfit ? 'text-green-600' : 'text-red-600'}`}>
                            ${scenarioResult.newProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {scenarioResult.newProfit >= scenarioResult.originalProfit ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={scenarioResult.newProfit >= scenarioResult.originalProfit ? 'text-green-600' : 'text-red-600'}>
                            ${(scenarioResult.newProfit - scenarioResult.originalProfit).toLocaleString()} change
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Impact Assessment</h4>
                  <p className="text-sm">{scenarioResult.impact}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sustainability Metrics (Last 30 Days)</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport([sustainability], 'sustainability.csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Carbon Saved
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{sustainability.carbonSaved} tons</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        CO₂ emissions reduced vs. landfill disposal
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        Mileage Reduced
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">{sustainability.mileageReduced.toLocaleString()} mi</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Total miles saved through optimized routing
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-orange-600" />
                        Fuel Saved
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">{sustainability.fuelSaved.toLocaleString()} gal</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Gallons of diesel fuel conserved
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Landfill Diverted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{sustainability.landfillDiverted.toLocaleString()} CY</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Cubic yards redirected from landfills
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Cost Savings vs. Landfill</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">${sustainability.costSavingsVsLandfill.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Total savings compared to landfill disposal costs
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Environmental Impact Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Equivalent Trees Planted:</p>
                      <p className="text-xl font-bold">{Math.round(sustainability.carbonSaved * 40)} trees</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Equivalent Cars Off Road:</p>
                      <p className="text-xl font-bold">{Math.round(sustainability.carbonSaved * 0.22)} vehicles</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Energy Saved:</p>
                      <p className="text-xl font-bold">{Math.round(sustainability.fuelSaved * 0.138)} MWh</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Waste Diverted:</p>
                      <p className="text-xl font-bold">{Math.round(sustainability.landfillDiverted * 1.4)} tons</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
