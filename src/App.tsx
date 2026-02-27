import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Settlements from "./pages/Settlements";
import Reports from "./pages/Reports";
import MagicCheckout from "./pages/MagicCheckout";
import PaymentLinks from "./pages/PaymentLinks";
import PaymentPages from "./pages/PaymentPages";
import CreatePaymentPage from "./pages/CreatePaymentPage";
import PaymentPageEditor from "./pages/PaymentPageEditor";
import Subscriptions from "./pages/Subscriptions";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import SmartPageCreate from "./pages/SmartPageCreate";
import SmartPageEditor from "./pages/SmartPageEditor";
import SmartPageDetail from "./pages/SmartPageDetail";
import SmartPageProductDetail from "./pages/SmartPageProductDetail";
import EmailWorkflows from "./pages/EmailWorkflows";
import Forms from "./pages/Forms";
import Offers from "./pages/Offers";
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
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/magic-checkout" element={<MagicCheckout />} />
          <Route path="/payment-links" element={<PaymentLinks />} />
          <Route path="/payment-pages" element={<PaymentPages />} />
          <Route path="/payment-pages/create" element={<CreatePaymentPage />} />
          <Route path="/payment-pages/editor" element={<PaymentPageEditor />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/website-builder" element={<WebsiteBuilder />} />
          <Route path="/website-builder/create" element={<SmartPageCreate />} />
          <Route path="/website-builder/editor" element={<SmartPageEditor />} />
          <Route path="/website-builder/:id" element={<SmartPageDetail />} />
          <Route path="/website-builder/product" element={<SmartPageProductDetail />} />
          <Route path="/email-workflows" element={<EmailWorkflows />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/customers" element={<CustomerTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
