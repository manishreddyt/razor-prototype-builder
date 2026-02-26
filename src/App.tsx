import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PaymentLinks from "./pages/PaymentLinks";
import PaymentPages from "./pages/PaymentPages";
import Subscriptions from "./pages/Subscriptions";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import Receipts from "./pages/Receipts";
import CustomerTracker from "./pages/CustomerTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/payment-links" element={<PaymentLinks />} />
          <Route path="/payment-pages" element={<PaymentPages />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/website-builder" element={<WebsiteBuilder />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/customers" element={<CustomerTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
