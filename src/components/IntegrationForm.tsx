import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MunicipalityIntegration, AuthType, SyncFrequency } from '@/types/municipality';
import { X } from 'lucide-react';

interface IntegrationFormProps {
  integration?: MunicipalityIntegration;
  onSave: (integration: MunicipalityIntegration) => void;
  onCancel: () => void;
}

export function IntegrationForm({ integration, onSave, onCancel }: IntegrationFormProps) {
  const [formData, setFormData] = useState<Partial<MunicipalityIntegration>>({
    city: '',
    state: '',
    apiBaseUrl: '',
    authType: 'none',
    apiKey: '',
    clientId: '',
    clientSecret: '',
    endpointPath: '',
    syncFrequency: 'daily',
    isActive: true,
  });

  useEffect(() => {
    if (integration) {
      setFormData(integration);
    }
  }, [integration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const newIntegration: MunicipalityIntegration = {
      id: integration?.id || crypto.randomUUID(),
      city: formData.city || '',
      state: formData.state || '',
      apiBaseUrl: formData.apiBaseUrl || '',
      authType: formData.authType || 'none',
      apiKey: formData.apiKey,
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      endpointPath: formData.endpointPath,
      syncFrequency: formData.syncFrequency || 'daily',
      status: formData.isActive ? 'active' : 'inactive',
      isActive: formData.isActive ?? true,
      createdAt: integration?.createdAt || now,
      updatedAt: now,
    };
    onSave(newIntegration);
  };

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{integration ? 'Edit Integration' : 'Create Integration'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Austin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiBaseUrl">API Base URL *</Label>
            <Input
              id="apiBaseUrl"
              value={formData.apiBaseUrl}
              onChange={(e) => setFormData({ ...formData, apiBaseUrl: e.target.value })}
              placeholder="https://api.city.gov/permits"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpointPath">Endpoint Path (optional)</Label>
            <Input
              id="endpointPath"
              value={formData.endpointPath}
              onChange={(e) => setFormData({ ...formData, endpointPath: e.target.value })}
              placeholder="/v1/construction-permits"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authType">Auth Type *</Label>
              <Select
                value={formData.authType}
                onValueChange={(value: AuthType) => setFormData({ ...formData, authType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth">OAuth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="syncFrequency">Sync Frequency *</Label>
              <Select
                value={formData.syncFrequency}
                onValueChange={(value: SyncFrequency) => setFormData({ ...formData, syncFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.authType === 'api_key' && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter API key"
              />
            </div>
          )}

          {formData.authType === 'oauth' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID *</Label>
                <Input
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  placeholder="Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret *</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  placeholder="Client Secret"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {integration ? 'Update' : 'Create'} Integration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
