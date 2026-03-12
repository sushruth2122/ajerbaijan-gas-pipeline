import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import DigitalTwin from "./pages/DigitalTwin";
import SmartMeters from "./pages/SmartMeters";
import Revenue from "./pages/Revenue";
import Safety from "./pages/Safety";
import CustomerIntelligence from "./pages/CustomerIntelligence";
import Workforce from "./pages/Workforce";
import AssetManagement from "./pages/AssetManagement";
import AlertsCenter from "./pages/AlertsCenter";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/smart-meters" element={<SmartMeters />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/customers" element={<CustomerIntelligence />} />
            <Route path="/workforce" element={<Workforce />} />
            <Route path="/assets" element={<AssetManagement />} />
            <Route path="/alerts" element={<AlertsCenter />} />
            <Route path="/settings" element={<SystemSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
