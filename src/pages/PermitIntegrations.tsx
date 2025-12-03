import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { MunicipalityIntegration } from '@/types/municipality';
import { municipalityStorage, testConnection, runSync } from '@/lib/municipalityStorage';
import { IntegrationForm } from '@/components/IntegrationForm';
import { SyncHistoryDialog } from '@/components/SyncHistoryDialog';
import { format } from 'date-fns';
import { 
  Plus, MoreHorizontal, Pencil, Play, RefreshCw, Power, History, 
  CheckCircle2, XCircle, AlertCircle, Loader2, ArrowLeft, Building2, Settings
} from 'lucide-react';

export default function PermitIntegrations() {
  const [integrations, setIntegrations] = useState<MunicipalityIntegration[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<MunicipalityIntegration | undefined>();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; integrationId: string; name: string }>({ 
    open: false, integrationId: '', name: '' 
  });
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    setIntegrations(municipalityStorage.getIntegrations());
  };

  const handleSave = (integration: MunicipalityIntegration) => {
    if (editingIntegration) {
      municipalityStorage.updateIntegration(integration.id, integration);
      toast({ title: 'Integration updated', description: `${integration.city}, ${integration.state} configuration saved.` });
    } else {
      municipalityStorage.addIntegration(integration);
      toast({ title: 'Integration created', description: `${integration.city}, ${integration.state} added successfully.` });
    }
    loadIntegrations();
    setShowForm(false);
    setEditingIntegration(undefined);
  };

  const handleEdit = (integration: MunicipalityIntegration) => {
    setEditingIntegration(integration);
    setShowForm(true);
  };

  const handleTestConnection = async (integration: MunicipalityIntegration) => {
    setTestingId(integration.id);
    const result = await testConnection(integration);
    setTestingId(null);
    
    if (result.success) {
      toast({ title: 'Connection Successful', description: result.message });
      municipalityStorage.updateIntegration(integration.id, { status: 'active' });
    } else {
      toast({ title: 'Connection Failed', description: result.message, variant: 'destructive' });
      municipalityStorage.updateIntegration(integration.id, { status: 'error' });
    }
    loadIntegrations();
  };

  const handleRunSync = async (integration: MunicipalityIntegration) => {
    setSyncingId(integration.id);
    const result = await runSync(integration);
    setSyncingId(null);
    
    toast({
      title: result.status === 'success' ? 'Sync Completed' : 'Sync Completed with Issues',
      description: `${result.permitsCreated} permits created, ${result.permitsUpdated} updated${result.errors ? '. Some errors occurred.' : ''}`,
      variant: result.status === 'success' ? 'default' : 'destructive',
    });
    loadIntegrations();
  };

  const handleToggleActive = (integration: MunicipalityIntegration) => {
    const newStatus = integration.isActive ? 'inactive' : 'active';
    municipalityStorage.updateIntegration(integration.id, { 
      isActive: !integration.isActive, 
      status: newStatus 
    });
    toast({ 
      title: integration.isActive ? 'Integration Deactivated' : 'Integration Activated',
      description: `${integration.city}, ${integration.state} is now ${newStatus}.`
    });
    loadIntegrations();
  };

  const handleViewHistory = (integration: MunicipalityIntegration) => {
    setHistoryDialog({ open: true, integrationId: integration.id, name: `${integration.city}, ${integration.state}` });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-status-approved/20 text-status-approved border-status-approved/30"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><Power className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  const getAuthTypeBadge = (authType: string) => {
    switch (authType) {
      case 'api_key':
        return <Badge variant="outline">API Key</Badge>;
      case 'oauth':
        return <Badge variant="outline">OAuth</Badge>;
      default:
        return <Badge variant="secondary">None</Badge>;
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
                  <Building2 className="h-6 w-6 text-primary" />
                  Permit Integrations
                </h1>
                <p className="text-sm text-muted-foreground">Manage municipal API connections for permit imports</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to="/operations">
                <Button variant="outline">Operations</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Navigation */}
        <aside className="w-64 min-h-[calc(100vh-73px)] border-r bg-card p-4">
          <nav className="space-y-2">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin Settings
            </div>
            <Button variant="secondary" className="w-full justify-start gap-2">
              <Building2 className="h-4 w-4" />
              Permit Integrations
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
              System Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {showForm ? (
            <IntegrationForm
              integration={editingIntegration}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingIntegration(undefined); }}
            />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Municipality Integrations</CardTitle>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Integration
                </Button>
              </CardHeader>
              <CardContent>
                {integrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No integrations configured</h3>
                    <p className="text-muted-foreground mb-4">Add your first municipal API integration to start importing permits.</p>
                    <Button onClick={() => setShowForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Integration
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>API URL</TableHead>
                        <TableHead>Auth</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sync</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrations.map((integration) => (
                        <TableRow key={integration.id}>
                          <TableCell className="font-medium">{integration.city}</TableCell>
                          <TableCell>{integration.state}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                            {integration.apiBaseUrl}
                          </TableCell>
                          <TableCell>{getAuthTypeBadge(integration.authType)}</TableCell>
                          <TableCell className="capitalize">{integration.syncFrequency}</TableCell>
                          <TableCell>{getStatusBadge(integration.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {integration.lastSyncTime ? (
                              <div>
                                <div>{format(new Date(integration.lastSyncTime), 'MMM d, h:mm a')}</div>
                                <div className="text-xs">{integration.lastSyncResult}</div>
                              </div>
                            ) : (
                              'Never'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border">
                                <DropdownMenuItem onClick={() => handleEdit(integration)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Configuration
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleTestConnection(integration)}
                                  disabled={testingId === integration.id}
                                >
                                  {testingId === integration.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                  )}
                                  Test Connection
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleRunSync(integration)}
                                  disabled={syncingId === integration.id || !integration.isActive}
                                >
                                  {syncingId === integration.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                  )}
                                  Run Manual Sync
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewHistory(integration)}>
                                  <History className="h-4 w-4 mr-2" />
                                  View Sync History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(integration)}>
                                  <Power className="h-4 w-4 mr-2" />
                                  {integration.isActive ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <SyncHistoryDialog
        open={historyDialog.open}
        onOpenChange={(open) => setHistoryDialog({ ...historyDialog, open })}
        history={municipalityStorage.getSyncHistoryByMunicipality(historyDialog.integrationId)}
        integrationName={historyDialog.name}
      />
    </div>
  );
}
