import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Permit } from '@/types/municipality';
import { Lead } from '@/types/lead';
import { Site, SiteType, SoilType } from '@/types/site';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permit?: Permit;
  lead?: Lead;
  onSave: (site: Site, leadId?: string, permitId?: string) => void;
}

export function CreateJobDialog({ open, onOpenChange, permit, lead, onSave }: CreateJobDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    state: '',
    projectOwner: '',
    estimatedStartDate: '',
    volume: 5000,
    soilType: 'mixed' as SoilType,
    siteType: 'export' as SiteType,
    notes: '',
  });

  useEffect(() => {
    if (permit || lead) {
      const source = lead || permit;
      if (source) {
        const notes = [];
        if (permit) notes.push(`Permit ID: ${permit.externalPermitId}`);
        if (lead) notes.push(`Lead ID: ${lead.id}`);
        if (permit?.description) notes.push(`Description: ${permit.description}`);
        
        setFormData({
          name: source.projectName || '',
          location: source.address || '',
          city: source.city || '',
          state: source.state || '',
          projectOwner: source.contractorName || '',
          estimatedStartDate: permit?.estimatedStartDate || '',
          volume: 5000,
          soilType: 'mixed',
          siteType: 'export',
          notes: notes.join('\n'),
        });
      }
    }
  }, [permit, lead, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const site: Site = {
      id: crypto.randomUUID(),
      type: formData.siteType,
      name: formData.name,
      location: `${formData.location}, ${formData.city}, ${formData.state}`,
      coordinates: {
        lat: 30.2672 + (Math.random() - 0.5) * 0.1, // Austin area default
        lng: -97.7431 + (Math.random() - 0.5) * 0.1,
      },
      soilType: formData.soilType,
      volume: formData.volume,
      scheduleStart: formData.estimatedStartDate || now,
      scheduleEnd: endDate.toISOString(),
      contaminated: false,
      projectOwner: formData.projectOwner,
      status: 'pending',
      createdAt: now,
    };

    onSave(site, lead?.id, permit?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job on Job Board</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Job Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteType">Site Type *</Label>
              <Select
                value={formData.siteType}
                onValueChange={(value: SiteType) => setFormData({ ...formData, siteType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Export (Dig/Remove)</SelectItem>
                  <SelectItem value="import">Import (Fill/Receive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type</Label>
              <Select
                value={formData.soilType}
                onValueChange={(value: SoilType) => setFormData({ ...formData, soilType: value })}
              >
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Address</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectOwner">Customer / Contractor</Label>
              <Input
                id="projectOwner"
                value={formData.projectOwner}
                onChange={(e) => setFormData({ ...formData, projectOwner: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Est. Volume (yd³)</Label>
              <Input
                id="volume"
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedStartDate">Estimated Start Date</Label>
            <Input
              id="estimatedStartDate"
              type="date"
              value={formData.estimatedStartDate}
              onChange={(e) => setFormData({ ...formData, estimatedStartDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (includes permit/lead references)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
