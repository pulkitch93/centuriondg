import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Sparkles, Users, TrendingUp, BarChart3, X, MessageCircle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { schedulerStorage } from '@/lib/schedulerStorage';
import { dispatchStorage } from '@/lib/dispatchStorage';
import { geotechStorage } from '@/lib/geotechnicalStorage';
import { operationsStorage } from '@/lib/operationsStorage';

type AssistantMode = 'sales' | 'ops' | 'executive';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>('sales');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages: Record<AssistantMode, string> = {
        sales: "👋 Sales Mode activated. I can help you generate quotes, find optimal fill sources, and estimate costs for new projects. What would you like to know?",
        ops: "👋 Operations Mode activated. I can analyze schedules, predict bottlenecks, and optimize daily operations. How can I assist?",
        executive: "👋 Executive Mode activated. I'll provide performance summaries, margin forecasts, and strategic insights. What metrics would you like to review?"
      };

      setMessages([{
        role: 'assistant',
        content: welcomeMessages[mode],
        timestamp: new Date()
      }]);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (userQuery: string, currentMode: AssistantMode): string => {
    const sites = storage.getSites();
    const schedules = schedulerStorage.getSchedules();
    const dispatches = dispatchStorage.getDispatchTickets();
    const reports = geotechStorage.getReports();
    const jobs = operationsStorage.getJobs();

    const queryLower = userQuery.toLowerCase();

    if (currentMode === 'sales') {
      if (queryLower.includes('quote') || queryLower.includes('cost') || queryLower.includes('estimate')) {
        const exportSites = sites.filter(s => s.type === 'export');
        const avgCost = 4.92;
        const volume = queryLower.match(/(\d+)/)?.[0] || '1000';
        
        return `📊 **Cost Estimate**\n\nFor ${volume} CY of material:\n• Estimated haul cost: $${(parseFloat(volume) * avgCost / 1000).toFixed(2)}K\n• Average rate: $${avgCost}/CY\n• Timeline: ${Math.ceil(parseFloat(volume) / 500)} days with standard fleet\n• Best source: ${exportSites[0]?.name || 'Available upon site analysis'}\n\nWould you like me to generate a detailed proposal?`;
      }

      if (queryLower.includes('source') || queryLower.includes('fill') || queryLower.includes('material')) {
        const location = queryLower.match(/near\s+(\w+)/)?.[1] || 'requested location';
        const exportSites = sites.filter(s => s.type === 'export' && s.status === 'pending');
        const bestMatch = reports.sort((a, b) => b.suitabilityScore - a.suitabilityScore)[0];
        
        if (exportSites.length > 0) {
          const site = exportSites[0];
          return `🎯 **Best Fill Source Match**\n\n**${site.name}**\n• Distance: ~12 miles from ${location}\n• Available volume: ${site.volume?.toLocaleString() || 'TBD'} CY\n• Soil suitability: Score ${bestMatch?.suitabilityScore || 84}\n• Estimated haul cost: $5.10/CY\n• Timeline: 3-4 days with 4 trucks\n\nThis source meets structural fill requirements with excellent accessibility.`;
        }
      }

      if (queryLower.includes('recommend') || queryLower.includes('suggest')) {
        const activeSchedules = schedules.filter(s => s.status === 'scheduled' || s.status === 'in-progress').length;
        return `💡 **Sales Recommendations**\n\n• ${activeSchedules} active projects ready for expansion\n• Average margin: 18.5%\n• Best growth opportunity: Infrastructure fill (high demand)\n• Competitive advantage: Local sourcing reduces costs by 23%\n\nFocus on projects within 15-mile radius for optimal margins.`;
      }
    }

    if (currentMode === 'ops') {
      if (queryLower.includes('schedule') || queryLower.includes('optimize') || queryLower.includes('today')) {
        const activeJobs = jobs.filter(j => j.status !== 'completed');
        const totalTrucks = activeJobs.reduce((sum, j) => sum + j.trucksActive, 0);
        
        return `📋 **Operations Summary**\n\n**Active Jobs:** ${activeJobs.length}\n**Trucks Deployed:** ${totalTrucks}\n**Today's Volume:** ${activeJobs.reduce((sum, j) => sum + j.volumePlanned, 0).toLocaleString()} CY\n\n⚠️ **Recommendations:**\n• Weather alert: Rain expected 2:30 PM - adjust Schedule EX-101\n• Shift 800 CY to morning window\n• Pre-alert hauler for potential delays\n• Traffic bottleneck detected on I-485 (use alternate route)`;
      }

      if (queryLower.includes('bottleneck') || queryLower.includes('delay') || queryLower.includes('risk')) {
        const delayedJobs = jobs.filter(j => j.status === 'delayed');
        return `🚨 **Bottleneck Analysis**\n\n**Current Delays:** ${delayedJobs.length} jobs\n\n**Top Risks:**\n1. Weather impact (40% probability this afternoon)\n2. Traffic congestion on I-485 (add 15 min per trip)\n3. Equipment availability at IM-201\n\n**Mitigation:**\n• Reschedule 2 jobs to tomorrow AM\n• Deploy backup truck from H-01\n• Coordinate with site manager for extended hours`;
      }

      if (queryLower.includes('hauler') || queryLower.includes('truck') || queryLower.includes('driver')) {
        return `🚛 **Fleet Status**\n\n**Active Trucks:** ${jobs.reduce((sum, j) => sum + j.trucksActive, 0)}\n**Available:** ${jobs.reduce((sum, j) => sum + (j.trucksAssigned - j.trucksActive), 0)}\n**Utilization:** 87%\n\n**Performance:**\n• Top performer: Driver #247 (avg 18 loads/day)\n• Optimize: Reduce idle time by 12 min/truck\n• Recommendation: Add 2 trucks to high-demand routes`;
      }
    }

    if (currentMode === 'executive') {
      if (queryLower.includes('summary') || queryLower.includes('performance') || queryLower.includes('week')) {
        const completedJobs = jobs.filter(j => j.status === 'completed');
        const totalVolume = completedJobs.reduce((sum, j) => sum + j.volumeActual, 0);
        const avgCost = 4.92;
        
        return `📈 **Weekly Executive Summary**\n\n**Volume Metrics:**\n• Total moved: ${totalVolume.toLocaleString()} CY\n• Average cost: $${avgCost}/CY\n• Jobs completed: ${completedJobs.length}\n\n**Financial Impact:**\n• Revenue: $${(totalVolume * 6.5 / 1000).toFixed(1)}K\n• Savings vs landfill: $${(totalVolume * 1.29 / 1000).toFixed(1)}K\n• Margin: 18.5%\n\n**Sustainability:**\n• Carbon saved: ${(totalVolume * 0.34 / 1000).toFixed(1)} tons\n• Local matching rate: 76%`;
      }

      if (queryLower.includes('forecast') || queryLower.includes('margin') || queryLower.includes('profit')) {
        return `💰 **Margin Forecast**\n\n**Q4 Projection:**\n• Expected margin: 19.2% (↑0.7%)\n• Volume growth: 15%\n• Cost efficiency: +$42K\n\n**Key Drivers:**\n• Improved route optimization\n• Better source matching\n• Reduced landfill dependency\n\n**Risks:**\n• Fuel price volatility (monitor)\n• Weather delays in Dec\n• Equipment maintenance cycle`;
      }

      if (queryLower.includes('warning') || queryLower.includes('alert') || queryLower.includes('overrun')) {
        const avgPlanned = jobs.reduce((sum, j) => sum + j.volumePlanned, 0) / jobs.length;
        const avgActual = jobs.reduce((sum, j) => sum + j.volumeActual, 0) / jobs.length;
        const variance = ((avgActual - avgPlanned) / avgPlanned * 100).toFixed(1);
        
        return `⚠️ **Cost Monitoring Dashboard**\n\n**Current Status:** ✅ On track\n\n**Volume Variance:** ${variance}%\n**Budget Status:** 94.2% of allocation\n**Risk Level:** Low\n\n**Early Warnings:**\n• Project EX-101: 8% over estimate (review)\n• Hauler rates up 3% (negotiate)\n• Equipment maintenance due Q1\n\n**Action Items:**\n1. Review high-variance projects\n2. Lock in Q1 hauler contracts\n3. Schedule preventive maintenance`;
      }

      if (queryLower.includes('carbon') || queryLower.includes('sustainability') || queryLower.includes('environmental')) {
        const totalVolume = jobs.reduce((sum, j) => sum + j.volumeActual, 0);
        const carbonSaved = totalVolume * 0.34 / 1000;
        
        return `🌱 **Sustainability Impact**\n\n**Carbon Reduction:**\n• Total saved: ${carbonSaved.toFixed(1)} tons CO₂\n• Equivalent: ${Math.round(carbonSaved * 112)} trees planted\n• Local matching: 76% (↑5% vs last quarter)\n\n**Benefits:**\n• Reduced haul distance: avg 8.2 miles vs 23 miles (landfill)\n• Circular economy: ${((totalVolume / (totalVolume + 5000)) * 100).toFixed(1)}% diversion rate\n• Community impact: Supporting ${sites.length} local projects\n\n**Goal:** 90% local matching by Q2 2024`;
      }
    }

    const defaultResponses: Record<AssistantMode, string> = {
      sales: "I can help with quotes, source recommendations, cost estimates, and project proposals. Could you provide more details about what you're looking for?",
      ops: "I can analyze schedules, predict bottlenecks, optimize routes, and summarize daily operations. What specific operational challenge are you facing?",
      executive: "I can provide performance summaries, margin forecasts, cost warnings, and sustainability metrics. Which area would you like to explore?"
    };

    return defaultResponses[currentMode];
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    setTimeout(() => {
      const response = generateResponse(userMessage.content, mode);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 800);
  };

  const getModeIcon = (m: AssistantMode) => {
    switch (m) {
      case 'sales': return <Users className="h-4 w-4" />;
      case 'ops': return <TrendingUp className="h-4 w-4" />;
      case 'executive': return <BarChart3 className="h-4 w-4" />;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-2 border-primary/20 relative group"
          >
            <Sparkles className="h-7 w-7 animate-pulse-subtle" />
            <span className="absolute -top-8 right-0 text-xs font-medium bg-accent text-accent-foreground px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              AI Assistant
            </span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 z-50">
      <Card className="border-border/50 shadow-2xl bg-gradient-to-br from-card to-card/80">
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary to-accent text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="font-semibold">AI Assistant</span>
              <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">LIVE</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as AssistantMode)}>
              <TabsList className="grid w-full grid-cols-3 bg-primary-foreground/10">
                <TabsTrigger value="sales" className="gap-1 text-xs data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
                  {getModeIcon('sales')}
                  Sales
                </TabsTrigger>
                <TabsTrigger value="ops" className="gap-1 text-xs data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
                  {getModeIcon('ops')}
                  Ops
                </TabsTrigger>
                <TabsTrigger value="executive" className="gap-1 text-xs data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
                  {getModeIcon('executive')}
                  Exec
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <ScrollArea className="h-96 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs font-medium">AI</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${mode} questions...`}
              disabled={isProcessing}
              className="text-sm"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isProcessing} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
