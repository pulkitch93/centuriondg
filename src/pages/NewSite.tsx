import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { storage } from '@/lib/storage';
import { Site, SiteType, SoilType } from '@/types/site';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';

export default function NewSite() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: 'export' as SiteType,
    name: '',
    location: '',
    lat: '',
    lng: '',
    soilType: 'clay' as SoilType,
    volume: '',
    scheduleStart: '',
    scheduleEnd: '',
    contaminated: false,
    priceExpectation: '',
    projectOwner: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSite: Site = {
      id: `site-${Date.now()}`,
      type: formData.type,
      name: formData.name,
      location: formData.location,
      coordinates: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      },
      soilType: formData.soilType,
      volume: parseInt(formData.volume),
      scheduleStart: formData.scheduleStart,
      scheduleEnd: formData.scheduleEnd,
      contaminated: formData.contaminated,
      priceExpectation: formData.priceExpectation ? parseFloat(formData.priceExpectation) : undefined,
      projectOwner: formData.projectOwner,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const sites = storage.getSites();
    storage.setSites([...sites, newSite]);

    toast({
      title: "Site created",
      description: `${formData.name} has been added to the job board.`,
    });

    navigate('/sites');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <PageHeader 
            title="Create New Site" 
            description="Add an export or import site"
          />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="p-8 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Site Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as SiteType})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Export (Excess Soil)</SelectItem>
                  <SelectItem value="import">Import (Fill Needed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Site Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Downtown Excavation Project"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location Address</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="123 Main St, City, State"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  placeholder="40.7128"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: e.target.value})}
                  placeholder="-74.0060"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Select value={formData.soilType} onValueChange={(value) => setFormData({...formData, soilType: value as SoilType})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="sand">Sand</SelectItem>
                    <SelectItem value="loam">Loam</SelectItem>
                    <SelectItem value="gravel">Gravel</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Volume (cubic yards)</Label>
                <Input
                  id="volume"
                  type="number"
                  value={formData.volume}
                  onChange={(e) => setFormData({...formData, volume: e.target.value})}
                  placeholder="5000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduleStart">Schedule Start</Label>
                <Input
                  id="scheduleStart"
                  type="date"
                  value={formData.scheduleStart}
                  onChange={(e) => setFormData({...formData, scheduleStart: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduleEnd">Schedule End</Label>
                <Input
                  id="scheduleEnd"
                  type="date"
                  value={formData.scheduleEnd}
                  onChange={(e) => setFormData({...formData, scheduleEnd: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectOwner">Project Owner</Label>
              <Input
                id="projectOwner"
                value={formData.projectOwner}
                onChange={(e) => setFormData({...formData, projectOwner: e.target.value})}
                placeholder="Company or contact name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceExpectation">Price Expectation ($/yd³) - Optional</Label>
              <Input
                id="priceExpectation"
                type="number"
                step="0.01"
                value={formData.priceExpectation}
                onChange={(e) => setFormData({...formData, priceExpectation: e.target.value})}
                placeholder="15.00"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="contaminated"
                checked={formData.contaminated}
                onCheckedChange={(checked) => setFormData({...formData, contaminated: checked})}
              />
              <Label htmlFor="contaminated" className="cursor-pointer">
                Contaminated soil (if applicable)
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark">
                Create Site
              </Button>
              <Link to="/sites" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
