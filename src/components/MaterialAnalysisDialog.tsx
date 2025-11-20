import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIBadge } from '@/components/ui/ai-badge';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Truck,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';

interface MaterialAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialAnalysisDialog({ open, onOpenChange }: MaterialAnalysisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">Optimal Sourcing Match Analysis</DialogTitle>
              <DialogDescription>AI-powered material pairing recommendation</DialogDescription>
            </div>
            <AIBadge size="lg" variant="pill" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Match Summary */}
          <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Structural Fill Match</h3>
                <p className="text-muted-foreground">Export Site EX-101 → Import Site IM-203</p>
              </div>
              <Badge className="bg-secondary/20 text-secondary text-lg px-4 py-2">
                94% Compatible
              </Badge>
            </div>
            <p className="text-foreground">
              IM-203 needs 1,200 CY structural fill. EX-101 has matching soil classification 
              with 87% compaction rate and optimal moisture content for immediate use.
            </p>
          </Card>

          <Tabs defaultValue="compatibility" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
              <TabsTrigger value="economics">Economics</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="compatibility" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-approved" />
                    Soil Properties Match
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Classification</span>
                        <span className="font-semibold text-secondary">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Compaction Rate</span>
                        <span className="font-semibold text-secondary">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Moisture Content</span>
                        <span className="font-semibold text-secondary">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Gradation</span>
                        <span className="font-semibold text-secondary">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Technical Specifications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">USCS Classification</span>
                      <span className="font-semibold text-foreground">SM (Silty Sand)</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Liquid Limit</span>
                      <span className="font-semibold text-foreground">24%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plasticity Index</span>
                      <span className="font-semibold text-foreground">8</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Dry Density</span>
                      <span className="font-semibold text-foreground">124 pcf</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Optimum Moisture</span>
                      <span className="font-semibold text-foreground">11.2%</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on geotechnical testing data and historical performance from 47 similar projects, 
                      this material pairing shows excellent compatibility. The source material from EX-101 
                      exceeds structural fill requirements with a suitability score of 94%. Compaction 
                      characteristics align perfectly with IM-203 specifications, requiring minimal processing 
                      or conditioning on-site.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="economics" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold text-foreground">$5,904</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">For 1,200 CY at $4.92/CY</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-status-approved/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-status-approved" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Savings</p>
                      <p className="text-2xl font-bold text-status-approved">$3,120</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">vs. landfill disposal + purchase</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-2xl font-bold text-accent">52.8%</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Return on investment</p>
                </Card>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-4">Cost Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Material excavation</span>
                    <span className="font-semibold text-foreground">$1,440</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Hauling (12 miles × 40 loads)</span>
                    <span className="font-semibold text-foreground">$3,264</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Placement & compaction</span>
                    <span className="font-semibold text-foreground">$960</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Testing & inspection</span>
                    <span className="font-semibold text-foreground">$240</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-foreground">Total Project Cost</span>
                    <span className="text-xl font-bold text-primary">$5,904</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/5 border-secondary/20">
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Economic Impact</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This match reduces costs by 34.6% compared to traditional landfill disposal and virgin 
                      material purchase. Local sourcing eliminates long-haul transportation fees and 
                      disposal surcharges, creating immediate bottom-line savings.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-status-approved/20 text-status-approved">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Avoids $2,400 disposal fees
                      </Badge>
                      <Badge className="bg-status-approved/20 text-status-approved">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Saves $720 in transport
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Route Details</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-semibold text-foreground">12.3 miles</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Travel Time</span>
                      <span className="font-semibold text-foreground">24 min/trip</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Route Type</span>
                      <span className="font-semibold text-foreground">Highway + Local</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Traffic Pattern</span>
                      <span className="font-semibold text-foreground">Moderate</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold text-foreground">Fleet Requirements</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trucks Needed</span>
                      <span className="font-semibold text-foreground">4 trucks</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Load Capacity</span>
                      <span className="font-semibold text-foreground">30 CY/truck</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Loads</span>
                      <span className="font-semibold text-foreground">40 loads</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loads per Day</span>
                      <span className="font-semibold text-foreground">16 loads</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-secondary" />
                  <h4 className="font-semibold text-foreground">Timeline Projection</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Day 1: Mobilization & Setup</span>
                      <span className="font-semibold text-foreground">0.5 days</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Days 2-3: Primary Hauling</span>
                      <span className="font-semibold text-foreground">2 days</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Day 4: Final Loads & Testing</span>
                      <span className="font-semibold text-foreground">0.5 days</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total Project Duration</span>
                      <span className="text-lg font-bold text-primary">3 days</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Logistics Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      AI route optimization suggests using Highway 485 to I-77 corridor during morning hours 
                      (7-10 AM) to avoid peak traffic. Deploy 4 trucks in rotation for maximum efficiency, 
                      completing the project in 3 days with weather contingency buffer.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-status-approved/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-status-approved" />
                    <h4 className="font-semibold text-status-approved">Low Risk Factors</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Material quality consistent across source site</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Route has no weight restrictions or permits needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Both sites have excellent accessibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Weather forecast favorable for project window</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-4 border-status-pending/30">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-status-pending" />
                    <h4 className="font-semibold text-status-pending">Medium Risk Factors</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-pending mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Moisture content may vary with rain - monitor conditions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-pending mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Peak traffic hours (4-6 PM) could add 10-15 min per trip
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-pending mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Confirm hauler availability 48 hours before start
                      </span>
                    </li>
                  </ul>
                </Card>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Risk Mitigation Strategy
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Pre-Start Moisture Testing</p>
                      <p className="text-xs text-muted-foreground">
                        Conduct moisture content test 24 hours before hauling begins to confirm optimal range
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Traffic Avoidance Schedule</p>
                      <p className="text-xs text-muted-foreground">
                        Prioritize 7-10 AM and 1-3 PM windows for optimal traffic conditions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Backup Hauler on Standby</p>
                      <p className="text-xs text-muted-foreground">
                        Identify secondary hauler for contingency if primary fleet experiences delays
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Risk Assessment</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Based on analysis of 47 similar projects and current conditions, this match presents 
                      an overall <strong>LOW to MEDIUM risk profile</strong> with a 92% probability of 
                      on-time, on-budget completion. Historical data shows similar pairings have a 96% 
                      success rate under comparable conditions.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-status-approved/20 rounded-full h-2">
                        <div className="bg-status-approved rounded-full h-2" style={{ width: '92%' }} />
                      </div>
                      <span className="text-sm font-bold text-status-approved">92%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}