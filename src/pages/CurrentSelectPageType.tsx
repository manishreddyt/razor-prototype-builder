import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CurrentSelectPageType = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate("/payment-pages-current")}
          className="text-white hover:text-white/80"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Header */}
      <div className="text-center pt-4 pb-8">
        <h1 className="text-2xl font-bold text-white">Select page of your choice</h1>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-start justify-center gap-8 px-8 pb-10">
        {/* Payment Page Card */}
        <div className="w-[420px]">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              {/* Preview image area */}
              <div className="bg-muted rounded-lg h-56 relative overflow-hidden mb-5 border">
                <div className="flex h-full p-3 gap-2">
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary shrink-0" />
                      <div className="h-1.5 w-12 bg-muted-foreground/20 rounded" />
                    </div>
                    {[85, 60, 100, 92, 85, 96, 70, 100, 88, 75].map((w, i) => (
                      <div key={i} className={`h-1 bg-muted-foreground/20 rounded mb-1`} style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="w-[140px] shrink-0 flex flex-col">
                    <div className="h-2 w-[72px] bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-0.5 w-5 bg-primary mb-2" />
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-1 mb-2">
                        <div className="w-5 h-4 rounded bg-muted-foreground/20 shrink-0" />
                        <div className="flex-1">
                          <div className="h-1 w-4/5 bg-muted-foreground/20 rounded mb-1" />
                          <div className="h-1 w-1/2 bg-muted-foreground/20 rounded" />
                        </div>
                      </div>
                    ))}
                    <div className="h-1 w-7 bg-muted-foreground/20 rounded mb-1" />
                    <div className="h-3 w-full rounded border mb-2" />
                    <div className="h-1 w-7 bg-muted-foreground/20 rounded mb-1" />
                    <div className="h-3 w-full rounded border mb-3" />
                    <div className="h-4 w-full bg-primary rounded" />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">Payment page</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Setup your own custom branded page. Collect payments for:
              </p>
              <p className="text-xs text-muted-foreground/60 mb-5">
                Events & tickets &bull; Donations &bull; Fees &bull; Courses & more
              </p>
              <Button onClick={() => navigate("/payment-pages-current/create")}>
                Select Payment page
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Razorpay Webstore Card */}
        <div className="w-[420px]">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <div className="bg-muted rounded-lg h-56 relative overflow-hidden flex items-center justify-center mb-5 border">
                <div className="absolute p-4">
                  <div className="h-3 w-32 bg-muted-foreground/20 rounded mb-3" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-[48%] bg-muted rounded-lg border p-2">
                        <div className="h-16 w-full bg-background rounded mb-2" />
                        <div className="h-2 w-3/4 bg-muted-foreground/20 rounded mb-1" />
                        <div className="h-2 w-1/2 bg-muted-foreground/20 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs text-muted-foreground">Catalogue Preview</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Razorpay Webstore</h3>
                <Badge variant="secondary">Beta</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Showcase products on your online Razorpay Webstore and start accepting orders.
              </p>
              <p className="text-xs text-muted-foreground/60 mb-5">
                Add multiple images and detailed descriptions for your products & deliver...
              </p>
              <Button variant="outline" onClick={() => toast.info("Razorpay Webstore coming soon")}>
                Explore Webstore
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CurrentSelectPageType;
