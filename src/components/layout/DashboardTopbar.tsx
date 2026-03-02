import { Search, Bell, HelpCircle, Sparkles } from "lucide-react";

interface DashboardTopbarProps {
  isAIOpen?: boolean;
  onToggleAI?: () => void;
}

export const DashboardTopbar = ({ isAIOpen, onToggleAI }: DashboardTopbarProps) => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground w-80">
        <Search className="h-4 w-4" />
        <span>Search products, settings, and more</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleAI}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            isAIOpen
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Razorpay AI
        </button>
        <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          MR
        </div>
      </div>
    </header>
  );
};
