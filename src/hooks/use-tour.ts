import { useState, useEffect, useCallback } from 'react';

const TOUR_COMPLETED_KEY = 'centurion_tour_completed';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  highlight?: string;
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Centurion DG',
    description: 'This guided tour will walk you through the key modules of our AI-powered earthwork logistics platform. Each module contains sample data so you can see the platform in action.',
    route: '/',
    icon: 'Sparkles',
  },
  {
    id: 'dashboard',
    title: 'Main Dashboard',
    description: 'Your command center showing total sites, AI-suggested matches, approved deals, and cost savings. Quick access to all platform modules from here.',
    route: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    id: 'operations',
    title: 'Operations Center',
    description: 'Real-time operations monitoring with live job status, truck locations, and alerts. Track all active work from a single view.',
    route: '/operations',
    icon: 'Activity',
  },
  {
    id: 'materials',
    title: 'Materials Hub',
    description: 'AI-powered site matching connects export sites (dirt sources) with import sites (fill destinations). View match scores, distance, and estimated savings.',
    route: '/materials',
    icon: 'Layers',
  },
  {
    id: 'haulers',
    title: 'Hauler Network',
    description: 'Manage your trucking partners with performance ratings, certifications, and availability tracking. Build a reliable network of haulers.',
    route: '/haulers',
    icon: 'Truck',
  },
  {
    id: 'dispatches',
    title: 'Dispatch Management',
    description: 'Track all dispatch tickets from creation to delivery. Monitor driver locations, delivery status, and completion timestamps.',
    route: '/dispatches',
    icon: 'Send',
  },
  {
    id: 'scheduler',
    title: 'Smart Scheduler',
    description: 'AI-optimized scheduling with weather integration, resource allocation, and conflict detection. Drag-and-drop interface for easy management.',
    route: '/scheduler',
    icon: 'Calendar',
  },
  {
    id: 'compliance',
    title: 'Compliance Center',
    description: 'Document management with OCR scanning, expiration tracking, and audit trails. Stay compliant with automated monitoring and alerts.',
    route: '/compliance',
    icon: 'Shield',
  },
  {
    id: 'permits',
    title: 'Permits & Leads',
    description: 'Import permits from municipal systems, convert to sales leads, and create jobs. Track the full pipeline from permit to completed project.',
    route: '/permits-leads',
    icon: 'FileText',
  },
  {
    id: 'performance',
    title: 'Performance Dashboard',
    description: 'Executive intelligence with KPIs, trends, and forecasting. Track weekly volume, cost per cubic yard, profit margins, and sustainability metrics.',
    route: '/performance',
    icon: 'BarChart3',
  },
];

export function useTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    setHasCompletedTour(completed === 'true');
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setHasCompletedTour(true);
    setIsOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < tourSteps.length) {
      setCurrentStep(index);
    }
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setHasCompletedTour(false);
    setCurrentStep(0);
  }, []);

  return {
    isOpen,
    currentStep,
    totalSteps: tourSteps.length,
    currentStepData: tourSteps[currentStep],
    hasCompletedTour,
    startTour,
    closeTour,
    completeTour,
    nextStep,
    prevStep,
    goToStep,
    resetTour,
  };
}
