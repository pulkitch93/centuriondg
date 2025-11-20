import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import NewSite from "./pages/NewSite";
import Scheduler from "./pages/Scheduler";
import ScheduleDetail from "./pages/ScheduleDetail";
import MaterialsHub from "./pages/MaterialsHub";
import MaterialProfile from "./pages/MaterialProfile";
import Haulers from "./pages/Haulers";
import Dispatches from "./pages/Dispatches";
import DriverMobile from "./pages/DriverMobile";
import LiveTracking from "./pages/LiveTracking";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import NotFound from "./pages/NotFound";
import OperationsCenter from "./pages/OperationsCenter";
import AIAssistant from "./pages/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/sites/new" element={<NewSite />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/schedule/:id" element={<ScheduleDetail />} />
          <Route path="/materials" element={<MaterialsHub />} />
          <Route path="/materials/:id" element={<MaterialProfile />} />
          <Route path="/haulers" element={<Haulers />} />
          <Route path="/dispatches" element={<Dispatches />} />
          <Route path="/driver-mobile/:ticketId" element={<DriverMobile />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/performance" element={<PerformanceDashboard />} />
          <Route path="/operations" element={<OperationsCenter />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
