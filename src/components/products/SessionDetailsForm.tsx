import { Product, AvailabilitySlot } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface SessionDetailsFormProps {
  formData: Partial<Product>;
  updateFormData: (updates: Partial<Product>) => void;
}

const defaultAvailability: AvailabilitySlot[] = [
  { day: "Monday", startTime: "09:00", endTime: "17:00", enabled: false },
  { day: "Tuesday", startTime: "09:00", endTime: "17:00", enabled: false },
  { day: "Wednesday", startTime: "09:00", endTime: "17:00", enabled: false },
  { day: "Thursday", startTime: "09:00", endTime: "17:00", enabled: false },
  { day: "Friday", startTime: "09:00", endTime: "17:00", enabled: false },
  { day: "Saturday", startTime: "09:00", endTime: "17:00", enabled: false },
  { day: "Sunday", startTime: "09:00", endTime: "17:00", enabled: false },
];

export const SessionDetailsForm = ({ formData, updateFormData }: SessionDetailsFormProps) => {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const availability = formData.availability || defaultAvailability;

  const handleConnectCalendar = (provider: "google" | "microsoft") => {
    // Mock OAuth flow
    setShowCalendarModal(true);
    setTimeout(() => {
      updateFormData({
        calendarConnected: true,
        calendarProvider: provider,
      });
      setShowCalendarModal(false);
    }, 1500);
  };

  const handleDisconnectCalendar = () => {
    updateFormData({
      calendarConnected: false,
      calendarProvider: undefined,
      calendarUrl: undefined,
    });
  };

  const updateAvailability = (index: number, updates: Partial<AvailabilitySlot>) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], ...updates };
    updateFormData({ availability: updated });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h3 className="font-semibold text-lg">Session Details</h3>

      {/* Session Duration */}
      <div className="space-y-2">
        <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
        <Input
          id="sessionDuration"
          type="number"
          placeholder="60"
          value={formData.sessionDuration || ""}
          onChange={(e) => updateFormData({ sessionDuration: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          How long is each session? (e.g., 30, 60, 90 minutes)
        </p>
      </div>

      {/* Calendar Connection */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Calendar Integration</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your calendar to automatically sync availability
              </p>
            </div>
          </div>
          {formData.calendarConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Connected
            </Badge>
          )}
        </div>

        {!formData.calendarConnected ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleConnectCalendar("google")}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Connect Google Calendar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleConnectCalendar("microsoft")}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z" />
                  <path fill="#00a4ef" d="M13 1h10v10H13z" />
                  <path fill="#7fba00" d="M1 13h10v10H1z" />
                  <path fill="#ffb900" d="M13 13h10v10H13z" />
                </svg>
                Connect Microsoft Calendar
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendarUrl">Enter Calendly or Custom Booking URL</Label>
              <div className="flex gap-2">
                <Input
                  id="calendarUrl"
                  type="url"
                  placeholder="https://calendly.com/yourname"
                  value={formData.calendarUrl || ""}
                  onChange={(e) => updateFormData({ calendarUrl: e.target.value })}
                />
                <Button
                  variant="secondary"
                  onClick={() => updateFormData({ calendarProvider: "calendly" })}
                  disabled={!formData.calendarUrl}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">
                  {formData.calendarProvider === "google" && "Google Calendar"}
                  {formData.calendarProvider === "microsoft" && "Microsoft Calendar"}
                  {formData.calendarProvider === "calendly" && "Calendly"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.calendarUrl || "user@example.com"}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleDisconnectCalendar}>
              Disconnect
            </Button>
          </div>
        )}
      </Card>

      {/* Manual Availability (if calendar not connected) */}
      {!formData.calendarConnected && (
        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Weekly Availability</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Set your available hours for each day of the week
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {availability.map((slot, index) => (
              <div key={slot.day} className="flex items-center gap-3 py-2">
                <Switch
                  checked={slot.enabled}
                  onCheckedChange={(checked) => updateAvailability(index, { enabled: checked })}
                />
                <div className="w-24 font-medium text-sm">{slot.day}</div>
                {slot.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateAvailability(index, { startTime: e.target.value })}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateAvailability(index, { endTime: e.target.value })}
                      className="w-32"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Unavailable</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mock Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4 animate-in fade-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Connecting Calendar...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we connect to your calendar
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
