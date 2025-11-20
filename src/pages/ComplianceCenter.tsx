import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AIBadge } from '@/components/ui/ai-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download,
  Eye,
  Shield,
  TrendingUp,
  AlertCircle,
  FileCheck,
  XCircle,
  Search,
  Filter,
  Sparkles,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { complianceStorage } from '@/lib/complianceStorage';
import { initializeComplianceData } from '@/lib/initComplianceData';
import { simulateOCR, extractTextFromFile } from '@/lib/ocrSimulator';
import { ComplianceDocument, ComplianceAlert, ComplianceSummary, DocumentType } from '@/types/compliance';
import { toast } from '@/hooks/use-toast';

const ComplianceCenter = () => {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ComplianceDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    initializeComplianceData();
    loadData();
  }, []);

  const loadData = () => {
    setDocuments(complianceStorage.getDocuments());
    setAlerts(complianceStorage.getAlerts());
  };

  const getSummary = (): ComplianceSummary => {
    const totalDocuments = documents.length;
    const validDocuments = documents.filter(d => d.status === 'valid').length;
    const expiringSoon = documents.filter(d => d.status === 'expiring-soon').length;
    const expired = documents.filter(d => d.status === 'expired').length;
    const pendingReview = documents.filter(d => d.status === 'pending-review').length;
    
    const activeAlerts = alerts.filter(a => !a.acknowledged).length;
    const criticalAlerts = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalAlerts > 0 || expired > 2) riskLevel = 'critical';
    else if (expiringSoon > 3 || expired > 0) riskLevel = 'high';
    else if (expiringSoon > 1 || pendingReview > 2) riskLevel = 'medium';

    return {
      totalDocuments,
      validDocuments,
      expiringSoon,
      expired,
      pendingReview,
      riskLevel,
      activeAlerts,
      criticalAlerts
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: DocumentType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      const ocrResult = simulateOCR(file.name, documentType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create document with OCR data
      const newDocument: ComplianceDocument = {
        id: `DOC-${Date.now()}`,
        type: documentType,
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
        permitNumber: ocrResult.permitNumber,
        issueDate: ocrResult.issueDate,
        expirationDate: ocrResult.expirationDate,
        requiredAction: ocrResult.requiredAction,
        authority: ocrResult.authority,
        status: determineStatus(ocrResult.expirationDate),
        auditTrail: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Document Uploaded',
            performedBy: 'Current User',
            details: `Uploaded via compliance portal. OCR confidence: ${(ocrResult.confidence * 100).toFixed(0)}%`
          }
        ],
        signatures: []
      };

      complianceStorage.addDocument(newDocument);
      loadData();

      toast({
        title: 'Document Uploaded Successfully',
        description: `OCR extracted data with ${(ocrResult.confidence * 100).toFixed(0)}% confidence.`
      });

    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while processing the document.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const determineStatus = (expirationDate?: string): ComplianceDocument['status'] => {
    if (!expirationDate) return 'pending-review';
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 30) return 'expiring-soon';
    return 'valid';
  };

  const getStatusColor = (status: ComplianceDocument['status']) => {
    switch (status) {
      case 'valid': return 'bg-green-500';
      case 'expiring-soon': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'pending-review': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: ComplianceSummary['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
    }
  };

  const getSeverityIcon = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    complianceStorage.acknowledgeAlert(alertId, 'Current User');
    loadData();
    toast({
      title: 'Alert Acknowledged',
      description: 'The compliance alert has been marked as acknowledged.'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.permitNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const summary = getSummary();

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Compliance & Documentation"
        description="Manage permits, certifications, and compliance requirements"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Compliance Document</DialogTitle>
                <DialogDescription>
                  Upload permits, manifests, test results, or certifications. OCR will automatically extract key information.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Document Type</Label>
                  <Select onValueChange={(value) => {
                    const input = document.getElementById('file-upload') as HTMLInputElement;
                    if (input) input.dataset.docType = value;
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soil-manifest">Soil Manifest</SelectItem>
                      <SelectItem value="environmental-permit">Environmental Permit</SelectItem>
                      <SelectItem value="hauler-insurance">Hauler Insurance</SelectItem>
                      <SelectItem value="soil-test-result">Soil Test Result</SelectItem>
                      <SelectItem value="transport-permit">Transport Permit</SelectItem>
                      <SelectItem value="safety-certification">Safety Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const docType = (e.target as HTMLInputElement).dataset.docType as DocumentType;
                      if (docType) {
                        handleFileUpload(e, docType);
                      } else {
                        toast({
                          title: 'Select Document Type',
                          description: 'Please select a document type first.',
                          variant: 'destructive'
                        });
                      }
                    }}
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                    <p className="text-xs text-muted-foreground">
                      {uploadProgress < 50 && 'Uploading file...'}
                      {uploadProgress >= 50 && uploadProgress < 90 && 'Extracting text with OCR...'}
                      {uploadProgress >= 90 && 'Finalizing...'}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.validDocuments} valid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Risk</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getRiskColor(summary.riskLevel)}`}>
              {summary.riskLevel}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.activeAlerts} active alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Action required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Prescriptive Compliance Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="shadow-elevated relative overflow-hidden bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-accent animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-base">Proactive Risk Detection</CardTitle>
                  <CardDescription>AI-powered compliance forecasting</CardDescription>
                </div>
              </div>
              <AIBadge size="md" variant="pill" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-card/50 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-status-pending" />
                <span className="text-sm font-medium text-foreground">Expiration Alert</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                3 permits expiring in next 30 days. Auto-renewal initiated for ENV-2024-047 and TRANS-2024-112.
              </p>
              <Badge className="bg-status-pending/20 text-status-pending text-xs">Action Required: 1</Badge>
            </div>
            <div className="bg-card/50 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Compliance Gap Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Missing: Hauler H-05 insurance update. Predicted approval: 89% if submitted by Friday.
              </p>
            </div>
            <Button size="sm" variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              View Full Risk Report
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elevated relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Auto-Verification</CardTitle>
                  <CardDescription>Intelligent document validation</CardDescription>
                </div>
              </div>
              <AIBadge size="md" variant="pill" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">OCR Accuracy</span>
                <span className="font-bold text-secondary">96.8%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto-Approved</span>
                <span className="font-bold text-status-approved">12 docs</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Flagged for Review</span>
                <span className="font-bold text-status-pending">2 docs</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-status-approved mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  AI validated ENV-2024-089 against 14 regulatory requirements. No issues detected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elevated relative overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-base">Smart Actions</CardTitle>
                  <CardDescription>Automated compliance tasks</CardDescription>
                </div>
              </div>
              <AIBadge size="md" variant="pill" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-status-approved mt-0.5" />
              <p className="text-sm text-foreground">
                Schedule renewal for SOIL-MAN-2024-034 (expires in 45 days)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-status-approved mt-0.5" />
              <p className="text-sm text-foreground">
                Request hauler insurance update from H-05 and H-12
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-status-pending mt-0.5" />
              <p className="text-sm text-foreground">
                Cross-verify soil test results with geotechnical specs
              </p>
            </div>
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              AI processing 247 compliance rules across 8 jurisdictions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="mt-6">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {summary.activeAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">{summary.activeAlerts}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="soil-manifest">Soil Manifest</SelectItem>
                    <SelectItem value="environmental-permit">Environmental Permit</SelectItem>
                    <SelectItem value="hauler-insurance">Hauler Insurance</SelectItem>
                    <SelectItem value="soil-test-result">Soil Test Result</SelectItem>
                    <SelectItem value="transport-permit">Transport Permit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending-review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{doc.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline">{doc.type.replace('-', ' ')}</Badge>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status.replace('-', ' ')}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>{doc.name}</DialogTitle>
                          <DialogDescription>Document ID: {doc.id}</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Permit Number</Label>
                                <p className="font-mono">{doc.permitNumber || 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Authority</Label>
                                <p>{doc.authority || 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Issue Date</Label>
                                <p>{doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Expiration Date</Label>
                                <p>{doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>

                            {doc.requiredAction && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Required Action</Label>
                                <p className="text-sm">{doc.requiredAction}</p>
                              </div>
                            )}

                            {doc.complianceNotes && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Compliance Notes</Label>
                                <p className="text-sm">{doc.complianceNotes}</p>
                              </div>
                            )}

                            <Separator />

                            <div>
                              <Label className="text-sm font-semibold">Audit Trail</Label>
                              <div className="mt-2 space-y-2">
                                {doc.auditTrail.map((entry) => (
                                  <div key={entry.id} className="text-sm border-l-2 border-primary pl-3">
                                    <div className="flex justify-between">
                                      <span className="font-medium">{entry.action}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{entry.performedBy}</p>
                                    <p className="text-xs mt-1">{entry.details}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {doc.signatures.length > 0 && (
                              <>
                                <Separator />
                                <div>
                                  <Label className="text-sm font-semibold">Signatures</Label>
                                  <div className="mt-2 space-y-2">
                                    {doc.signatures.map((sig) => (
                                      <div key={sig.id} className="flex justify-between items-center text-sm">
                                        <div>
                                          <p className="font-medium">{sig.signedBy}</p>
                                          <p className="text-xs text-muted-foreground">{sig.role}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(sig.signedAt).toLocaleString()}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Permit #:</span>
                      <p className="font-mono text-xs">{doc.permitNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      <p className="text-xs">
                        {doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {doc.requiredAction && (
                    <div className="bg-muted p-2 rounded text-xs">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {doc.requiredAction}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No documents found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.filter(a => !a.acknowledged).map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <CardTitle className="text-base">{alert.title}</CardTitle>
                    </div>
                    <CardDescription>{alert.message}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Acknowledge
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Created: {new Date(alert.timestamp).toLocaleString()}</span>
                  {alert.dueDate && (
                    <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {alerts.filter(a => !a.acknowledged).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">No active alerts</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Complete Audit Trail</CardTitle>
              <CardDescription>All compliance activities and document changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {documents.flatMap(doc => 
                    doc.auditTrail.map(entry => ({
                      ...entry,
                      documentName: doc.name,
                      documentId: doc.id
                    }))
                  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((entry) => (
                    <div key={entry.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.documentName} ({entry.documentId})
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{entry.performedBy}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceCenter;
