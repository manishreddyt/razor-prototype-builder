import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
      { icon: FileText, label: "Payment Pages", path: "/payment-pages" },
      { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
    ],
  },
  {
    title: "TOOLS",
    items: [
      { icon: Globe, label: "Smart Pages", path: "/website-builder", badge: "new" },
      { icon: Mail, label: "Workflows", path: "/email-workflows" },
      { icon: Plug, label: "Connectors", path: "/connectors" },
      { icon: ClipboardList, label: "Forms", path: "/forms" },
      { icon: MessageCircle, label: "Agents", path: "/agents", badge: "new" },
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

export const DashboardSidebar = () => {
  const location = useLocation();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="flex w-60 flex-col border-r border-sidebar-border bg-sidebar overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <span className="text-base font-semibold text-foreground">Creator Commerce</span>
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
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-5 py-3">
        <button className="flex w-full items-center gap-2 text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors">
          <span className="text-xs">⚙️</span>
          <span>Account & Settings</span>
        </button>
      </div>
    </aside>
  );
};
