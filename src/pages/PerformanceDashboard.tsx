import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Clock, 
  Star, 
  Fuel,
  AlertCircle,
  Users,
  BarChart3,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { storage } from '@/lib/storage';
import { Driver, DispatchTicket } from '@/types/dispatch';
import { Site } from '@/types/site';
import { calculateDriverPerformance, calculatePerformanceTrends, DriverPerformanceMetrics } from '@/lib/performanceMetrics';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PerformanceDashboard() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tickets, setTickets] = useState<DispatchTicket[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [metrics, setMetrics] = useState<DriverPerformanceMetrics[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (drivers.length > 0 && tickets.length > 0) {
      calculateMetrics();
    }
  }, [drivers, tickets, sites]);

  const loadData = () => {
    const allDrivers = dispatchStorage.getDrivers();
    const allTickets = dispatchStorage.getDispatchTickets();
    const allSites = storage.getSites();
    
    setDrivers(allDrivers);
    setTickets(allTickets);
    setSites(allSites);
  };

  const calculateMetrics = () => {
    const driverMetrics = drivers.map(driver => 
      calculateDriverPerformance(driver, tickets, sites)
    );
    setMetrics(driverMetrics);
  };

  const filteredMetrics = selectedDriver === 'all' 
    ? metrics 
    : metrics.filter(m => m.driverId === selectedDriver);

  const performanceTrends = calculatePerformanceTrends(
    selectedDriver === 'all' 
      ? tickets 
      : tickets.filter(t => t.driverId === selectedDriver),
    parseInt(timeRange)
  );

  const totalMetrics = {
    totalDeliveries: metrics.reduce((sum, m) => sum + m.totalDeliveries, 0),
    averageOnTimeRate: metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.onTimeRate, 0) / metrics.length 
      : 0,
    averageRating: metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.averageRating, 0) / metrics.length
      : 0,
    totalVolume: metrics.reduce((sum, m) => sum + m.totalVolume, 0),
  };

  const driverComparison = metrics.map(m => ({
    name: m.driverName,
    onTimeRate: m.onTimeRate,
    rating: m.averageRating,
    deliveries: m.totalDeliveries,
    score: m.performanceScore,
  }));

  const fuelEfficiencyData = metrics
    .filter(m => m.fuelEfficiency > 0)
    .map(m => ({
      name: m.driverName,
      efficiency: m.fuelEfficiency,
    }));

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Performance Dashboard</h1>
            <p className="text-muted-foreground mt-2">Driver metrics and analytics</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => navigate('/dispatches')}>
              Back
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.totalDeliveries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {drivers.length} drivers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.averageOnTimeRate.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>Industry average: 85%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                {totalMetrics.averageRating.toFixed(1)}
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of 5.0 stars
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.totalVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cubic yards delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends (Last {timeRange} Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="onTimeRate" stroke="#3b82f6" name="On-Time Rate (%)" />
                      <Line type="monotone" dataKey="averageRating" stroke="#10b981" name="Avg Rating" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fuel Efficiency by Driver</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fuelEfficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'CY per Gallon', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="efficiency" fill="#10b981" name="Efficiency (CY/gal)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Deliveries & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="deliveries" fill="#3b82f6" name="Deliveries" />
                    <Line yAxisId="right" type="monotone" dataKey="onTimeRate" stroke="#10b981" name="On-Time Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={driverComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#3b82f6" name="Performance Score" />
                    <Bar dataKey="onTimeRate" fill="#10b981" name="On-Time Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map(metric => (
                <Card key={metric.driverId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.driverName}</CardTitle>
                      <Badge className={getScoreBadge(metric.performanceScore)}>
                        {metric.performanceScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deliveries:</span>
                      <span className="font-semibold">{metric.totalDeliveries}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">On-Time:</span>
                      <span className="font-semibold">{metric.onTimeRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-semibold flex items-center gap-1">
                        {metric.averageRating.toFixed(1)}
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Issues:</span>
                      <span className={`font-semibold ${metric.issuesReported > 5 ? 'text-red-600' : ''}`}>
                        {metric.issuesReported}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Individual Tab */}
          <TabsContent value="individual" className="space-y-4 mt-6">
            {selectedDriver === 'all' ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Select a specific driver to view detailed individual metrics
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {filteredMetrics.map(metric => (
                  <div key={metric.driverId} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl">{metric.driverName}</CardTitle>
                            <p className="text-muted-foreground mt-1">Detailed Performance Breakdown</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-4xl font-bold ${getScoreColor(metric.performanceScore)}`}>
                              {metric.performanceScore}
                            </div>
                            <p className="text-sm text-muted-foreground">Performance Score</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Deliveries</p>
                            <p className="text-2xl font-bold">{metric.totalDeliveries}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">On-Time Deliveries</p>
                            <p className="text-2xl font-bold text-green-600">{metric.onTimeDeliveries}</p>
                            <p className="text-xs text-muted-foreground">{metric.onTimeRate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Avg Delivery Time</p>
                            <p className="text-2xl font-bold">{Math.round(metric.averageDeliveryTime)} min</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Customer Rating</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold">{metric.averageRating.toFixed(1)}</p>
                              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
                            <p className="text-2xl font-bold">{metric.totalVolume.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">cubic yards</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Fuel Efficiency</p>
                            <p className="text-2xl font-bold">{metric.fuelEfficiency.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">CY per gallon</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Distance</p>
                            <p className="text-2xl font-bold">{metric.totalDistance.toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">miles</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Issues Reported</p>
                            <p className={`text-2xl font-bold ${metric.issuesReported > 5 ? 'text-red-600' : 'text-green-600'}`}>
                              {metric.issuesReported}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">On-Time Delivery</span>
                                <span className="text-sm font-semibold">{metric.onTimeRate.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all" 
                                  style={{ width: `${metric.onTimeRate}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">Customer Satisfaction</span>
                                <span className="text-sm font-semibold">{(metric.averageRating * 20).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full transition-all" 
                                  style={{ width: `${metric.averageRating * 20}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">Issue-Free Rate</span>
                                <span className="text-sm font-semibold">
                                  {metric.totalDeliveries > 0 
                                    ? ((metric.totalDeliveries - metric.issuesReported) / metric.totalDeliveries * 100).toFixed(0)
                                    : 0}%
                                </span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all" 
                                  style={{ 
                                    width: `${metric.totalDeliveries > 0 
                                      ? (metric.totalDeliveries - metric.issuesReported) / metric.totalDeliveries * 100 
                                      : 0}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Key Achievements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {metric.onTimeRate >= 95 && (
                              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                <Award className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-sm">Exceptional Punctuality</p>
                                  <p className="text-xs text-muted-foreground">{metric.onTimeRate.toFixed(1)}% on-time delivery rate</p>
                                </div>
                              </div>
                            )}
                            {metric.averageRating >= 4.5 && (
                              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-sm">Customer Favorite</p>
                                  <p className="text-xs text-muted-foreground">{metric.averageRating.toFixed(1)} star average rating</p>
                                </div>
                              </div>
                            )}
                            {metric.issuesReported === 0 && metric.totalDeliveries > 0 && (
                              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-sm">Perfect Record</p>
                                  <p className="text-xs text-muted-foreground">No issues reported</p>
                                </div>
                              </div>
                            )}
                            {metric.totalVolume > 1000 && (
                              <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-sm">High Volume Performer</p>
                                  <p className="text-xs text-muted-foreground">{metric.totalVolume.toLocaleString()} CY delivered</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
