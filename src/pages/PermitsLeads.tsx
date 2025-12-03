import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Permit } from '@/types/municipality';
import { Lead, PermitLeadStatus, LeadStatus } from '@/types/lead';
import { Site } from '@/types/site';
import { municipalityStorage } from '@/lib/municipalityStorage';
import { leadStorage } from '@/lib/leadStorage';
import { storage } from '@/lib/storage';
import { PermitDetailsDrawer } from '@/components/PermitDetailsDrawer';
import { LeadFormDialog } from '@/components/LeadFormDialog';
import { CreateJobDialog } from '@/components/CreateJobDialog';
import { format } from 'date-fns';
import { 
  ArrowLeft, FileText, Briefcase, MoreHorizontal, Eye, Plus, 
  ArrowRight, Search, Filter, Building2, CheckCircle2, Clock
} from 'lucide-react';

export default function PermitsLeads() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  
  // Filters
  const [permitSearch, setPermitSearch] = useState('');
  const [permitCityFilter, setPermitCityFilter] = useState('all');
  const [permitTypeFilter, setPermitTypeFilter] = useState('all');
  const [permitStatusFilter, setPermitStatusFilter] = useState('active');
  const [earthworkFilter, setEarthworkFilter] = useState('yes_unknown');
  
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadCityFilter, setLeadCityFilter] = useState('all');
  const [leadOwnerFilter, setLeadOwnerFilter] = useState('all');

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPermits(municipalityStorage.getPermits());
    setLeads(leadStorage.getLeads());
  };

  // Get lead status for a permit
  const getPermitLeadStatus = (permitId: string): PermitLeadStatus => {
    const lead = leads.find(l => l.permitId === permitId);
    if (!lead) return 'not_created';
    if (lead.leadStatus === 'converted_to_job') return 'converted_to_job';
    return 'lead_created';
  };

  // Get unique values for filters
  const uniqueCities = useMemo(() => [...new Set(permits.map(p => p.city))], [permits]);
  const uniqueProjectTypes = useMemo(() => [...new Set(permits.map(p => p.projectType))], [permits]);
  const uniqueLeadCities = useMemo(() => [...new Set(leads.map(l => l.city))], [leads]);
  const uniqueOwners = useMemo(() => [...new Set(leads.map(l => l.leadOwner).filter(Boolean))], [leads]);

  // Filtered permits
  const filteredPermits = useMemo(() => {
    return permits.filter(p => {
      if (permitSearch && !p.projectName.toLowerCase().includes(permitSearch.toLowerCase()) &&
          !p.contractorName.toLowerCase().includes(permitSearch.toLowerCase())) return false;
      if (permitCityFilter !== 'all' && p.city !== permitCityFilter) return false;
      if (permitTypeFilter !== 'all' && p.projectType !== permitTypeFilter) return false;
      if (permitStatusFilter === 'active' && !['Approved', 'Issued', 'Under Review'].includes(p.status)) return false;
      if (earthworkFilter === 'yes_unknown' && p.estimatedEarthworkFlag === 'no') return false;
      if (earthworkFilter === 'yes' && p.estimatedEarthworkFlag !== 'yes') return false;
      return true;
    });
  }, [permits, permitSearch, permitCityFilter, permitTypeFilter, permitStatusFilter, earthworkFilter]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (leadSearch && !l.projectName.toLowerCase().includes(leadSearch.toLowerCase()) &&
          !l.contractorName.toLowerCase().includes(leadSearch.toLowerCase())) return false;
      if (leadStatusFilter !== 'all' && l.leadStatus !== leadStatusFilter) return false;
      if (leadCityFilter !== 'all' && l.city !== leadCityFilter) return false;
      if (leadOwnerFilter !== 'all' && l.leadOwner !== leadOwnerFilter) return false;
      return true;
    });
  }, [leads, leadSearch, leadStatusFilter, leadCityFilter, leadOwnerFilter]);

  const handleViewPermit = (permit: Permit) => {
    setSelectedPermit(permit);
    setSelectedLead(leads.find(l => l.permitId === permit.id));
    setDetailsOpen(true);
  };

  const handleCreateLeadFromPermit = (permit?: Permit) => {
    setSelectedPermit(permit || selectedPermit);
    setEditingLead(undefined);
    setLeadFormOpen(true);
  };

  const handleCreateJobFromPermit = (permit?: Permit) => {
    setSelectedPermit(permit || selectedPermit);
    setSelectedLead(leads.find(l => l.permitId === (permit?.id || selectedPermit?.id)));
    setCreateJobOpen(true);
  };

  const handleCreateJobFromLead = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedPermit(permits.find(p => p.id === lead.permitId) || null);
    setCreateJobOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setLeadFormOpen(true);
  };

  const handleSaveLead = (lead: Lead) => {
    if (editingLead) {
      leadStorage.updateLead(lead.id, lead);
      toast({ title: 'Lead Updated', description: 'Lead has been updated successfully.' });
    } else {
      leadStorage.addLead(lead);
      toast({ title: 'Lead Created', description: 'Lead has been created from permit.' });
    }
    setLeadFormOpen(false);
    setDetailsOpen(false);
    loadData();
  };

  const handleSaveJob = (site: Site, leadId?: string, permitId?: string) => {
    // Add site to storage
    const sites = storage.getSites();
    sites.push(site);
    storage.setSites(sites);

    // Update lead status if exists
    if (leadId) {
      leadStorage.updateLead(leadId, { leadStatus: 'converted_to_job', jobId: site.id });
    }

    toast({ 
      title: 'Job Created', 
      description: `${site.name} has been added to the Job Board.` 
    });

    setCreateJobOpen(false);
    setDetailsOpen(false);
    
    // Navigate to Job Board
    navigate('/sites');
  };

  const handleUpdateLeadStatus = (lead: Lead, status: LeadStatus) => {
    leadStorage.updateLead(lead.id, { leadStatus: status });
    toast({ title: 'Status Updated', description: `Lead status changed to ${status.replace('_', ' ')}.` });
    loadData();
  };

  const getLeadStatusBadge = (status: PermitLeadStatus) => {
    switch (status) {
      case 'converted_to_job':
        return <Badge className="bg-status-approved/20 text-status-approved">Converted to Job</Badge>;
      case 'lead_created':
        return <Badge className="bg-primary/20 text-primary">Lead Created</Badge>;
      default:
        return <Badge variant="secondary">Not Created</Badge>;
    }
  };

  const getLeadStatusBadgeByStatus = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">New</Badge>;
      case 'contacted':
        return <Badge className="bg-primary/20 text-primary">Contacted</Badge>;
      case 'qualified':
        return <Badge className="bg-status-matched/20 text-status-matched">Qualified</Badge>;
      case 'disqualified':
        return <Badge variant="destructive">Disqualified</Badge>;
      case 'converted_to_job':
        return <Badge className="bg-status-approved/20 text-status-approved">Converted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEarthworkBadge = (flag: string) => {
    switch (flag) {
      case 'yes':
        return <Badge className="bg-status-approved/20 text-status-approved text-xs">Yes</Badge>;
      case 'no':
        return <Badge variant="secondary" className="text-xs">No</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card shadow-subtle">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Permits & Leads
                </h1>
                <p className="text-sm text-muted-foreground">Convert permits into qualified sales leads</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/permit-integrations">
                <Button variant="outline">Integrations</Button>
              </Link>
              <Link to="/sites">
                <Button variant="outline">Job Board</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{permits.length}</p>
                <p className="text-sm text-muted-foreground">Total Permits</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-approved/10">
                <Building2 className="h-5 w-5 text-status-approved" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {permits.filter(p => p.estimatedEarthworkFlag === 'yes').length}
                </p>
                <p className="text-sm text-muted-foreground">Earthwork Permits</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Active Leads</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {leads.filter(l => l.leadStatus === 'converted_to_job').length}
                </p>
                <p className="text-sm text-muted-foreground">Converted to Jobs</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="permits" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="permits" className="gap-2">
              <FileText className="h-4 w-4" />
              Permit Inbox ({filteredPermits.length})
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Leads ({filteredLeads.length})
            </TabsTrigger>
          </TabsList>

          {/* PERMIT INBOX TAB */}
          <TabsContent value="permits">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Permit Inbox</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search permits..."
                        value={permitSearch}
                        onChange={(e) => setPermitSearch(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                    <Select value={permitCityFilter} onValueChange={setPermitCityFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {uniqueCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={permitTypeFilter} onValueChange={setPermitTypeFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {uniqueProjectTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={earthworkFilter} onValueChange={setEarthworkFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Earthwork" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes_unknown">Yes / Unknown</SelectItem>
                        <SelectItem value="yes">Yes Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPermits.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No permits found</h3>
                    <p className="text-muted-foreground">Sync permits from municipality integrations to see them here.</p>
                    <Link to="/permit-integrations">
                      <Button className="mt-4">Go to Integrations</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permit ID</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Earthwork</TableHead>
                          <TableHead>Lead Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPermits.map((permit) => {
                          const leadStatus = getPermitLeadStatus(permit.id);
                          return (
                            <TableRow key={permit.id}>
                              <TableCell className="font-mono text-xs">{permit.externalPermitId}</TableCell>
                              <TableCell className="font-medium">{permit.projectName}</TableCell>
                              <TableCell>{permit.projectType}</TableCell>
                              <TableCell className="text-muted-foreground">{permit.city}, {permit.state}</TableCell>
                              <TableCell>{permit.contractorName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{permit.status}</Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {permit.estimatedStartDate 
                                  ? format(new Date(permit.estimatedStartDate), 'MMM d, yyyy')
                                  : '-'}
                              </TableCell>
                              <TableCell>{getEarthworkBadge(permit.estimatedEarthworkFlag)}</TableCell>
                              <TableCell>{getLeadStatusBadge(leadStatus)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-card border">
                                    <DropdownMenuItem onClick={() => handleViewPermit(permit)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {leadStatus === 'not_created' && (
                                      <DropdownMenuItem onClick={() => handleCreateLeadFromPermit(permit)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Lead
                                      </DropdownMenuItem>
                                    )}
                                    {leadStatus !== 'converted_to_job' && (
                                      <DropdownMenuItem onClick={() => handleCreateJobFromPermit(permit)}>
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Create Job
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LEADS TAB */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Sales Leads</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
                        value={leadSearch}
                        onChange={(e) => setLeadSearch(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                    <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="disqualified">Disqualified</SelectItem>
                        <SelectItem value="converted_to_job">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={leadCityFilter} onValueChange={setLeadCityFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {uniqueLeadCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={leadOwnerFilter} onValueChange={setLeadOwnerFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Owners</SelectItem>
                        {uniqueOwners.map(owner => (
                          <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No leads yet</h3>
                    <p className="text-muted-foreground">Create leads from the Permit Inbox to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Permit ID</TableHead>
                          <TableHead>Contractor</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map((lead) => {
                          const permit = permits.find(p => p.id === lead.permitId);
                          return (
                            <TableRow key={lead.id}>
                              <TableCell className="font-medium">{lead.projectName}</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {permit?.externalPermitId || '-'}
                              </TableCell>
                              <TableCell>{lead.contractorName}</TableCell>
                              <TableCell>{lead.city}, {lead.state}</TableCell>
                              <TableCell>{lead.leadOwner || '-'}</TableCell>
                              <TableCell>{getLeadStatusBadgeByStatus(lead.leadStatus)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-card border">
                                    <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View / Edit
                                    </DropdownMenuItem>
                                    {lead.leadStatus !== 'converted_to_job' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleUpdateLeadStatus(lead, 'contacted')}>
                                          <Clock className="h-4 w-4 mr-2" />
                                          Mark Contacted
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateLeadStatus(lead, 'qualified')}>
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          Mark Qualified
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleCreateJobFromLead(lead)}>
                                          <ArrowRight className="h-4 w-4 mr-2" />
                                          Create Job
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <PermitDetailsDrawer
        permit={selectedPermit}
        lead={selectedLead}
        leadStatus={selectedPermit ? getPermitLeadStatus(selectedPermit.id) : 'not_created'}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onCreateLead={() => handleCreateLeadFromPermit()}
        onCreateJob={() => handleCreateJobFromPermit()}
      />

      <LeadFormDialog
        open={leadFormOpen}
        onOpenChange={setLeadFormOpen}
        permit={selectedPermit || undefined}
        existingLead={editingLead}
        onSave={handleSaveLead}
      />

      <CreateJobDialog
        open={createJobOpen}
        onOpenChange={setCreateJobOpen}
        permit={selectedPermit || undefined}
        lead={selectedLead}
        onSave={handleSaveJob}
      />
    </div>
  );
}
