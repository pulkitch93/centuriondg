import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Permit } from '@/types/municipality';
import { Lead, PermitLeadStatus } from '@/types/lead';
import { format } from 'date-fns';
import { MapPin, Building2, User, Mail, Phone, Calendar, FileText, Briefcase, ArrowRight } from 'lucide-react';

interface PermitDetailsDrawerProps {
  permit: Permit | null;
  lead?: Lead;
  leadStatus: PermitLeadStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLead: () => void;
  onCreateJob: () => void;
}

export function PermitDetailsDrawer({ 
  permit, 
  lead, 
  leadStatus, 
  open, 
  onOpenChange, 
  onCreateLead, 
  onCreateJob 
}: PermitDetailsDrawerProps) {
  if (!permit) return null;

  const getEarthworkBadge = (flag: string) => {
    switch (flag) {
      case 'yes':
        return <Badge className="bg-status-approved/20 text-status-approved">Earthwork Required</Badge>;
      case 'no':
        return <Badge variant="secondary">No Earthwork</Badge>;
      default:
        return <Badge variant="outline">Earthwork Unknown</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Permit Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header Info */}
          <div>
            <h3 className="text-xl font-semibold text-foreground">{permit.projectName}</h3>
            <p className="text-sm text-muted-foreground mt-1">ID: {permit.externalPermitId}</p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{permit.projectType}</Badge>
            <Badge className="bg-primary/20 text-primary">{permit.status}</Badge>
            {getEarthworkBadge(permit.estimatedEarthworkFlag)}
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </h4>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-foreground">{permit.address}</p>
              <p className="text-muted-foreground">{permit.city}, {permit.state} {permit.zip}</p>
            </div>
            {/* Map placeholder */}
            <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center border">
              <p className="text-muted-foreground text-sm">Map preview</p>
            </div>
          </div>

          <Separator />

          {/* Contractor Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Contractor
            </h4>
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{permit.contractorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{permit.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{permit.contactPhone}</span>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Project Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Project Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Est. Start Date</p>
                <p className="text-foreground">
                  {permit.estimatedStartDate 
                    ? format(new Date(permit.estimatedStartDate), 'MMM d, yyyy')
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Synced</p>
                <p className="text-foreground">{format(new Date(permit.syncedAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-foreground text-sm">{permit.description}</p>
            </div>
          </div>

          <Separator />

          {/* Linked Lead */}
          {lead && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Linked Lead
                </h4>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{lead.projectName}</p>
                      <p className="text-sm text-muted-foreground">Owner: {lead.leadOwner}</p>
                    </div>
                    <Badge className={
                      lead.leadStatus === 'converted_to_job' 
                        ? 'bg-status-approved/20 text-status-approved'
                        : lead.leadStatus === 'qualified'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }>
                      {lead.leadStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  {lead.jobId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Converted to Job: {lead.jobId}
                    </p>
                  )}
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            {leadStatus === 'not_created' && (
              <Button onClick={onCreateLead} className="w-full gap-2">
                <Briefcase className="h-4 w-4" />
                Create Lead from this Permit
              </Button>
            )}
            {leadStatus !== 'converted_to_job' && (
              <Button onClick={onCreateJob} variant="outline" className="w-full gap-2">
                <ArrowRight className="h-4 w-4" />
                Create Job on Job Board
              </Button>
            )}
            {leadStatus === 'converted_to_job' && (
              <p className="text-center text-sm text-muted-foreground">
                This permit has been converted to a job.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
