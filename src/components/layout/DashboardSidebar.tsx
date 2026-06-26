import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeftRight,
  Landmark,
  BarChart3,
  Sparkles,
  Link2,
  FileText,
  CreditCard,
  Globe,
  Mail,
  Users,
  Tag,
  ClipboardList,
  MessageCircle,
  LayoutGrid,
  Plug,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  GraduationCap,
  Heart,
  BookOpen,
  Layers,
  Box,
  Zap,
  Megaphone,
  Package,
} from "lucide-react";

const navSections = [
  {
    items: [
      { icon: Home, label: "Home", path: "/" },
      { icon: ArrowLeftRight, label: "Transactions", path: "/transactions" },
      { icon: Landmark, label: "Settlements", path: "/settlements" },
      { icon: BarChart3, label: "Reports", path: "/reports" },
    ],
  },
  {
    title: "PAYMENT PRODUCTS",
    items: [
      { icon: Sparkles, label: "Magic Checkout", path: "/magic-checkout" },
      { icon: Link2, label: "Payment Links", path: "/payment-links" },
      { icon: Globe, label: "Payment Pages", path: "/website-builder", badge: "AI" },
      { icon: FileText, label: "Payment Pages", path: "/payment-pages-current", badge: "Current" },
      { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
    ],
  },
  {
    title: "TOOLS",
    items: [
      { icon: Megaphone, label: "Campaigns", path: "/marketing-campaigns" },
      { icon: ShoppingBag, label: "App Store", path: "/app-marketplace" },
      { icon: MessageCircle, label: "Agents", path: "/agents" },
      { icon: Plug, label: "Connectors", path: "/connectors" },
    ],
  },
  {
    title: "CUSTOMER PRODUCTS",
    items: [
      { icon: Users, label: "Customers", path: "/customers" },
      { icon: Tag, label: "Offers", path: "/offers" },
      { icon: LayoutGrid, label: "Developers", path: "/developers" },
    ],
  },
];

const installedAppMeta: Record<string, { icon: React.ElementType; label: string; path: string }> = {
  "simple-lms": { icon: GraduationCap, label: "Simple LMS", path: "/apps/simple-lms" },
  "graphy": { icon: GraduationCap, label: "Graphy", path: "/apps/graphy" },
  teachable: { icon: BookOpen, label: "Teachable", path: "/apps/teachable" },
  thinkific: { icon: Layers, label: "Thinkific", path: "/apps/thinkific" },
  podia: { icon: Box, label: "Podia", path: "/apps/podia" },
  zapier: { icon: Zap, label: "Zapier", path: "/apps/zapier" },
};

// Built-in apps that always appear under "Installed Apps"
const builtInApps = [
  { icon: Sparkles, label: "Emergent", path: "/apps/emergent" },
];

interface DashboardSidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const DashboardSidebar = ({ isMobileMenuOpen, onCloseMobileMenu }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [installedApps, setInstalledApps] = useState<string[]>(
    JSON.parse(localStorage.getItem("marketplace-installed-apps") || "[]")
  );

  useEffect(() => {
    const handler = () => {
      setInstalledApps(JSON.parse(localStorage.getItem("marketplace-installed-apps") || "[]"));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className={`
      flex w-60 flex-col border-r border-sidebar-border bg-sidebar overflow-y-auto
      fixed lg:static inset-y-0 left-0 z-50
      transform transition-transform duration-300 ease-in-out
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <span className="text-base font-semibold text-foreground">Razorpay</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navSections.map((section, sIdx) => {
          const isCollapsed = section.title ? collapsedSections[section.title] : false;

          return (
            <div key={sIdx} className="mb-1">
              {section.title && (
                <button
                  onClick={() => toggleSection(section.title!)}
                  className="flex w-full items-center justify-between px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors"
                >
                  {section.title}
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
              {!isCollapsed &&
                section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onCloseMobileMenu?.()}
                      className={`flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="blade-badge-new">{item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
            </div>
          );
        })}
        {/* Installed Apps — always visible */}
        <div className="mb-1">
          <button
            onClick={() => toggleSection("INSTALLED APPS")}
            className="flex w-full items-center justify-between px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors"
          >
            INSTALLED APPS
            {collapsedSections["INSTALLED APPS"] ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {!collapsedSections["INSTALLED APPS"] && (
            <>
              {/* Built-in apps */}
              {builtInApps.map((app) => {
                const isActive = location.pathname === app.path || location.pathname.startsWith(app.path + "/");
                return (
                  <NavLink
                    key={app.path}
                    to={app.path}
                    onClick={() => onCloseMobileMenu?.()}
                    className={`flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-secondary"
                    }`}
                  >
                    <app.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{app.label}</span>
                  </NavLink>
                );
              })}
              {/* Marketplace-installed apps */}
              {installedApps.map((appId) => {
                const meta = installedAppMeta[appId];
                if (!meta) return null;
                const isActive = location.pathname === meta.path;
                return (
                  <NavLink
                    key={appId}
                    to={meta.path}
                    onClick={() => onCloseMobileMenu?.()}
                    className={`flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-secondary"
                    }`}
                  >
                    <meta.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{meta.label}</span>
                  </NavLink>
                );
              })}
            </>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-5 py-3">
        <button
          className="flex w-full items-center gap-2 text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors"
          onClick={() => navigate("/account-settings")}
        >
          <span className="text-xs">⚙️</span>
          <span>Account & Settings</span>
        </button>
      </div>
    </aside>
  );
};
