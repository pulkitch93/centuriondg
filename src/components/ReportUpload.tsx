import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GeotechReport, SoilProperties } from '@/types/geotechnical';
import { 
  calculateSuitabilityScore, 
  classifySoil, 
  generateRecommendations,
  extractSoilDataFromText 
} from '@/lib/soilClassification';
import { geotechStorage } from '@/lib/geotechnicalStorage';
import { Upload, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export default function ReportUpload({ open, onOpenChange, onUploadComplete }: ReportUploadProps) {
  const { toast } = useToast();
  const [uploadMode, setUploadMode] = useState<'file' | 'manual'>('file');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [manualData, setManualData] = useState<Partial<SoilProperties>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setFileContent(text);
        
        // Simulate AI extraction
        const extracted = extractSoilDataFromText(text);
        setManualData(extracted);
        
        toast({
          title: "AI extraction complete",
          description: "Soil properties extracted from document.",
        });
      } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        toast({
          title: "Processing file",
          description: "For PDF and image processing, enable Lovable Cloud for OCR capabilities.",
          variant: "default",
        });
        
        // Simulate extraction for demo
        setTimeout(() => {
          setManualData({
            moistureContent: 12.5,
            compaction: 92,
            density: 118,
            pH: 7.2,
          });
          toast({
            title: "Simulated extraction",
            description: "Sample data generated for demonstration.",
          });
        }, 1500);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Error processing file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!fileName && uploadMode === 'file') {
      toast({
        title: "No file selected",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }

    const properties: SoilProperties = {
      ...manualData,
      grainSize: manualData.grainSize || {},
      contaminants: manualData.contaminants || [],
    };

    const score = calculateSuitabilityScore(properties);
    const classification = classifySoil(properties, score);
    const recommendations = generateRecommendations(classification, properties, score);

    const report: GeotechReport = {
      id: `report-${Date.now()}`,
      name: fileName || `Manual Entry ${new Date().toLocaleDateString()}`,
      uploadDate: new Date().toISOString(),
      fileType: fileName.endsWith('.pdf') ? 'pdf' : fileName.endsWith('.txt') ? 'text' : 'image',
      classification,
      suitabilityScore: score,
      properties,
      aiExtracted: uploadMode === 'file',
      reuseRecommendations: recommendations.reuseRecommendations,
      riskFactors: recommendations.riskFactors,
      treatmentOptions: recommendations.treatmentOptions,
    };

    geotechStorage.addReport(report);

    toast({
      title: "Report added",
      description: `${report.name} classified as ${classification} with score ${score}`,
    });

    // Reset form
    setFileName('');
    setFileContent('');
    setManualData({});
    onOpenChange(false);
    onUploadComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Geotechnical Report</DialogTitle>
          <DialogDescription>
            Upload a report or manually enter soil test data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          <div className="flex gap-3">
            <Button
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMode('file')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button
              variant={uploadMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setUploadMode('manual')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {uploadMode === 'file' && (
            <Card className="p-6 border-dashed border-2">
              <div className="text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-sm text-muted-foreground mb-2">
                    Upload PDF, image, or text file
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </Button>
                </Label>
                {fileName && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{fileName}</span>
                    <Badge variant="outline" className="border-accent text-accent">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Extracted
                    </Badge>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Enable Lovable Cloud for Full OCR</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For production-grade PDF and image OCR, enable Lovable Cloud to use advanced AI extraction.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Manual Data Entry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moisture">Moisture Content (%)</Label>
              <Input
                id="moisture"
                type="number"
                step="0.1"
                value={manualData.moistureContent || ''}
                onChange={(e) => setManualData({ 
                  ...manualData, 
                  moistureContent: parseFloat(e.target.value) 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compaction">Compaction (%)</Label>
              <Input
                id="compaction"
                type="number"
                step="0.1"
                value={manualData.compaction || ''}
                onChange={(e) => setManualData({ 
                  ...manualData, 
                  compaction: parseFloat(e.target.value) 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="density">Density (lb/ft³)</Label>
              <Input
                id="density"
                type="number"
                step="0.1"
                value={manualData.density || ''}
                onChange={(e) => setManualData({ 
                  ...manualData, 
                  density: parseFloat(e.target.value) 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph">pH Level</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                value={manualData.pH || ''}
                onChange={(e) => setManualData({ 
                  ...manualData, 
                  pH: parseFloat(e.target.value) 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organic">Organic Content (%)</Label>
              <Input
                id="organic"
                type="number"
                step="0.1"
                value={manualData.organicContent || ''}
                onChange={(e) => setManualData({ 
                  ...manualData, 
                  organicContent: parseFloat(e.target.value) 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contaminants">Contaminants (comma-separated)</Label>
              <Input
                id="contaminants"
                placeholder="Lead, Arsenic, etc."
                value={manualData.contaminants?.join(', ') || ''}
                onChange={(e) => setManualData({ 
                  ...manualData, 
                  contaminants: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-dark">
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
