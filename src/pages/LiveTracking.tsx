import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation, Clock, MapPin, Truck, AlertCircle } from 'lucide-react';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { storage } from '@/lib/storage';
import { DispatchTicket, Driver } from '@/types/dispatch';
import { Site } from '@/types/site';

export default function LiveTracking() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [tickets, setTickets] = useState<DispatchTicket[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(
    localStorage.getItem('mapbox_token') || ''
  );
  const [showTokenInput, setShowTokenInput] = useState(!localStorage.getItem('mapbox_token'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allTickets = dispatchStorage.getDispatchTickets();
    const activeTickets = allTickets.filter(t => 
      !['delivered', 'cancelled'].includes(t.status)
    );
    setTickets(activeTickets);
    setDrivers(dispatchStorage.getDrivers());
    setSites(storage.getSites());
  };

  useEffect(() => {
    if (!mapContainer.current || tickets.length === 0 || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-80.8431, 35.2271], // Charlotte, NC
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Initialize markers for active trucks
    tickets.forEach(ticket => {
      const driver = drivers.find(d => d.id === ticket.driverId);
      const exportSite = sites.find(s => s.id === ticket.exportSiteId);
      const importSite = sites.find(s => s.id === ticket.importSiteId);

      if (exportSite) {
        // Add pickup location marker
        const pickupMarker = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([exportSite.coordinates.lng, exportSite.coordinates.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">Pickup</h3>
              <p class="text-sm">${exportSite.name}</p>
            </div>
          `))
          .addTo(map.current!);
      }

      if (importSite) {
        // Add delivery location marker
        const deliveryMarker = new mapboxgl.Marker({ color: '#22c55e' })
          .setLngLat([importSite.coordinates.lng, importSite.coordinates.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">Delivery</h3>
              <p class="text-sm">${importSite.name}</p>
            </div>
          `))
          .addTo(map.current!);
      }

      // Add truck marker with initial position
      const initialLat = exportSite ? exportSite.coordinates.lat : 35.2271;
      const initialLng = exportSite ? exportSite.coordinates.lng : -80.8431;

      const truckEl = document.createElement('div');
      truckEl.className = 'truck-marker';
      truckEl.innerHTML = `
        <div class="bg-primary text-primary-foreground rounded-full p-2 shadow-lg border-2 border-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
            <path d="M15 18H9"></path>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
            <circle cx="17" cy="18" r="2"></circle>
            <circle cx="7" cy="18" r="2"></circle>
          </svg>
        </div>
      `;

      const truckMarker = new mapboxgl.Marker({ element: truckEl })
        .setLngLat([initialLng, initialLat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-3">
            <h3 class="font-semibold">${ticket.id}</h3>
            <p class="text-sm">${driver?.name || 'Driver'}</p>
            <p class="text-xs text-muted-foreground">${ticket.status}</p>
            <p class="text-xs font-medium mt-1">ETA: ${ticket.eta || 'Calculating...'}</p>
          </div>
        `))
        .addTo(map.current!);

      markers.current.set(ticket.id, truckMarker);
    });

    return () => {
      map.current?.remove();
      markers.current.clear();
    };
  }, [tickets, drivers, sites]);

  // Simulate GPS updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets(prevTickets => {
        const updatedTickets = prevTickets.map(ticket => {
          const exportSite = sites.find(s => s.id === ticket.exportSiteId);
          const importSite = sites.find(s => s.id === ticket.importSiteId);

          if (!exportSite || !importSite) return ticket;

          // Simulate movement towards destination
          const progress = ticket.gpsTrack.length * 0.05;
          const lat = exportSite.coordinates.lat + 
            (importSite.coordinates.lat - exportSite.coordinates.lat) * Math.min(progress, 1);
          const lng = exportSite.coordinates.lng + 
            (importSite.coordinates.lng - exportSite.coordinates.lng) * Math.min(progress, 1);

          const newGPSPoint = {
            lat,
            lng,
            timestamp: new Date().toISOString()
          };

          // Update marker position
          const marker = markers.current.get(ticket.id);
          if (marker) {
            marker.setLngLat([lng, lat]);
          }

          return {
            ...ticket,
            gpsTrack: [...ticket.gpsTrack, newGPSPoint]
          };
        });

        // Save to storage
        const allTickets = dispatchStorage.getDispatchTickets();
        const updatedAll = allTickets.map(t => {
          const updated = updatedTickets.find(ut => ut.id === t.id);
          return updated || t;
        });
        dispatchStorage.setDispatchTickets(updatedAll);

        return updatedTickets;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [sites]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en-route-delivery':
      case 'en-route-pickup':
        return 'bg-blue-500';
      case 'loading':
      case 'unloading':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const focusOnTicket = (ticket: DispatchTicket) => {
    setSelectedTicket(ticket.id);
    if (ticket.gpsTrack.length > 0) {
      const lastPosition = ticket.gpsTrack[ticket.gpsTrack.length - 1];
      map.current?.flyTo({
        center: [lastPosition.lng, lastPosition.lat],
        zoom: 14,
        duration: 1500
      });
    }
  };

  const handleSaveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
      window.location.reload(); // Reload to initialize map with token
    }
  };

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
                To use live GPS tracking, you need a Mapbox public token. Get yours for free at{' '}
                <a 
                  href="https://account.mapbox.com/access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  mapbox.com
                </a>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mapbox Public Token</label>
                <input
                  type="text"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  placeholder="pk.eyJ1..."
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveToken} className="flex-1">
                  Save Token
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dispatches')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card border-b p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Live GPS Tracking</h1>
              <p className="text-sm text-muted-foreground">Real-time truck locations and ETAs</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {tickets.length} Active
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('mapbox_token');
                  setShowTokenInput(true);
                }}
              >
                Change Token
              </Button>
              <Button variant="outline" onClick={() => navigate('/dispatches')}>
                Back to Dispatches
              </Button>
            </div>
          </div>
        </div>

        {/* Map and Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapContainer} className="absolute inset-0" />
            
            {/* Legend */}
            <Card className="absolute top-4 left-4 w-48">
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span>Active Truck</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span>Pickup Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Delivery Location</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-card border-l overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Active Trucks ({tickets.length})</h2>
              <div className="space-y-3">
                {tickets.map(ticket => {
                  const driver = drivers.find(d => d.id === ticket.driverId);
                  const exportSite = sites.find(s => s.id === ticket.exportSiteId);
                  const importSite = sites.find(s => s.id === ticket.importSiteId);
                  const isSelected = selectedTicket === ticket.id;

                  return (
                    <Card 
                      key={ticket.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => focusOnTicket(ticket)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{ticket.id}</p>
                            <p className="text-xs text-muted-foreground">{driver?.name}</p>
                          </div>
                          <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                            {ticket.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground line-clamp-1">
                              {exportSite?.name}
                            </span>
                          </div>
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground line-clamp-1">
                              {importSite?.name}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>ETA: {ticket.eta || 'Calculating...'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Navigation className="h-3 w-3" />
                            <span>{ticket.gpsTrack.length} updates</span>
                          </div>
                        </div>

                        {ticket.issues.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center gap-1 text-xs text-yellow-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>{ticket.issues.length} issue(s)</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {tickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No active trucks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
