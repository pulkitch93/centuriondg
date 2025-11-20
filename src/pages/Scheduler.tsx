import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIBadge } from '@/components/ui/ai-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { storage } from '@/lib/storage';
import { schedulerStorage } from '@/lib/schedulerStorage';
import { generateSchedules } from '@/lib/scheduler';
import { Schedule, Hauler } from '@/types/scheduler';
import { Site, Match } from '@/types/site';
import { ArrowLeft, Calendar, Sparkles, TrendingUp, Truck, AlertTriangle, Download, GripVertical, Eye, Brain, Clock, Zap } from 'lucide-react';
import WhatIfSimulator from '@/components/WhatIfSimulator';
import { MitigationPlanDialog } from '@/components/MitigationPlanDialog';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';

export default function Scheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [haulers, setHaulers] = useState<Hauler[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showMitigationPlan, setShowMitigationPlan] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setSites(storage.getSites());
    setMatches(storage.getMatches());
    setSchedules(schedulerStorage.getSchedules());
    setHaulers(schedulerStorage.getHaulers());
  }, []);

  const handleGenerateSchedules = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newSchedules = generateSchedules(matches, sites, haulers, schedules);
      
      if (newSchedules.length === 0) {
        toast({
          title: "No schedules to generate",
          description: "Approve some matches first to generate schedules.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }
      
      const allSchedules = [...schedules, ...newSchedules];
      schedulerStorage.setSchedules(allSchedules);
      setSchedules(allSchedules);
      
      toast({
        title: "Schedules generated",
        description: `Created ${newSchedules.length} AI-optimized schedule(s).`,
      });
      
      setIsGenerating(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-status-approved/20 text-status-approved border-status-approved/30';
      case 'in-progress': return 'bg-status-matched/20 text-status-matched border-status-matched/30';
      case 'completed': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'delayed': return 'bg-status-pending/20 text-status-pending border-status-pending/30';
      case 'conflict': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-status-pending';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const groupSchedulesByDate = () => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach(schedule => {
      if (!grouped[schedule.date]) {
        grouped[schedule.date] = [];
      }
      grouped[schedule.date].push(schedule);
    });
    return grouped;
  };

  const exportSchedule = () => {
    const csv = [
      ['Date', 'Time', 'Match ID', 'Hauler', 'Volume', 'Trucks', 'Route Type', 'Distance', 'Cost', 'Status'].join(','),
      ...schedules.map(s => {
        const hauler = haulers.find(h => h.id === s.haulerId);
        return [
          s.date,
          `${s.startTime}-${s.endTime}`,
          s.matchId,
          hauler?.name || 'Unassigned',
          s.volumeScheduled,
          s.trucksNeeded,
          s.route.type,
          s.route.distance.toFixed(1),
          s.route.cost.toFixed(2),
          s.status,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Schedule exported",
      description: "CSV file downloaded successfully.",
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const scheduleId = active.id as string;
    const newDate = over.id as string;

    const updatedSchedules = schedules.map(s => 
      s.id === scheduleId ? { ...s, date: newDate } : s
    );

    schedulerStorage.setSchedules(updatedSchedules);
    setSchedules(updatedSchedules);

    toast({
      title: "Schedule moved",
      description: `Rescheduled to ${new Date(newDate).toLocaleDateString()}`,
    });
  };

  const handleSimulatorApply = (updatedSchedule: Schedule) => {
    const allSchedules = schedulerStorage.getSchedules();
    const updated = allSchedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
    schedulerStorage.setSchedules(updated);
    setSchedules(updated);
    
    toast({
      title: "Changes applied",
      description: "Schedule updated with simulation results.",
    });
  };

  const totalAlerts = schedules.reduce((sum, s) => sum + s.alerts.length, 0);
  const highAlerts = schedules.reduce((sum, s) => 
    sum + s.alerts.filter(a => a.severity === 'high').length, 0
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <PageHeader 
            title="Logistics Scheduler" 
            description="AI-powered haul scheduling & optimization"
            actions={
              <>
                {schedules.length > 0 && (
                  <Button onClick={exportSchedule} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
                <Button 
                  onClick={handleGenerateSchedules} 
                  disabled={isGenerating}
                  className="bg-accent hover:bg-accent-light"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate AI Schedules'}
                </Button>
              </>
            }
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-subtle border-l-4 border-l-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Schedules</p>
                <p className="text-3xl font-bold text-foreground mt-1">{schedules.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Haulers</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {haulers.filter(h => h.status === 'active').length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-secondary" />
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {schedules.reduce((sum, s) => sum + s.volumeScheduled, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">cubic yards</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 shadow-subtle border-l-4 border-l-destructive">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalAlerts}</p>
                {highAlerts > 0 && (
                  <p className="text-xs text-destructive">{highAlerts} high priority</p>
                )}
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </Card>
        </div>

        {/* AI Prescriptive Scheduling Intelligence */}
        {schedules.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 shadow-elevated relative overflow-hidden bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/30">
              <div className="absolute top-3 right-3">
                <AIBadge size="md" variant="pill" />
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-accent animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">Optimization Opportunities</h3>
                  <p className="text-sm text-muted-foreground">AI-detected schedule improvements</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-card/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Route Consolidation</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Combine Schedule #247 and #249 to save 3.2 hours of travel time and $420 in fuel costs.
                  </p>
                  <Badge className="bg-secondary/20 text-secondary text-xs">Potential savings: $420</Badge>
                </div>
                <Button size="sm" variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  Apply Optimization
                </Button>
              </div>
            </Card>

            <Card className="p-6 shadow-elevated relative overflow-hidden bg-gradient-to-br from-destructive/5 to-status-pending/5 border-2 border-destructive/30">
              <div className="absolute top-3 right-3">
                <AIBadge size="md" variant="pill" />
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-destructive/20 to-status-pending/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">Predictive Bottlenecks</h3>
                  <p className="text-sm text-muted-foreground">AI risk detection & mitigation</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Weather Delay Risk: 67%</p>
                    <p className="text-xs text-muted-foreground">Rain forecast Thu 2-5PM, affects 4 schedules</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-pending mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Hauler Capacity: 89%</p>
                    <p className="text-xs text-muted-foreground">Consider backup fleet for Friday surge</p>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-border">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowMitigationPlan(true)}
                  >
                    View Mitigation Plan
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-elevated relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30">
              <div className="absolute top-3 right-3">
                <AIBadge size="md" variant="pill" />
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">Smart Recommendations</h3>
                  <p className="text-sm text-muted-foreground">Automated scheduling insights</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-status-approved" />
                  <p className="text-sm text-foreground">Shift 2 jobs to morning window (+18% efficiency)</p>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-status-approved" />
                  <p className="text-sm text-foreground">Assign Hauler H-03 to Route 12 (best reliability)</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-status-approved" />
                  <p className="text-sm text-foreground">Batch similar routes for 12% cost reduction</p>
                </div>
                <div className="pt-2 mt-2 border-t border-border text-xs text-muted-foreground">
                  Based on 2,847 historical schedule patterns
                </div>
              </div>
            </Card>
          </div>
        )}

        {schedules.length === 0 ? (
          <Card className="p-12 text-center shadow-elevated">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Schedules Yet</h2>
            <p className="text-muted-foreground mb-6">
              Approve some matches in the Job Board, then generate AI-powered schedules
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/sites">
                <Button variant="outline">Go to Job Board</Button>
              </Link>
              <Button onClick={handleGenerateSchedules} className="bg-accent hover:bg-accent-light">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Schedules
              </Button>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="haulers">Haulers</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="space-y-6">
                  {Object.entries(groupSchedulesByDate())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, daySchedules]) => (
                      <Card 
                        key={date} 
                        className="p-6 shadow-elevated"
                        data-date={date}
                      >
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <div className="space-y-3">
                          {daySchedules.map(schedule => {
                            const hauler = haulers.find(h => h.id === schedule.haulerId);
                            const match = matches.find(m => m.id === schedule.matchId);
                            
                            return (
                              <div 
                                key={schedule.id} 
                                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-move relative group"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.dataTransfer.setData('scheduleId', schedule.id);
                                }}
                              >
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="ml-8">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge className={getStatusColor(schedule.status)}>
                                          {schedule.status}
                                        </Badge>
                                        {schedule.isAiGenerated && (
                                          <Badge variant="outline" className="border-accent text-accent">
                                            AI Generated
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="font-semibold text-foreground">
                                        {schedule.startTime} - {schedule.endTime}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Match: {match?.exportSiteId.substring(0, 12)}...
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-foreground">
                                        {hauler?.name || 'No Hauler Assigned'}
                                      </p>
                                      {hauler && (
                                        <p className="text-xs text-muted-foreground">
                                          Reliability: {hauler.reliabilityScore}%
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                    <div>
                                      <p className="text-muted-foreground">Volume</p>
                                      <p className="font-semibold text-foreground">{schedule.volumeScheduled} yd³</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Trucks</p>
                                      <p className="font-semibold text-foreground">{schedule.trucksNeeded}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Distance</p>
                                      <p className="font-semibold text-foreground">{schedule.route.distance.toFixed(1)} mi</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Cost</p>
                                      <p className="font-semibold text-foreground">${schedule.route.cost.toFixed(0)}</p>
                                    </div>
                                  </div>

                                  {schedule.alerts.length > 0 && (
                                    <div className="border-t border-border pt-3 space-y-2 mb-3">
                                      {schedule.alerts.map(alert => (
                                        <div key={alert.id} className="flex items-start gap-2">
                                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                                          <p className={`text-sm ${getSeverityColor(alert.severity)}`}>
                                            {alert.message}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-3 border-t border-border">
                                    <Link to={`/schedule/${schedule.id}`} className="flex-1">
                                      <Button variant="outline" size="sm" className="w-full">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </Button>
                                    </Link>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSchedule(schedule);
                                        setShowSimulator(true);
                                      }}
                                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                                    >
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      What-If
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                </div>
              </DndContext>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {schedules.map(schedule => {
                  const hauler = haulers.find(h => h.id === schedule.haulerId);
                  return (
                    <Card key={schedule.id} className="p-6 shadow-subtle hover:shadow-elevated transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                            <span className="text-sm text-muted-foreground">{schedule.date}</span>
                            <span className="text-sm text-muted-foreground">{schedule.startTime}</span>
                          </div>
                          <p className="font-semibold text-foreground mb-1">{hauler?.name || 'Unassigned'}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{schedule.volumeScheduled} yd³</span>
                            <span>{schedule.trucksNeeded} trucks</span>
                            <span>{schedule.route.distance.toFixed(1)} mi</span>
                            <span>${schedule.route.cost.toFixed(0)}</span>
                          </div>
                        </div>
                        {schedule.alerts.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-destructive">{schedule.alerts.length}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="haulers">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {haulers.map(hauler => {
                  const haulerSchedules = schedules.filter(s => s.haulerId === hauler.id);
                  const totalVolume = haulerSchedules.reduce((sum, s) => sum + s.volumeScheduled, 0);
                  
                  return (
                    <Card key={hauler.id} className="p-6 shadow-elevated">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{hauler.name}</h3>
                          <Badge className={hauler.status === 'active' ? 'bg-status-approved/20 text-status-approved' : 'bg-muted'}>
                            {hauler.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{hauler.reliabilityScore}%</p>
                          <p className="text-xs text-muted-foreground">Reliability</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Trucks Available</p>
                          <p className="font-semibold text-foreground">{hauler.trucksAvailable}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost/Mile</p>
                          <p className="font-semibold text-foreground">${hauler.costPerMile.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Scheduled Jobs</p>
                          <p className="font-semibold text-foreground">{haulerSchedules.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Volume</p>
                          <p className="font-semibold text-foreground">{totalVolume} yd³</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <WhatIfSimulator
        schedule={selectedSchedule}
        haulers={haulers}
        open={showSimulator}
        onOpenChange={setShowSimulator}
        onApplyChanges={handleSimulatorApply}
      />

      <MitigationPlanDialog
        open={showMitigationPlan}
        onOpenChange={setShowMitigationPlan}
      />
    </div>
  );
}
