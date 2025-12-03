import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Permit } from '@/types/municipality';
import { Lead, LeadStatus } from '@/types/lead';

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permit?: Permit;
  existingLead?: Lead;
  onSave: (lead: Lead) => void;
}

const SALES_REPS = ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Thompson'];

export function LeadFormDialog({ open, onOpenChange, permit, existingLead, onSave }: LeadFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    projectName: '',
    contractorName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
    address: '',
    description: '',
    leadOwner: '',
    leadStatus: 'new',
    notes: '',
  });

  useEffect(() => {
    if (existingLead) {
      setFormData(existingLead);
    } else if (permit) {
      setFormData({
        projectName: permit.projectName,
        contractorName: permit.contractorName,
        contactEmail: permit.contactEmail,
        contactPhone: permit.contactPhone,
        city: permit.city,
        state: permit.state,
        address: permit.address,
        description: permit.description,
        leadOwner: '',
        leadStatus: 'new',
        notes: '',
      });
    }
  }, [permit, existingLead, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const lead: Lead = {
      id: existingLead?.id || crypto.randomUUID(),
      permitId: existingLead?.permitId || permit?.id || '',
      projectName: formData.projectName || '',
      contractorName: formData.contractorName || '',
      contactEmail: formData.contactEmail || '',
      contactPhone: formData.contactPhone || '',
      city: formData.city || '',
      state: formData.state || '',
      address: formData.address || '',
      description: formData.description || '',
      leadOwner: formData.leadOwner || '',
      leadStatus: formData.leadStatus as LeadStatus || 'new',
      notes: formData.notes || '',
      jobId: existingLead?.jobId,
      createdAt: existingLead?.createdAt || now,
      updatedAt: now,
    };
    onSave(lead);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingLead ? 'Edit Lead' : 'Create Lead from Permit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractorName">Contractor Name</Label>
              <Input
                id="contractorName"
                value={formData.contractorName}
                onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadOwner">Lead Owner (Sales Rep) *</Label>
              <Select
                value={formData.leadOwner}
                onValueChange={(value) => setFormData({ ...formData, leadOwner: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign owner" />
                </SelectTrigger>
                <SelectContent>
                  {SALES_REPS.map((rep) => (
                    <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          {existingLead && (
            <div className="space-y-2">
              <Label htmlFor="leadStatus">Lead Status</Label>
              <Select
                value={formData.leadStatus}
                onValueChange={(value: LeadStatus) => setFormData({ ...formData, leadStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="disqualified">Disqualified</SelectItem>
                  <SelectItem value="converted_to_job">Converted to Job</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {existingLead ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
