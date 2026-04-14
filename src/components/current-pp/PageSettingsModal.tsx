import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface PageSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const CurrentPageSettingsModal = ({ open, onClose }: PageSettingsModalProps) => {
  const [pageUrl, setPageUrl] = useState("https://pages.razorpay.com/");
  const [theme, setTheme] = useState("light");
  const [noExpiry, setNoExpiry] = useState(true);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [showCustomMessage, setShowCustomMessage] = useState(true);
  const [showRedirect, setShowRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const handleSave = () => {
    toast.success("Page settings saved!");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Page Settings</DialogTitle>
          <p className="text-sm text-muted-foreground">Configure URL, theme, and post-payment behavior</p>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div>
            <Label>URL of this page</Label>
            <Input value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} placeholder="https://pages.razorpay.com/" className="mt-1.5" />
          </div>

          <div>
            <Label className="mb-2 block">Theme</Label>
            <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Page Expiry Date</h4>
            <div className="flex items-center gap-2 mb-3">
              <Checkbox checked={noExpiry} onCheckedChange={(v) => setNoExpiry(!!v)} id="no-expiry" />
              <Label htmlFor="no-expiry">No Expiry</Label>
            </div>
            {!noExpiry && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Date</Label>
                  <Input value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} placeholder="DD/MM/YYYY" className="mt-1" />
                </div>
                <div className="w-[140px]">
                  <Label>Time</Label>
                  <Input value={expiryTime} onChange={(e) => setExpiryTime(e.target.value)} placeholder="HH:MM" className="mt-1" />
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Action after successful payment?</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox checked={showCustomMessage} onCheckedChange={(v) => { setShowCustomMessage(!!v); if (v) setShowRedirect(false); }} id="custom-msg" />
                <Label htmlFor="custom-msg">Show custom message</Label>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={showRedirect} onCheckedChange={(v) => { setShowRedirect(!!v); if (v) setShowCustomMessage(false); }} id="redirect" />
                  <Label htmlFor="redirect">Redirect to your website</Label>
                </div>
                {showRedirect && (
                  <div className="mt-3 ml-7">
                    <Label>Redirect URL</Label>
                    <Input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://yourwebsite.com/thank-you" className="mt-1" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Get Hyperlink Button</h4>
            <p className="text-xs text-muted-foreground">Embed a payment button on your website that links to this page.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
