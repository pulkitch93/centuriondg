import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { tourSteps } from '@/hooks/use-tour';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Activity,
  Layers,
  Truck,
  Send,
  Calendar,
  Shield,
  FileText,
  BarChart3,
  Play,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-8 h-8" />,
  LayoutDashboard: <LayoutDashboard className="w-8 h-8" />,
  Activity: <Activity className="w-8 h-8" />,
  Layers: <Layers className="w-8 h-8" />,
  Truck: <Truck className="w-8 h-8" />,
  Send: <Send className="w-8 h-8" />,
  Calendar: <Calendar className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  FileText: <FileText className="w-8 h-8" />,
  BarChart3: <BarChart3 className="w-8 h-8" />,
};

interface ProductTourProps {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToStep: (index: number) => void;
}

export function ProductTour({
  isOpen,
  currentStep,
  totalSteps,
  onClose,
  onNext,
  onPrev,
  onGoToStep,
}: ProductTourProps) {
  const navigate = useNavigate();
  const step = tourSteps[currentStep];

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleVisitModule = () => {
    navigate(step.route);
    onNext();
  };

  const handleSkipToModule = (index: number) => {
    onGoToStep(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Tour Card */}
      <Card className="relative z-10 w-full max-w-2xl mx-4 overflow-hidden shadow-2xl border-2 border-primary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {iconMap[step.icon]}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Step {currentStep + 1} of {totalSteps}
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  {step.title}
                </h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Module Preview Grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {tourSteps.slice(1).map((s, index) => (
              <button
                key={s.id}
                onClick={() => handleSkipToModule(index + 1)}
                className={`p-2 rounded-lg transition-all text-center ${
                  currentStep === index + 1
                    ? 'bg-primary text-primary-foreground'
                    : index + 1 < currentStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title={s.title}
              >
                <div className="w-6 h-6 mx-auto mb-1">
                  {iconMap[s.icon]}
                </div>
                <span className="text-[10px] font-medium truncate block">
                  {s.title.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-t">
          <Button
            variant="ghost"
            onClick={onPrev}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handleVisitModule}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Visit Module
              </Button>
            )}
            <Button onClick={onNext} className="gap-2">
              {isLastStep ? (
                'Finish Tour'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
