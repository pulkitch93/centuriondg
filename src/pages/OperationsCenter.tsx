import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, CheckCircle, Clock, MapPin, Truck, Send, 
  TrendingUp, Activity, AlertCircle, Radio, MessageSquare 
} from 'lucide-react';
import { operationsStorage } from '@/lib/operationsStorage';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { storage } from '@/lib/storage';
import { schedulerStorage } from '@/lib/schedulerStorage';
import { initializeOperationsData } from '@/lib/initOperationsData';
import { Job, OperationsAlert, HaulerMessage } from '@/types/operations';
import { Driver } from '@/types/dispatch';
import { Site } from '@/types/site';
import { Hauler } from '@/types/scheduler';
import { toast } from 'sonner';

export default function OperationsCenter() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [alerts, setAlerts] = useState<OperationsAlert[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [haulers, setHaulers] = useState<Hauler[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(
    localStorage.getItem('mapbox_token') || ''
  );
  const [showTokenInput, setShowTokenInput] = useState(!localStorage.getItem('mapbox_token'));
  
  // Messaging
  const [messageDialog, setMessageDialog] = useState(false);
  const [selectedHauler, setSelectedHauler] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messagePriority, setMessagePriority] = useState<'normal' | 'urgent'>('normal');

  useEffect(() => {
    initializeOperationsData();
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setJobs(operationsStorage.getJobs());
    setAlerts(operationsStorage.getAlerts());
    setDrivers(dispatchStorage.getDrivers());
    setSites(storage.getSites());
    setHaulers(schedulerStorage.getHaulers());
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-80.8431, 35.2271],
      zoom: 9,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for active jobs
    jobs.forEach(job => {
      const exportSite = sites.find(s => s.id === job.exportSiteId);
      const importSite = sites.find(s => s.id === job.importSiteId);
      
      if (exportSite && map.current) {
        const color = getJobColor(job.status);
        new mapboxgl.Marker({ color })
          .setLngLat([exportSite.coordinates.lng, exportSite.coordinates.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${job.id}</h3>
              <p class="text-sm">${exportSite.name}</p>
              <p class="text-xs">${job.status}</p>
              <p class="text-xs">${Math.round((job.volumeActual / job.volumePlanned) * 100)}% complete</p>
            </div>
          `))
          .addTo(map.current);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, jobs, sites]);

  const handleSaveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
      window.location.reload();
    }
  };

  const handleSendMessage = () => {
    if (!selectedHauler || !messageText.trim()) {
      toast.error('Please select a hauler and enter a message');
      return;
    }

    const newMessage: HaulerMessage = {
      id: `MSG-${Date.now()}`,
      haulerId: selectedHauler,
      senderId: 'ops-manager-1',
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false,
      priority: messagePriority,
    };

    const messages = operationsStorage.getMessages();
    operationsStorage.setMessages([...messages, newMessage]);
    
    toast.success(`Message sent to ${haulers.find(h => h.id === selectedHauler)?.name}`);
    setMessageDialog(false);
    setMessageText('');
    setSelectedHauler('');
    setMessagePriority('normal');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            acknowledged: true, 
            acknowledgedBy: 'Operations Manager',
            acknowledgedAt: new Date().toISOString() 
          }
        : alert
    );
    operationsStorage.setAlerts(updatedAlerts);
    setAlerts(updatedAlerts);
    toast.success('Alert acknowledged');
  };

  const handleResolveAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            resolved: true,
            resolvedAt: new Date().toISOString() 
          }
        : alert
    );
    operationsStorage.setAlerts(updatedAlerts);
    setAlerts(updatedAlerts);
    toast.success('Alert resolved');
  };

  const getJobColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'delivering': return '#3b82f6';
      case 'loading': return '#eab308';
      case 'loaded': return '#8b5cf6';
      case 'in-route': return '#06b6d4';
      case 'delayed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const activeJobs = jobs.filter(j => !['completed', 'cancelled'].includes(j.status));
  const totalVolumePlanned = activeJobs.reduce((sum, j) => sum + j.volumePlanned, 0);
  const totalVolumeActual = activeJobs.reduce((sum, j) => sum + j.volumeActual, 0);
  const overallProgress = totalVolumePlanned > 0 ? (totalVolumeActual / totalVolumePlanned) * 100 : 0;
  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <div className="min-h-screen bg-background">
      {showTokenInput && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Mapbox Token Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get your free token at{' '}
                <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  mapbox.com
                </a>
              </p>
              <input
                type="text"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                placeholder="pk.eyJ1..."
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveToken} className="flex-1">Save Token</Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card border-b p-4">
          <div className="flex items-center justify-between max-w-[2000px] mx-auto">
            <div className="flex items-center gap-3">
              <Radio className="h-8 w-8 text-primary animate-pulse" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Operations Control Center</h1>
                <p className="text-sm text-muted-foreground">Real-time command & monitoring</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Haulers
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Message to Hauler</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Hauler</label>
                      <Select value={selectedHauler} onValueChange={setSelectedHauler}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hauler" />
                        </SelectTrigger>
                        <SelectContent>
                          {haulers.map(h => (
                            <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={messagePriority} onValueChange={(v: 'normal' | 'urgent') => setMessagePriority(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSendMessage} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Map & Stats */}
          <div className="flex-1 flex flex-col p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Jobs</p>
                      <p className="text-2xl font-bold">{activeJobs.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Alerts</p>
                      <p className="text-2xl font-bold text-orange-600">{activeAlerts.length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Trucks Active</p>
                      <p className="text-2xl font-bold">{activeJobs.reduce((sum, j) => sum + j.trucksActive, 0)}</p>
                    </div>
                    <Truck className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Map */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Live Operations Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={mapContainer} className="w-full h-[400px]" />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Jobs & Alerts */}
          <div className="w-[600px] border-l bg-muted/50 overflow-y-auto">
            <Tabs defaultValue="jobs" className="h-full flex flex-col">
              <TabsList className="m-4">
                <TabsTrigger value="jobs">Live Jobs</TabsTrigger>
                <TabsTrigger value="alerts">
                  AI Alerts {criticalAlerts.length > 0 && (
                    <Badge variant="destructive" className="ml-2">{criticalAlerts.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="flex-1 px-4 space-y-3">
                {jobs.map(job => {
                  const exportSite = sites.find(s => s.id === job.exportSiteId);
                  const importSite = sites.find(s => s.id === job.importSiteId);
                  const hauler = haulers.find(h => h.id === job.haulerId);
                  const progress = (job.volumeActual / job.volumePlanned) * 100;
                  
                  return (
                    <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedJob(job.id)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{job.id}</CardTitle>
                          <Badge style={{ backgroundColor: getJobColor(job.status) }}>
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {exportSite?.name} → {importSite?.name}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Hauler</p>
                            <p className="font-medium">{hauler?.name}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Trucks Active</p>
                            <p className="font-medium">{job.trucksActive}/{job.trucksAssigned}</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Volume Progress</span>
                            <span className="font-medium">{job.volumeActual}/{job.volumePlanned} CY</span>
                          </div>
                          <Progress value={progress} />
                          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
                        </div>
                        
                        {job.alerts.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{job.alerts.length} alert{job.alerts.length > 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {job.notes && (
                          <p className="text-xs text-muted-foreground italic">{job.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="alerts" className="flex-1 px-4 space-y-3">
                {alerts.filter(a => !a.resolved).map(alert => (
                  <Card key={alert.id} className={`${
                    alert.severity === 'critical' ? 'border-red-500' :
                    alert.severity === 'high' ? 'border-orange-500' :
                    alert.severity === 'medium' ? 'border-yellow-500' :
                    'border-blue-500'
                  } border-l-4`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.severity)}
                          <div>
                            <CardTitle className="text-sm">{alert.title}</CardTitle>
                            {alert.riskPercentage && (
                              <p className="text-xs text-muted-foreground">Risk: {alert.riskPercentage}%</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{alert.message}</p>
                      
                      {alert.jobId && (
                        <p className="text-xs text-muted-foreground">
                          Related to: {alert.jobId}
                        </p>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      
                      <div className="flex gap-2">
                        {!alert.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {alert.acknowledged && !alert.resolved && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolve
                          </Button>
                        )}
                        {alert.acknowledged && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Acknowledged
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {alerts.filter(a => !a.resolved).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <p>No active alerts</p>
                    <p className="text-sm">All systems operating normally</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
