import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import { schedulerStorage } from '@/lib/schedulerStorage';
import { Schedule, Hauler } from '@/types/scheduler';
import { Site, Match } from '@/types/site';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  Clock, 
  DollarSign, 
  Cloud, 
  Navigation,
  AlertTriangle,
  Leaf,
  Save,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WhatIfSimulator from '@/components/WhatIfSimulator';

export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [originalSchedule, setOriginalSchedule] = useState<Schedule | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [haulers, setHaulers] = useState<Hauler[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  useEffect(() => {
    const allSchedules = schedulerStorage.getSchedules();
    const foundSchedule = allSchedules.find(s => s.id === id);
    
    if (foundSchedule) {
      setSchedule(foundSchedule);
      setOriginalSchedule(foundSchedule);
    }
    
    setSites(storage.getSites());
    setMatches(storage.getMatches());
    setHaulers(schedulerStorage.getHaulers());
  }, [id]);

  if (!schedule) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Schedule not found</p>
          <Link to="/scheduler" className="mt-4 inline-block">
            <Button variant="outline">Back to Scheduler</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const match = matches.find(m => m.id === schedule.matchId);
  const exportSite = sites.find(s => s.id === match?.exportSiteId);
  const importSite = sites.find(s => s.id === match?.importSiteId);
  const hauler = haulers.find(h => h.id === schedule.haulerId);

  const handleSave = () => {
    const allSchedules = schedulerStorage.getSchedules();
    const updatedSchedules = allSchedules.map(s => s.id === schedule.id ? schedule : s);
    schedulerStorage.setSchedules(updatedSchedules);
    setOriginalSchedule(schedule);
    setIsEditing(false);
    
    toast({
      title: "Schedule updated",
      description: "Changes saved successfully.",
    });
  };

  const handleCancel = () => {
    if (originalSchedule) {
      setSchedule(originalSchedule);
    }
    setIsEditing(false);
  };

  const handleSimulatorApply = (updatedSchedule: Schedule) => {
    setSchedule(updatedSchedule);
    setIsEditing(true);
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

  const weatherConditions = [
    { temp: 72, condition: 'Partly Cloudy', wind: '8 mph', humidity: '45%' },
    { temp: 75, condition: 'Sunny', wind: '5 mph', humidity: '40%' },
    { temp: 73, condition: 'Clear', wind: '6 mph', humidity: '42%' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/scheduler">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Scheduler
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Schedule Details</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date(schedule.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowSimulator(true)}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                What-If Simulator
              </Button>
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Schedule
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Status and Overview */}
        <Card className="p-6 shadow-elevated mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                {schedule.isAiGenerated && (
                  <Badge variant="outline" className="border-accent text-accent">AI Generated</Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {schedule.startTime} - {schedule.endTime}
              </h2>
            </div>
            {schedule.alerts.length > 0 && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">{schedule.alerts.length} Alert(s)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Hauler
              </p>
              <p className="font-semibold text-foreground">{hauler?.name || 'Unassigned'}</p>
              {hauler && (
                <p className="text-xs text-muted-foreground">Reliability: {hauler.reliabilityScore}%</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                Distance
              </p>
              <p className="font-semibold text-foreground">{schedule.route.distance.toFixed(1)} miles</p>
              <p className="text-xs text-muted-foreground capitalize">{schedule.route.type} route</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Estimated Cost
              </p>
              <p className="font-semibold text-foreground">${schedule.route.cost.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">{schedule.trucksNeeded} trucks needed</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Leaf className="w-4 h-4" />
                Carbon Impact
              </p>
              <p className="font-semibold text-foreground">{schedule.route.carbonEmissions.toFixed(0)} kg CO₂</p>
              <p className="text-xs text-muted-foreground">Estimated emissions</p>
            </div>
          </div>
        </Card>

        {/* Alerts */}
        {schedule.alerts.length > 0 && (
          <Card className="p-6 shadow-subtle mb-6 border-l-4 border-l-destructive">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Active Alerts
            </h3>
            <div className="space-y-3">
              {schedule.alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'outline'}>
                    {alert.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium capitalize">{alert.type.replace('-', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Tabs defaultValue="route" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="route">Route Details</TabsTrigger>
            <TabsTrigger value="weather">Weather Forecast</TabsTrigger>
            <TabsTrigger value="override">Manual Override</TabsTrigger>
          </TabsList>

          <TabsContent value="route">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 shadow-elevated">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Export Site
                </h3>
                {exportSite && (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-foreground">{exportSite.name}</p>
                    <p className="text-muted-foreground">{exportSite.location}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <div>
                        <p className="text-muted-foreground">Soil Type</p>
                        <p className="font-semibold text-foreground capitalize">{exportSite.soilType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-semibold text-foreground">{exportSite.volume} yd³</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 shadow-elevated">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary" />
                  Import Site
                </h3>
                {importSite && (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-foreground">{importSite.name}</p>
                    <p className="text-muted-foreground">{importSite.location}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <div>
                        <p className="text-muted-foreground">Soil Type</p>
                        <p className="font-semibold text-foreground capitalize">{importSite.soilType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volume Needed</p>
                        <p className="font-semibold text-foreground">{importSite.volume} yd³</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 shadow-elevated lg:col-span-2">
                <h3 className="font-semibold text-foreground mb-4">Route Visualization</h3>
                <div className="bg-muted rounded-lg p-8 text-center">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                        <MapPin className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Export</p>
                      <p className="text-xs text-muted-foreground">{exportSite?.name}</p>
                    </div>

                    <div className="flex-1 mx-8">
                      <div className="relative">
                        <div className="border-t-2 border-dashed border-accent"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 py-1 rounded-full border border-border">
                          <p className="text-sm font-semibold text-foreground">{schedule.route.distance.toFixed(1)} mi</p>
                          <p className="text-xs text-muted-foreground capitalize">{schedule.route.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                        <MapPin className="w-8 h-8 text-secondary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Import</p>
                      <p className="text-xs text-muted-foreground">{importSite?.name}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weather">
            <Card className="p-6 shadow-elevated">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-accent" />
                3-Day Weather Forecast
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {weatherConditions.map((day, index) => (
                  <Card key={index} className="p-4 bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(schedule.date).setDate(new Date(schedule.date).getDate() + index)}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <Cloud className="w-8 h-8 text-accent" />
                      <p className="text-3xl font-bold text-foreground">{day.temp}°F</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-2">{day.condition}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Wind: {day.wind}</p>
                      <p>Humidity: {day.humidity}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {schedule.weatherDelay && schedule.weatherDelay > 20 && (
                <div className="mt-4 p-4 bg-status-pending/10 rounded-lg border border-status-pending/30">
                  <p className="text-sm font-semibold text-status-pending mb-1">Weather Alert</p>
                  <p className="text-sm text-muted-foreground">
                    {schedule.weatherDelay.toFixed(0)}% chance of weather-related delays
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="override">
            <Card className="p-6 shadow-elevated">
              <h3 className="font-semibold text-foreground mb-6">Manual Schedule Override</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="override-hauler">Hauler</Label>
                  <Select 
                    value={schedule.haulerId || ''} 
                    onValueChange={(value) => {
                      setSchedule({ ...schedule, haulerId: value });
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="override-hauler">
                      <SelectValue placeholder="Select hauler" />
                    </SelectTrigger>
                    <SelectContent>
                      {haulers.filter(h => h.status === 'active').map(h => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name} - ${h.costPerMile.toFixed(2)}/mi
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-date">Date</Label>
                  <Input
                    id="override-date"
                    type="date"
                    value={schedule.date}
                    onChange={(e) => {
                      setSchedule({ ...schedule, date: e.target.value });
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-start">Start Time</Label>
                  <Input
                    id="override-start"
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => {
                      setSchedule({ ...schedule, startTime: e.target.value });
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-end">End Time</Label>
                  <Input
                    id="override-end"
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => {
                      setSchedule({ ...schedule, endTime: e.target.value });
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-volume">Volume (cubic yards)</Label>
                  <Input
                    id="override-volume"
                    type="number"
                    value={schedule.volumeScheduled}
                    onChange={(e) => {
                      setSchedule({ ...schedule, volumeScheduled: parseInt(e.target.value) });
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-status">Status</Label>
                  <Select 
                    value={schedule.status} 
                    onValueChange={(value: any) => {
                      setSchedule({ ...schedule, status: value });
                      setIsEditing(true);
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="override-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="conflict">Conflict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <WhatIfSimulator
        schedule={schedule}
        haulers={haulers}
        open={showSimulator}
        onOpenChange={setShowSimulator}
        onApplyChanges={handleSimulatorApply}
      />
    </div>
  );
}
