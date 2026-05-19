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
import PaymentPagePublic from "./pages/PaymentPagePublic";
import PaymentPageManage from "./pages/PaymentPageManage";
import PaymentPagesCurrent from "./pages/PaymentPagesCurrent";
import CurrentSelectPageType from "./pages/CurrentSelectPageType";
import CurrentCreatePaymentPage from "./pages/CurrentCreatePaymentPage";
import CurrentPagePublished from "./pages/CurrentPagePublished";
import CurrentPaymentPageDetails from "./pages/CurrentPaymentPageDetails";
import Subscriptions from "./pages/Subscriptions";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import SmartPageCreate from "./pages/SmartPageCreate";
import SmartPageEditor from "./pages/SmartPageEditor";
import SmartPageDetail from "./pages/SmartPageDetail";
import SmartPageProductDetail from "./pages/SmartPageProductDetail";
import SmartPagePublic from "./pages/SmartPagePublic";
import MarketingCampaigns from "./pages/MarketingCampaigns";
import SessionCommunications from "./pages/SessionCommunications";
import CoachingManage from "./pages/CoachingManage";
import CoachingBooking from "./pages/CoachingBooking";
import TestPage from "./pages/TestPage";
import WebinarChat from "./pages/WebinarChat";
import Connectors from "./pages/Connectors";
import Offers from "./pages/Offers";
import CustomerTracker from "./pages/CustomerTracker";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import AppMarketplace from "./pages/AppMarketplace";
import AppDetail from "./pages/AppDetail";
import SimpleLMSApp from "./pages/apps/CourseGraphyApp";
import GraphyApp from "./pages/apps/GraphyApp";
import ZapierApp from "./pages/apps/ZapierApp";
import InstalledApp from "./pages/apps/InstalledApp";
import AIAppBuilder from "./pages/AIAppBuilder";
import AIAppBuilderCreate from "./pages/AIAppBuilderCreate";
import AIAppBuilderEditor from "./pages/AIAppBuilderEditor";
import AIAppBuilderDetail from "./pages/AIAppBuilderDetail";
import Orders from "./pages/Orders";
import AccountSettings from "./pages/AccountSettings";
import ReceiptsSettings from "./pages/ReceiptsSettings";
import PaymentLinksSettings from "./pages/PaymentLinksSettings";
import NotFound from "./pages/NotFound";
import { PaymentLinkCheckout } from "./components/PaymentLinkCheckout";
import { PaymentSuccess } from "./components/PaymentSuccess";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};
import { seedOrderData } from "./lib/orderSeedData";
import { seedDemoStore, seedBiolinkShop } from "./lib/storeSeedData";
import { seedCoachingPage } from "./lib/coachingSeedData";

const queryClient = new QueryClient();

const App = () => {
  // Seed demo data on app initialization
  useEffect(() => {
    console.log("🚀 App initialized - checking for demo data...");
    try {
      const store = seedDemoStore();
      const biolinkShop = seedBiolinkShop();
      const orders = seedOrderData();
      const coachingPage = seedCoachingPage();
      if (orders) {
        console.log(`📦 Total orders seeded: ${orders.length}`);
      }
      if (coachingPage) {
        console.log(`🎯 Demo coaching page created: ${coachingPage.name}`);
      }
    } catch (error) {
      console.error("❌ Error seeding data:", error);
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/magic-checkout" element={<MagicCheckout />} />
          <Route path="/payment-links" element={<PaymentLinks />} />
          <Route path="/payment-links/settings" element={<PaymentLinksSettings />} />
          <Route path="/pay/:linkId" element={<PaymentLinkCheckout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-pages" element={<PaymentPages />} />
          <Route path="/payment-pages/create" element={<CreatePaymentPage />} />
          <Route path="/payment-pages/editor" element={<PaymentPageEditor />} />
          <Route path="/payment-pages/manage" element={<PaymentPageManage />} />
          <Route path="/payment-pages-current" element={<PaymentPagesCurrent />} />
          <Route path="/payment-pages-current/select" element={<CurrentSelectPageType />} />
          <Route path="/payment-pages-current/create" element={<CurrentCreatePaymentPage />} />
          <Route path="/payment-pages-current/published" element={<CurrentPagePublished />} />
          <Route path="/payment-pages-current/details/:pageId" element={<CurrentPaymentPageDetails />} />
          <Route path="/payment/:slug" element={<PaymentPagePublic />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/website-builder" element={<WebsiteBuilder />} />
          <Route path="/website-builder/create" element={<SmartPageCreate />} />
          <Route path="/website-builder/webinar/chat" element={<WebinarChat />} />
          <Route path="/connectors" element={<Connectors />} />
          <Route path="/website-builder/editor" element={<SmartPageEditor />} />
          <Route path="/website-builder/:id" element={<SmartPageDetail />} />
          <Route path="/website-builder/product" element={<SmartPageProductDetail />} />
          <Route path="/coaching/manage" element={<CoachingManage />} />
          <Route path="/coaching/book" element={<CoachingBooking />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/s/:slug/:pageSlug" element={<SmartPagePublic />} />
          <Route path="/s/:slug" element={<SmartPagePublic />} />
          <Route path="/marketing-campaigns" element={<MarketingCampaigns />} />
          <Route path="/communications/:productId" element={<SessionCommunications />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/customers" element={<CustomerTracker />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:agentId" element={<AgentDetail />} />
          <Route path="/app-marketplace" element={<AppMarketplace />} />
          <Route path="/app-marketplace/:appId" element={<AppDetail />} />
          <Route path="/apps/simple-lms" element={<SimpleLMSApp />} />
          <Route path="/apps/graphy" element={<GraphyApp />} />
          <Route path="/apps/zapier" element={<ZapierApp />} />
          <Route path="/apps/emergent" element={<AIAppBuilder />} />
          <Route path="/apps/emergent/create" element={<AIAppBuilderCreate />} />
          <Route path="/apps/emergent/editor" element={<AIAppBuilderEditor />} />
          <Route path="/apps/emergent/:id" element={<AIAppBuilderDetail />} />
          <Route path="/apps/:appId" element={<InstalledApp />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/account-settings/receipts" element={<ReceiptsSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
