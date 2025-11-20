import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, MapPin, CheckCircle, Navigation, AlertTriangle, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { storage } from '@/lib/storage';
import { DispatchTicket, DispatchStatus } from '@/types/dispatch';
import { Site } from '@/types/site';

export default function DriverMobile() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<DispatchTicket | null>(null);
  const [exportSite, setExportSite] = useState<Site | null>(null);
  const [importSite, setImportSite] = useState<Site | null>(null);
  const [actualVolume, setActualVolume] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = () => {
    const tickets = dispatchStorage.getDispatchTickets();
    const found = tickets.find(t => t.id === ticketId);
    if (found) {
      setTicket(found);
      const sites = storage.getSites();
      setExportSite(sites.find(s => s.id === found.exportSiteId) || null);
      setImportSite(sites.find(s => s.id === found.importSiteId) || null);
      setActualVolume(found.actualVolume?.toString() || found.volume.toString());
    }
  };

  const updateTicketStatus = (newStatus: DispatchStatus, additionalData?: Partial<DispatchTicket>) => {
    if (!ticket) return;

    const tickets = dispatchStorage.getDispatchTickets();
    const updatedTickets = tickets.map(t => {
      if (t.id === ticket.id) {
        const now = new Date().toISOString();
        let statusTimestamp = {};
        
        switch (newStatus) {
          case 'accepted':
            statusTimestamp = { acceptedAt: now };
            break;
          case 'en-route-pickup':
            statusTimestamp = { startedAt: now };
            break;
          case 'loading':
            statusTimestamp = { loadedAt: now };
            break;
          case 'delivered':
            statusTimestamp = { deliveredAt: now };
            break;
        }

        // Simulate GPS tracking
        const newGPSPoint = {
          lat: exportSite ? exportSite.coordinates.lat + (Math.random() - 0.5) * 0.01 : 0,
          lng: exportSite ? exportSite.coordinates.lng + (Math.random() - 0.5) * 0.01 : 0,
          timestamp: now
        };

        return {
          ...t,
          status: newStatus,
          ...statusTimestamp,
          ...additionalData,
          gpsTrack: [...t.gpsTrack, newGPSPoint]
        };
      }
      return t;
    });

    dispatchStorage.setDispatchTickets(updatedTickets);
    loadTicket();
  };

  const handleAccept = () => {
    updateTicketStatus('accepted');
    toast({
      title: "Dispatch Accepted",
      description: "You can now navigate to pickup location",
    });
  };

  const handleStartNavigation = () => {
    updateTicketStatus('en-route-pickup');
    toast({
      title: "Navigation Started",
      description: "GPS tracking is now active",
    });
  };

  const handleArrivePickup = () => {
    updateTicketStatus('loading');
    toast({
      title: "Arrived at Pickup",
      description: "Ready to load material",
    });
  };

  const handleLoadPhoto = () => {
    // Simulate photo upload
    updateTicketStatus('en-route-delivery', {
      loadPhotoUrl: `https://placeholder.com/load-${ticket?.id}.jpg`
    });
    toast({
      title: "Load Photo Captured",
      description: "Proceeding to delivery location",
    });
  };

  const handleUnloadPhoto = () => {
    // Simulate photo upload
    const tickets = dispatchStorage.getDispatchTickets();
    const updatedTickets = tickets.map(t => 
      t.id === ticket?.id 
        ? { ...t, unloadPhotoUrl: `https://placeholder.com/unload-${ticket?.id}.jpg`, status: 'unloading' as const }
        : t
    );
    dispatchStorage.setDispatchTickets(updatedTickets);
    loadTicket();
    toast({
      title: "Unload Photo Captured",
      description: "Ready to confirm delivery",
    });
  };

  const handleComplete = () => {
    if (!actualVolume) {
      toast({
        title: "Missing Information",
        description: "Please confirm the actual volume delivered",
        variant: "destructive"
      });
      return;
    }

    updateTicketStatus('delivered', {
      actualVolume: parseFloat(actualVolume),
      digitalSignature: `signature-${Date.now()}`
    });

    // Update driver status back to available
    const drivers = dispatchStorage.getDrivers();
    const updatedDrivers = drivers.map(d => 
      d.id === ticket?.driverId ? { ...d, status: 'available' as const } : d
    );
    dispatchStorage.setDrivers(updatedDrivers);

    toast({
      title: "Delivery Completed",
      description: "Digital ticket has been generated",
    });

    setTimeout(() => navigate('/dispatches'), 2000);
  };

  const handleReportIssue = () => {
    if (!issueDescription || !ticket) return;

    const newIssue = {
      id: `issue-${Date.now()}`,
      type: 'other' as const,
      description: issueDescription,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    const tickets = dispatchStorage.getDispatchTickets();
    const updatedTickets = tickets.map(t => 
      t.id === ticket.id 
        ? { ...t, issues: [...t.issues, newIssue] }
        : t
    );
    dispatchStorage.setDispatchTickets(updatedTickets);
    loadTicket();
    setIssueDescription('');

    toast({
      title: "Issue Reported",
      description: "Dispatch team has been notified",
    });
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dispatch...</p>
      </div>
    );
  }

  const getStatusStep = () => {
    const steps = ['pending', 'accepted', 'en-route-pickup', 'loading', 'en-route-delivery', 'unloading', 'delivered'];
    return steps.indexOf(ticket.status);
  };

  const currentStep = getStatusStep();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{ticket.id}</h1>
            <p className="text-sm opacity-90">{ticket.haulerCompany}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {ticket.status}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Progress Steps */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Accept Dispatch</span>
              </div>
              <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <Navigation className="h-5 w-5" />
                <span className="font-medium">Navigate to Pickup</span>
              </div>
              <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <Camera className="h-5 w-5" />
                <span className="font-medium">Load Material</span>
              </div>
              <div className={`flex items-center gap-3 ${currentStep >= 4 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <Navigation className="h-5 w-5" />
                <span className="font-medium">Deliver to Site</span>
              </div>
              <div className={`flex items-center gap-3 ${currentStep >= 5 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <Camera className="h-5 w-5" />
                <span className="font-medium">Unload & Confirm</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Pickup Location</p>
                <p className="text-sm text-muted-foreground">{exportSite?.name}</p>
                <p className="text-xs text-muted-foreground">{exportSite?.location}</p>
              </div>
              {ticket.status === 'accepted' && (
                <Button size="sm" onClick={handleStartNavigation}>
                  Navigate
                </Button>
              )}
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Delivery Location</p>
                <p className="text-sm text-muted-foreground">{importSite?.name}</p>
                <p className="text-xs text-muted-foreground">{importSite?.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Load Details */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Planned Volume</p>
                <p className="text-lg font-semibold">{ticket.volume} CY</p>
              </div>
              {ticket.status === 'unloading' && (
                <div>
                  <Label className="text-sm">Actual Volume</Label>
                  <Input 
                    type="number"
                    value={actualVolume}
                    onChange={(e) => setActualVolume(e.target.value)}
                    placeholder="Enter actual"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          {ticket.status === 'pending' && (
            <Button onClick={handleAccept} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Accept Dispatch
            </Button>
          )}

          {ticket.status === 'en-route-pickup' && (
            <Button onClick={handleArrivePickup} className="w-full" size="lg">
              <MapPin className="mr-2 h-5 w-5" />
              Arrived at Pickup
            </Button>
          )}

          {ticket.status === 'loading' && !ticket.loadPhotoUrl && (
            <Button onClick={handleLoadPhoto} className="w-full" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Capture Load Photo
            </Button>
          )}

          {ticket.status === 'en-route-delivery' && !ticket.unloadPhotoUrl && (
            <Button onClick={handleUnloadPhoto} className="w-full" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Capture Unload Photo
            </Button>
          )}

          {ticket.status === 'unloading' && ticket.unloadPhotoUrl && (
            <Button onClick={handleComplete} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Complete Delivery
            </Button>
          )}
        </div>

        {/* Report Issue */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold">Report Issue</h3>
            </div>
            <Textarea 
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the issue (delay, breakdown, site closed, etc.)"
              rows={3}
            />
            <Button 
              onClick={handleReportIssue} 
              variant="outline" 
              className="w-full"
              disabled={!issueDescription}
            >
              Submit Issue Report
            </Button>
          </CardContent>
        </Card>

        {/* Existing Issues */}
        {ticket.issues.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">Reported Issues</h3>
              {ticket.issues.map(issue => (
                <div key={issue.id} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <p className="font-medium">{issue.type}</p>
                  <p className="text-muted-foreground">{issue.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(issue.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* GPS Tracking Info */}
        {ticket.gpsTrack.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">GPS Tracking Active</span>
                <Badge variant="outline">
                  <Navigation className="h-3 w-3 mr-1" />
                  {ticket.gpsTrack.length} points
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Button 
          variant="outline" 
          onClick={() => navigate('/dispatches')}
          className="w-full"
        >
          Back to Dispatches
        </Button>
      </div>
    </div>
  );
}
