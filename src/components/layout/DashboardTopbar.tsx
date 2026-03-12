import { Search, Bell, HelpCircle, Sparkles, Menu } from "lucide-react";

interface DashboardTopbarProps {
  isAIOpen?: boolean;
  onToggleAI?: () => void;
  onToggleMobileMenu?: () => void;
}

export const DashboardTopbar = ({ isAIOpen, onToggleAI, onToggleMobileMenu }: DashboardTopbarProps) => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Mobile menu button + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden rounded-md p-2 text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search - hidden on mobile, shown on md+ */}
        <div className="hidden md:flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground flex-1 max-w-sm">
          <Search className="h-4 w-4" />
          <span className="truncate">Search products, settings, and more</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onToggleAI}
          className={`hidden md:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            isAIOpen
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Razorpay AI</span>
        </button>
        <button className="hidden md:block rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors relative">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          MR
        </div>
      </div>
    </header>
  );
};
