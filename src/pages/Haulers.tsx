import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, TrendingUp, Award, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { schedulerStorage } from '@/lib/schedulerStorage';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { Hauler } from '@/types/scheduler';
import { Driver } from '@/types/dispatch';
import { PageHeader } from '@/components/PageHeader';

export default function Haulers() {
  const navigate = useNavigate();
  const [haulers, setHaulers] = useState<Hauler[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    setHaulers(schedulerStorage.getHaulers());
    setDrivers(dispatchStorage.getDrivers());
  }, []);

  const getDriverCountForHauler = (haulerId: string) => {
    return drivers.filter(d => d.haulerId === haulerId).length;
  };

  const getAvailableDrivers = (haulerId: string) => {
    return drivers.filter(d => d.haulerId === haulerId && d.status === 'available').length;
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader 
          title="Hauler Network" 
          description="Manage trucking partners and drivers"
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Haulers</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{haulers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Haulers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {haulers.filter(h => h.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {drivers.filter(d => d.status === 'available').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Haulers List */}
        <Tabs defaultValue="haulers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="haulers">Haulers</TabsTrigger>
            <TabsTrigger value="drivers">All Drivers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="haulers" className="space-y-4 mt-6">
            {haulers.map(hauler => {
              const driverCount = getDriverCountForHauler(hauler.id);
              const availableCount = getAvailableDrivers(hauler.id);
              
              return (
                <Card key={hauler.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Truck className="h-6 w-6 text-primary" />
                          <h3 className="text-xl font-semibold">{hauler.name}</h3>
                          <Badge variant={hauler.status === 'active' ? 'default' : 'secondary'}>
                            {hauler.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Reliability</p>
                            <p className={`text-lg font-semibold ${getReliabilityColor(hauler.reliabilityScore)}`}>
                              {hauler.reliabilityScore}%
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Fleet Size</p>
                            <p className="text-lg font-semibold">{hauler.trucksAvailable} trucks</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Drivers</p>
                            <p className="text-lg font-semibold">{driverCount} total</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Available Now</p>
                            <p className="text-lg font-semibold text-green-600">{availableCount}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Cost Per Mile</p>
                            <p className="text-lg font-semibold">${hauler.costPerMile.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {/* Drivers for this hauler */}
                        {driverCount > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Drivers:</p>
                            <div className="flex flex-wrap gap-2">
                              {drivers
                                .filter(d => d.haulerId === hauler.id)
                                .map(driver => (
                                  <Badge key={driver.id} variant="outline" className="flex items-center gap-1">
                                    {driver.name}
                                    <span className={`ml-1 w-2 h-2 rounded-full ${
                                      driver.status === 'available' ? 'bg-green-500' :
                                      driver.status === 'on-job' ? 'bg-yellow-500' : 'bg-gray-400'
                                    }`} />
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="drivers" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map(driver => {
                const hauler = haulers.find(h => h.id === driver.haulerId);
                
                return (
                  <Card key={driver.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{driver.name}</h3>
                          <p className="text-sm text-muted-foreground">{hauler?.name}</p>
                        </div>
                        <Badge variant={
                          driver.status === 'available' ? 'default' :
                          driver.status === 'on-job' ? 'secondary' : 'outline'
                        }>
                          {driver.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>{driver.truckType} - {driver.licensePlate}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{driver.phone}</span>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-1">Certifications:</p>
                          <div className="flex flex-wrap gap-1">
                            {driver.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2 flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Performance</span>
                          <span className={`font-semibold ${getReliabilityColor(driver.performanceScore)}`}>
                            {driver.performanceScore}/100
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Capacity</span>
                          <span className="font-semibold">{driver.truckCapacity} CY</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
