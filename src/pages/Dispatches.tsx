import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, Navigation, Plus, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { schedulerStorage } from '@/lib/schedulerStorage';
import { storage } from '@/lib/storage';
import { initializeDispatchData } from '@/lib/initDispatchData';
import { DispatchTicket, Driver } from '@/types/dispatch';
import { Hauler, Schedule } from '@/types/scheduler';
import { Site } from '@/types/site';

export default function Dispatches() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<DispatchTicket[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [haulers, setHaulers] = useState<Hauler[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Form state
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [volume, setVolume] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    initializeDispatchData(); // Initialize sample data
    loadData();
  }, []);

  const loadData = () => {
    setTickets(dispatchStorage.getDispatchTickets());
    setDrivers(dispatchStorage.getDrivers());
    setHaulers(schedulerStorage.getHaulers());
    setSites(storage.getSites());
    setSchedules(schedulerStorage.getSchedules());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'en-route-delivery': 
      case 'en-route-pickup': return 'bg-blue-500';
      case 'loading':
      case 'unloading': return 'bg-yellow-500';
      case 'accepted': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'en-route-delivery':
      case 'en-route-pickup': return <Navigation className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateDispatch = () => {
    if (!selectedSchedule || !selectedDriver || !volume) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const schedule = schedules.find(s => s.id === selectedSchedule);
    const driver = drivers.find(d => d.id === selectedDriver);
    const hauler = haulers.find(h => h.id === driver?.haulerId);

    if (!schedule || !driver || !hauler) return;

    const newTicket: DispatchTicket = {
      id: `T-${Date.now()}`,
      scheduleId: schedule.id,
      driverId: driver.id,
      haulerCompany: hauler.name,
      exportSiteId: schedule.matchId.split('-')[0],
      importSiteId: schedule.matchId.split('-')[1],
      volume: parseFloat(volume),
      status: 'pending',
      createdAt: new Date().toISOString(),
      gpsTrack: [],
      issues: [],
      notes: notes
    };

    const updatedTickets = [...tickets, newTicket];
    dispatchStorage.setDispatchTickets(updatedTickets);
    setTickets(updatedTickets);

    // Update driver status
    const updatedDrivers = drivers.map(d => 
      d.id === driver.id ? { ...d, status: 'on-job' as const } : d
    );
    dispatchStorage.setDrivers(updatedDrivers);
    setDrivers(updatedDrivers);

    toast({
      title: "Dispatch Created",
      description: `Ticket ${newTicket.id} assigned to ${driver.name}`,
    });

    setIsCreateOpen(false);
    setSelectedSchedule('');
    setSelectedDriver('');
    setVolume('');
    setNotes('');
  };

  const activeTickets = tickets.filter(t => !['delivered', 'cancelled'].includes(t.status));
  const completedTickets = tickets.filter(t => t.status === 'delivered');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dispatch Management</h1>
            <p className="text-muted-foreground mt-2">Manage haul dispatches and tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/performance')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Performance
            </Button>
            <Button variant="outline" onClick={() => navigate('/live-tracking')}>
              <MapPin className="mr-2 h-4 w-4" />
              Live GPS Tracking
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Dispatch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Dispatch</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Schedule</Label>
                    <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {schedules.map(schedule => (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            {schedule.id} - {schedule.date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Driver</Label>
                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.filter(d => d.status === 'available').map(driver => {
                          const hauler = haulers.find(h => h.id === driver.haulerId);
                          return (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name} - {hauler?.name} ({driver.truckType})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Volume (CY)</Label>
                    <Input 
                      type="number" 
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="Enter volume"
                    />
                  </div>

                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions..."
                    />
                  </div>

                  <Button onClick={handleCreateDispatch} className="w-full">
                    Create Dispatch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Dispatches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeTickets.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTickets.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">With Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {tickets.filter(t => t.issues.length > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dispatch List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active ({activeTickets.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTickets.length})</TabsTrigger>
            <TabsTrigger value="all">All Dispatches</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeTickets.map(ticket => {
              const driver = drivers.find(d => d.id === ticket.driverId);
              const exportSite = sites.find(s => s.id === ticket.exportSiteId);
              const importSite = sites.find(s => s.id === ticket.importSiteId);

              return (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Truck className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">{ticket.id}</h3>
                          <p className="text-sm text-muted-foreground">{ticket.haulerCompany}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">From: {exportSite?.name}</p>
                            <p className="text-xs text-muted-foreground">{exportSite?.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">To: {importSite?.name}</p>
                            <p className="text-xs text-muted-foreground">{importSite?.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Driver</span>
                          <span className="text-sm font-medium">{driver?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Volume</span>
                          <span className="text-sm font-medium">{ticket.volume} CY</span>
                        </div>
                        {ticket.eta && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">ETA</span>
                            <span className="text-sm font-medium">{ticket.eta}</span>
                          </div>
                        )}
                        {ticket.issues.length > 0 && (
                          <div className="flex items-start gap-2 pt-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-yellow-600">
                                {ticket.issues.length} Issue(s)
                              </p>
                              {ticket.issues.map(issue => (
                                <p key={issue.id} className="text-xs text-muted-foreground">
                                  {issue.type}: {issue.description}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/driver-mobile/${ticket.id}`)}>
                        View Mobile UI
                      </Button>
                      {ticket.gpsTrack.length > 0 && (
                        <Badge variant="outline">
                          <Navigation className="h-3 w-3 mr-1" />
                          {ticket.gpsTrack.length} GPS points
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedTickets.map(ticket => {
              const driver = drivers.find(d => d.id === ticket.driverId);
              const exportSite = sites.find(s => s.id === ticket.exportSiteId);
              const importSite = sites.find(s => s.id === ticket.importSiteId);

              return (
                <Card key={ticket.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-lg">{ticket.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {driver?.name} • {ticket.haulerCompany}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Delivered</p>
                        <p className="font-medium">{ticket.deliveredAt && new Date(ticket.deliveredAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Route</p>
                        <p className="font-medium">{exportSite?.name} → {importSite?.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-medium">
                          {ticket.actualVolume || ticket.volume} CY
                          {ticket.actualVolume && ticket.actualVolume !== ticket.volume && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (planned: {ticket.volume})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {(ticket.loadPhotoUrl || ticket.unloadPhotoUrl || ticket.digitalSignature) && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Documentation</p>
                        <div className="flex gap-2">
                          {ticket.loadPhotoUrl && <Badge variant="outline">Load Photo ✓</Badge>}
                          {ticket.unloadPhotoUrl && <Badge variant="outline">Unload Photo ✓</Badge>}
                          {ticket.digitalSignature && <Badge variant="outline">Signature ✓</Badge>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="text-sm text-muted-foreground">
              Showing all {tickets.length} dispatches
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
