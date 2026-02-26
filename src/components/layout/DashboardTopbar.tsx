import { Search, Bell, HelpCircle } from "lucide-react";

export const DashboardTopbar = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground w-80">
        <Search className="h-4 w-4" />
        <span>Search products, settings, and more</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
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
