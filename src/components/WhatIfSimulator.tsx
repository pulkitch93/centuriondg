import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Schedule, Hauler, RouteType } from '@/types/scheduler';
import { simulateSchedule } from '@/lib/scheduler';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WhatIfSimulatorProps {
  schedule: Schedule | null;
  haulers: Hauler[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyChanges?: (updatedSchedule: Schedule) => void;
}

export default function WhatIfSimulator({ 
  schedule, 
  haulers, 
  open, 
  onOpenChange,
  onApplyChanges 
}: WhatIfSimulatorProps) {
  const [selectedHaulerId, setSelectedHaulerId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedRouteType, setSelectedRouteType] = useState<RouteType>('fastest');
  const [simulatedSchedule, setSimulatedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    if (schedule) {
      setSelectedHaulerId(schedule.haulerId || '');
      setSelectedDate(schedule.date);
      setSelectedVolume(schedule.volumeScheduled.toString());
      setSelectedRouteType(schedule.route.type);
      setSimulatedSchedule(schedule);
    }
  }, [schedule]);

  useEffect(() => {
    if (!schedule) return;

    const simulated = simulateSchedule(
      schedule,
      selectedHaulerId || undefined,
      selectedDate !== schedule.date ? selectedDate : undefined,
      selectedVolume !== schedule.volumeScheduled.toString() ? parseInt(selectedVolume) : undefined,
      selectedRouteType,
      haulers
    );

    setSimulatedSchedule(simulated);
  }, [selectedHaulerId, selectedDate, selectedVolume, selectedRouteType, schedule, haulers]);

  if (!schedule || !simulatedSchedule) return null;

  const originalHauler = haulers.find(h => h.id === schedule.haulerId);
  const newHauler = haulers.find(h => h.id === selectedHaulerId);

  const costDiff = simulatedSchedule.route.cost - schedule.route.cost;
  const delayDiff = (simulatedSchedule.weatherDelay || 0) + (simulatedSchedule.trafficDelay || 0) - 
                    ((schedule.weatherDelay || 0) + (schedule.trafficDelay || 0));
  const carbonDiff = simulatedSchedule.route.carbonEmissions - schedule.route.carbonEmissions;

  const DifferenceIndicator = ({ value, unit = '$', positive = 'bad' }: { 
    value: number; 
    unit?: string; 
    positive?: 'good' | 'bad' 
  }) => {
    if (Math.abs(value) < 0.01) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="w-4 h-4" />
          <span className="text-sm">No change</span>
        </div>
      );
    }

    const isPositive = value > 0;
    const color = (isPositive && positive === 'bad') || (!isPositive && positive === 'good') 
      ? 'text-status-approved' 
      : 'text-destructive';

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="text-sm font-semibold">
          {isPositive ? '+' : ''}{unit === '$' ? unit : ''}{Math.abs(value).toFixed(1)}{unit !== '$' ? unit : ''}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>What-If Simulator</DialogTitle>
          <DialogDescription>
            Adjust parameters to see predicted impacts on cost, delays, and emissions
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 my-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sim-hauler">Hauler</Label>
              <Select value={selectedHaulerId} onValueChange={setSelectedHaulerId}>
                <SelectTrigger id="sim-hauler">
                  <SelectValue placeholder="Select hauler" />
                </SelectTrigger>
                <SelectContent>
                  {haulers.filter(h => h.status === 'active').map(hauler => (
                    <SelectItem key={hauler.id} value={hauler.id}>
                      {hauler.name} - ${hauler.costPerMile.toFixed(2)}/mi
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sim-date">Date</Label>
              <Input
                id="sim-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sim-volume">Volume (cubic yards)</Label>
              <Input
                id="sim-volume"
                type="number"
                value={selectedVolume}
                onChange={(e) => setSelectedVolume(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sim-route">Route Type</Label>
              <Select value={selectedRouteType} onValueChange={(v) => setSelectedRouteType(v as RouteType)}>
                <SelectTrigger id="sim-route">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fastest">Fastest Route</SelectItem>
                  <SelectItem value="cheapest">Cheapest Route</SelectItem>
                  <SelectItem value="greenest">Greenest Route</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>Original</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-accent">Simulated</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hauler</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{originalHauler?.name || 'Unassigned'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-accent">{newHauler?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cost</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">${schedule.route.cost.toFixed(0)}</span>
                    <DifferenceIndicator value={costDiff} unit="$" positive="bad" />
                    <span className="text-sm font-semibold text-accent">${simulatedSchedule.route.cost.toFixed(0)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Delay Risk</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {((schedule.weatherDelay || 0) + (schedule.trafficDelay || 0)).toFixed(0)} min
                    </span>
                    <DifferenceIndicator value={delayDiff} unit=" min" positive="bad" />
                    <span className="text-sm font-semibold text-accent">
                      {((simulatedSchedule.weatherDelay || 0) + (simulatedSchedule.trafficDelay || 0)).toFixed(0)} min
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Carbon Emissions</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{schedule.route.carbonEmissions.toFixed(0)} kg</span>
                    <DifferenceIndicator value={carbonDiff} unit=" kg" positive="bad" />
                    <span className="text-sm font-semibold text-accent">
                      {simulatedSchedule.route.carbonEmissions.toFixed(0)} kg
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trucks Needed</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{schedule.trucksNeeded}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-accent">{simulatedSchedule.trucksNeeded}</span>
                  </div>
                </div>
              </div>
            </Card>

            {simulatedSchedule.alerts.length > 0 && (
              <Card className="p-4 border-destructive/30">
                <p className="text-sm font-semibold text-destructive mb-2">New Alerts</p>
                <div className="space-y-1">
                  {simulatedSchedule.alerts.map(alert => (
                    <p key={alert.id} className="text-xs text-muted-foreground">• {alert.message}</p>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (onApplyChanges && simulatedSchedule) {
                onApplyChanges(simulatedSchedule);
              }
              onOpenChange(false);
            }}
            className="bg-accent hover:bg-accent-light"
          >
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
