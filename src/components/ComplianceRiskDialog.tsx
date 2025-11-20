import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIBadge } from '@/components/ui/ai-badge';
import { Button } from '@/components/ui/button';
import { 
  Brain,
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  Shield,
  Target,
  FileText,
  Sparkles,
  Calendar,
  XCircle,
  AlertCircle,
  Zap,
  TrendingDown,
  Activity
} from 'lucide-react';

interface ComplianceRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComplianceRiskDialog({ open, onOpenChange }: ComplianceRiskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">Compliance Risk Report</DialogTitle>
              <DialogDescription>AI-powered compliance forecasting & risk analysis</DialogDescription>
            </div>
            <AIBadge size="lg" variant="pill" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Overall Risk Score */}
          <Card className="p-6 bg-gradient-to-br from-status-pending/5 to-status-approved/5 border-2 border-status-pending/30">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Overall Compliance Health</h3>
                <p className="text-muted-foreground">Current risk level based on 247 compliance rules</p>
              </div>
              <Badge className="bg-status-pending/20 text-status-pending text-lg px-4 py-2">
                Medium Risk
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-status-approved mb-1">87%</div>
                <div className="text-sm text-muted-foreground">Compliance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-status-pending mb-1">5</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive mb-1">3</div>
                <div className="text-sm text-muted-foreground">Expiring Soon</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">12</div>
                <div className="text-sm text-muted-foreground">Auto-Processed</div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
              <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4 mt-6">
              <div className="space-y-3">
                {/* Critical Alert */}
                <Card className="border-2 border-destructive/30 bg-destructive/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            Permit Expiration - Critical
                            <Badge variant="destructive">Critical</Badge>
                          </CardTitle>
                          <CardDescription>ENV-2024-089 expires in 7 days</CardDescription>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive">Renew Now</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Environmental permit ENV-2024-089 expires on Dec 28, 2024. Projects IM-203 and EX-107 
                      depend on this permit. Immediate renewal required to avoid project delays.
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">7 days remaining</span>
                    </div>
                  </CardContent>
                </Card>

                {/* High Alert */}
                <Card className="border-2 border-status-pending/30 bg-status-pending/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-status-pending/20 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-status-pending" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            Expiration Alert - High
                            <Badge className="bg-status-pending/20 text-status-pending">High</Badge>
                          </CardTitle>
                          <CardDescription>3 permits expiring in next 30 days</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Multiple permits approaching expiration. Auto-renewal initiated for ENV-2024-047 and 
                      TRANS-2024-112. Manual action required for SOIL-MAN-2024-034.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ENV-2024-047 (Auto-renewal initiated)</span>
                        <Badge className="bg-status-approved/20 text-status-approved">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Processing
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">TRANS-2024-112 (Auto-renewal initiated)</span>
                        <Badge className="bg-status-approved/20 text-status-approved">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Processing
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SOIL-MAN-2024-034</span>
                        <Badge className="bg-status-pending/20 text-status-pending">Action Required</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medium Alert */}
                <Card className="border-2 border-blue-500/30 bg-blue-500/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            Missing Documentation - Medium
                            <Badge className="bg-blue-500/20 text-blue-500">Medium</Badge>
                          </CardTitle>
                          <CardDescription>Hauler insurance updates pending</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Insurance certificates for Hauler H-05 and H-12 are due for quarterly update. 
                      Reminder emails sent. Expected submission by end of week.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Predicted submission: 89% by Friday</span>
                      <Button size="sm" variant="outline">Send Reminder</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4 mt-6">
              <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">AI Predictive Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Machine learning models analyzing 2,847 historical compliance patterns
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Next 30 Days Forecast</h4>
                        <p className="text-sm text-muted-foreground">Predicted compliance events</p>
                      </div>
                      <Badge className="bg-status-approved/20 text-status-approved">High Confidence</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Dec 28 - ENV-2024-089 expiration</p>
                          <p className="text-xs text-muted-foreground">98% certainty, renewal required</p>
                        </div>
                        <span className="text-sm font-bold text-destructive">Critical</span>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Jan 5 - Hauler cert updates due</p>
                          <p className="text-xs text-muted-foreground">89% submission probability by Jan 3</p>
                        </div>
                        <span className="text-sm font-bold text-status-pending">Watch</span>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Jan 12 - Soil test results review</p>
                          <p className="text-xs text-muted-foreground">Routine quarterly compliance check</p>
                        </div>
                        <span className="text-sm font-bold text-status-approved">On Track</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-3">Risk Trend Analysis</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Current Month</span>
                          <span className="font-semibold text-status-approved">87% Compliance</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Projected Next Month</span>
                          <span className="font-semibold text-status-approved">91% Compliance</span>
                        </div>
                        <Progress value={91} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <TrendingUp className="w-4 h-4 text-status-approved" />
                        <span className="text-sm text-status-approved font-semibold">+4% improvement expected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-4 mt-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Compliance Gap Analysis</h3>
                    <p className="text-sm text-muted-foreground">AI-identified documentation and process gaps</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-destructive pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">Missing: Hauler H-05 Insurance Update</h4>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quarterly insurance certificate update overdue by 3 days. Required for continued operations 
                      on Projects IM-203, EX-107, and EX-101.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-foreground">AI Prediction</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on H-05's historical submission patterns (avg 2-day delay), predicted submission: 
                        89% probability by Friday EOD. Auto-reminder scheduled for Thursday morning.
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Request Update</Button>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-status-pending pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">Incomplete: Soil Test Cross-Verification</h4>
                      <Badge className="bg-status-pending/20 text-status-pending">Medium Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Geotechnical test results from GT-007 need cross-verification with structural specs for 
                      IM-203. Recommended within 7 days.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Automated Detection</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI detected potential discrepancy between soil classification (SM) and project structural 
                        requirements. Confidence: 67%. Suggest engineering review.
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Schedule Review</Button>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">Process Gap: Manual Permit Tracking</h4>
                      <Badge className="bg-blue-500/20 text-blue-500">Low Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Currently tracking 14 permits manually. AI suggests implementing automated renewal 
                      workflow for 8 recurring permits to reduce admin overhead by 42%.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-accent" />
                      <span>Estimated time savings: 6 hours/month</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4 mt-6">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">AI-Recommended Actions</h3>
                    <p className="text-sm text-muted-foreground">Prioritized by impact and urgency</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card rounded-lg border-2 border-destructive/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-destructive">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Immediate: Renew ENV-2024-089</h4>
                          <p className="text-sm text-muted-foreground">
                            Submit renewal application for environmental permit expiring in 7 days. 
                            Affects 2 active projects.
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                        Start Renewal
                      </Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">This Week: Request Insurance Updates</h4>
                          <p className="text-sm text-muted-foreground">
                            Send automated reminders to Haulers H-05 and H-12 for quarterly insurance updates.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Send Reminders</Button>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Next Week: Schedule Geotechnical Review</h4>
                          <p className="text-sm text-muted-foreground">
                            Cross-verify soil test results (GT-007) with structural specs before material placement.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Schedule Review</Button>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-secondary">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">This Month: Implement Auto-Renewal Workflow</h4>
                          <p className="text-sm text-muted-foreground">
                            Set up automated renewal process for 8 recurring permits to save 6 hours/month.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <TrendingUp className="w-3 h-3 text-secondary" />
                      <span>Estimated efficiency gain: 42%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Optimization Note</h4>
                    <p className="text-sm text-muted-foreground">
                      Following these recommendations will improve compliance rate from 87% to estimated 94% 
                      within 30 days, while reducing manual administrative work by 38%. The AI model continuously 
                      learns from your compliance patterns and will provide increasingly accurate predictions.
                    </p>
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