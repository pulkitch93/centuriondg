import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AIBadge } from '@/components/ui/ai-badge';
import { ProductTour } from '@/components/ProductTour';
import { useTour } from '@/hooks/use-tour';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  MapPin, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Truck,
  Clock,
  DollarSign,
  Bot,
  PlayCircle
} from 'lucide-react';

export default function Marketing() {
  const {
    isOpen,
    currentStep,
    totalSteps,
    startTour,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
  } = useTour();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Centurion DG Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Intelligent Earthwork Logistics for Modern Construction
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Revolutionize your dirt management with AI-powered site matching, 
              real-time tracking, and automated logistics optimization.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={startTour} className="gap-2">
                <PlayCircle className="w-4 h-4" />
                Take Product Tour
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Features for Complete Control
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage earthwork logistics efficiently and profitably
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-2xl transition-all relative overflow-hidden bg-gradient-to-br from-accent/10 via-primary/5 to-accent/5 border-2 border-accent/30">
              <div className="absolute top-3 right-3">
                <AIBadge size="md" variant="pill" />
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-pulse-subtle">
                <Sparkles className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                AI-Powered Matching
                <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
              </h3>
              <p className="text-muted-foreground">
                Our intelligent algorithm automatically matches export sites with import sites, 
                optimizing for distance, volume, and cost savings in real-time.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Live Tracking</h3>
              <p className="text-muted-foreground">
                Real-time GPS tracking of all trucks, with geofencing alerts and 
                automated arrival notifications for complete visibility.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all relative overflow-hidden bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
              <div className="absolute top-3 right-3">
                <AIBadge size="sm" variant="minimal" />
              </div>
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Truck className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Smart Dispatching</h3>
              <p className="text-muted-foreground">
                AI-powered load assignments and route optimization ensure maximum 
                efficiency and minimal idle time for your hauler fleet.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
              <div className="absolute top-3 right-3">
                <AIBadge size="sm" variant="minimal" />
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Dynamic Scheduling</h3>
              <p className="text-muted-foreground">
                Intelligent scheduling system powered by AI that adapts to weather, site conditions, 
                and resource availability in real-time.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-full bg-status-approved/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-status-approved" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Compliance Tracking</h3>
              <p className="text-muted-foreground">
                Automated compliance monitoring with document management, certifications, 
                and audit trail for peace of mind.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all relative overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20">
              <div className="absolute top-3 right-3">
                <AIBadge size="sm" variant="minimal" />
              </div>
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Executive Intelligence</h3>
              <p className="text-muted-foreground">
                AI-driven analytics dashboard with KPIs, profitability tracking, 
                and predictive insights for data-driven decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Why Choose Centurion DG?
              </h2>
              <p className="text-lg text-muted-foreground">
                Transform your earthwork operations with measurable results
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Reduce Costs by 30%</h3>
                  <p className="text-muted-foreground">
                    Optimize haul distances and eliminate unnecessary trucking expenses through 
                    intelligent site matching and route optimization.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Increase Efficiency by 40%</h3>
                  <p className="text-muted-foreground">
                    Automated dispatching and real-time tracking reduce idle time and maximize 
                    your fleet utilization throughout the day.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Boost Profitability</h3>
                  <p className="text-muted-foreground">
                    Data-driven insights and predictive analytics help you make smarter business 
                    decisions and identify new revenue opportunities.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-status-approved/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-status-approved" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Ensure Compliance</h3>
                  <p className="text-muted-foreground">
                    Stay audit-ready with automated documentation, certification tracking, 
                    and complete transparency across all operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join leading construction companies using Centurion DG to streamline 
              their earthwork logistics and maximize profitability.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Your Journey <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Product Tour */}
      <ProductTour
        isOpen={isOpen}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onClose={closeTour}
        onNext={nextStep}
        onPrev={prevStep}
        onGoToStep={goToStep}
      />
    </div>
  );
}