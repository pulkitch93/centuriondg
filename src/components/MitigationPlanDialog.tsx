import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIBadge } from '@/components/ui/ai-badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  CloudRain,
  Truck,
  Calendar,
  MapPin,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';

interface MitigationPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MitigationPlanDialog({ open, onOpenChange }: MitigationPlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-destructive/20 to-status-pending/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">Risk Mitigation Plan</DialogTitle>
              <DialogDescription>AI-generated strategies to prevent scheduling bottlenecks</DialogDescription>
            </div>
            <AIBadge size="lg" variant="pill" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Risk Overview */}
          <Card className="p-6 bg-gradient-to-br from-destructive/5 to-status-pending/5 border-2 border-destructive/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-foreground">Weather Risk</span>
                </div>
                <div className="text-3xl font-bold text-destructive mb-1">67%</div>
                <p className="text-sm text-muted-foreground">Rain forecast Thu 2-5PM</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-status-pending" />
                  <span className="font-semibold text-foreground">Hauler Capacity</span>
                </div>
                <div className="text-3xl font-bold text-status-pending mb-1">89%</div>
                <p className="text-sm text-muted-foreground">Near capacity Friday</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-status-approved" />
                  <span className="font-semibold text-foreground">Mitigation Success</span>
                </div>
                <div className="text-3xl font-bold text-status-approved mb-1">94%</div>
                <p className="text-sm text-muted-foreground">With recommended actions</p>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="weather" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weather">Weather Mitigation</TabsTrigger>
              <TabsTrigger value="capacity">Capacity Management</TabsTrigger>
              <TabsTrigger value="summary">Action Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="weather" className="space-y-4 mt-6">
              <Card className="p-6 border-2 border-destructive/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <CloudRain className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">Weather Delay Risk: 67%</h3>
                    <p className="text-sm text-muted-foreground">
                      Rain forecast Thursday 2-5 PM with 67% probability. Affects 4 scheduled hauls 
                      (Schedule #247, #249, #251, #253) totaling 320 CY.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border-2 border-primary/30 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Primary Strategy: Schedule Shift</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Move 80% of affected loads (256 CY) to morning window (7-11 AM Thursday)
                        </p>
                      </div>
                      <Badge className="bg-status-approved/20 text-status-approved">Recommended</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Revised Schedule</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Thu 7-11 AM:</span>
                            <span className="font-semibold text-foreground">256 CY (8 loads)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fri 7-11 AM:</span>
                            <span className="font-semibold text-foreground">64 CY (2 loads)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-status-approved" />
                          <span className="text-sm font-semibold text-foreground">Impact</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Reduction:</span>
                            <span className="font-semibold text-status-approved">67% → 12%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">On-time Probability:</span>
                            <span className="font-semibold text-status-approved">94%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-secondary">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Backup Strategy: Site Preparation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Pre-stage equipment and materials at both sites Wednesday evening for rapid deployment
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5" />
                        <span className="text-sm text-foreground">Position excavator at EX-101 Wednesday 4 PM</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5" />
                        <span className="text-sm text-foreground">Tarp coverage ready for IM-203 material stockpile</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-status-approved mt-0.5" />
                        <span className="text-sm text-foreground">Backup trucks on standby for weather window openings</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-accent">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Contingency: Alternative Routes</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          If rain persists beyond forecast, use covered alternate route via Route 49 
                          (adds 8 minutes but weatherproof)
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>Route 49 → I-485 bypass (all-weather alternative)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Weather Intelligence</h4>
                    <p className="text-sm text-muted-foreground">
                      Historical analysis shows similar weather patterns in this region have 73% accuracy 
                      in 3-day forecasts. The morning shift strategy has been successful in 89% of 
                      comparable situations across 156 past events. Real-time radar monitoring will 
                      continue until execution.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="capacity" className="space-y-4 mt-6">
              <Card className="p-6 border-2 border-status-pending/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-status-pending/20 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-status-pending" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">Hauler Capacity: 89% Utilization</h3>
                    <p className="text-sm text-muted-foreground">
                      Primary fleet approaching capacity Friday with projected 89% utilization. 
                      Surge demand from rescheduled Thursday loads requires fleet augmentation.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border-2 border-primary/30 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Primary Strategy: Backup Fleet Activation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Deploy 2 backup trucks from secondary hauler H-07 to handle Friday surge
                        </p>
                      </div>
                      <Badge className="bg-status-approved/20 text-status-approved">Recommended</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Truck className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Fleet Allocation</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Primary (H-03):</span>
                            <span className="font-semibold text-foreground">4 trucks (67%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Backup (H-07):</span>
                            <span className="font-semibold text-foreground">2 trucks (33%)</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-border">
                            <span className="text-muted-foreground">Total Capacity:</span>
                            <span className="font-semibold text-status-approved">6 trucks (100%)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-status-approved" />
                          <span className="text-sm font-semibold text-foreground">Performance Impact</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Utilization:</span>
                            <span className="font-semibold text-status-approved">89% → 59%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Buffer Capacity:</span>
                            <span className="font-semibold text-status-approved">+41%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Level:</span>
                            <span className="font-semibold text-status-approved">Low</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Estimated Additional Cost:</span>
                        <span className="text-lg font-bold text-primary">$480</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        2 trucks × 10 loads × $24/load premium for backup hauler
                      </p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-secondary">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Alternative: Extended Hours Operation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Run primary fleet extended hours (6 AM - 6 PM) Friday to maintain schedule without backup
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-status-approved" />
                        <span className="text-foreground">No additional hauler costs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-status-pending" />
                        <span className="text-foreground">Driver fatigue risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-status-approved" />
                        <span className="text-foreground">Familiar equipment/routes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-status-pending" />
                        <span className="text-foreground">Limited buffer capacity</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-accent">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">Contingency: Load Distribution</h4>
                        <p className="text-sm text-muted-foreground">
                          Distribute 30% of Friday loads to Monday morning (6-10 AM) if capacity 
                          issues arise. Client has approved 2-day flex window.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Fleet Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Backup hauler H-07 has 94% reliability score and 87% on-time performance. 
                      Historical data shows mixed fleet operations increase project completion 
                      success by 23% during high-demand periods. The additional $480 cost is 
                      offset by avoiding $1,200+ in delay penalties.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-6">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-status-approved/5 border-2 border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-status-approved/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Recommended Action Plan</h3>
                    <p className="text-sm text-muted-foreground">Execute immediately for optimal results</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg border-2 border-primary/30">
                    <div className="flex items-center gap-3 flex-1">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">Wednesday Evening</p>
                        <p className="text-sm text-muted-foreground">Pre-stage equipment at sites</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg border-2 border-primary/30">
                    <div className="flex items-center gap-3 flex-1">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">Thursday 7-11 AM</p>
                        <p className="text-sm text-muted-foreground">Execute 256 CY (8 loads) before weather window</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg border-2 border-primary/30">
                    <div className="flex items-center gap-3 flex-1">
                      <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">Thursday PM</p>
                        <p className="text-sm text-muted-foreground">Confirm backup fleet (H-07) availability for Friday</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg border-2 border-primary/30">
                    <div className="flex items-center gap-3 flex-1">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">Friday Full Day</p>
                        <p className="text-sm text-muted-foreground">Deploy 6-truck mixed fleet (4 primary + 2 backup)</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-status-approved" />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Expected Outcomes</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-status-approved mb-1">94%</div>
                      <p className="text-xs text-muted-foreground">On-Time Completion Probability</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary mb-1">$480</div>
                      <p className="text-xs text-muted-foreground">Additional Cost Investment</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-secondary mb-1">$1.2K</div>
                      <p className="text-xs text-muted-foreground">Delay Penalties Avoided</p>
                    </div>
                  </div>

                  <Card className="p-4 bg-status-approved/5 border-status-approved/30">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-status-approved flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground mb-2">Net Benefit Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          Implementing this mitigation plan reduces risk by 78% while investing $480 
                          to avoid potential $1,200 in delay penalties. Net benefit: <strong className="text-status-approved">$720</strong> plus 
                          reputation protection and client satisfaction.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Execute Plan
                </Button>
                <Button variant="outline" className="flex-1">
                  Export to Calendar
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}