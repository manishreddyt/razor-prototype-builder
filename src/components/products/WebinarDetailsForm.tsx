import { Product, Speaker, AgendaItem } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Video, Link as LinkIcon, User } from "lucide-react";
import { useState } from "react";

interface WebinarDetailsFormProps {
  formData: Partial<Product>;
  updateFormData: (updates: Partial<Product>) => void;
}

export const WebinarDetailsForm = ({ formData, updateFormData }: WebinarDetailsFormProps) => {
  const [showZoomModal, setShowZoomModal] = useState(false);
  const speakers = formData.speakers || [];
  const agenda = formData.agenda || [];

  const handleConnectZoom = () => {
    setShowZoomModal(true);
    setTimeout(() => {
      updateFormData({
        webinarConnected: true,
        webinarPlatform: "zoom",
      });
      setShowZoomModal(false);
    }, 1500);
  };

  const handleConnectGMeet = () => {
    setShowZoomModal(true);
    setTimeout(() => {
      updateFormData({
        webinarConnected: true,
        webinarPlatform: "gmeet",
      });
      setShowZoomModal(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    updateFormData({
      webinarConnected: false,
      webinarPlatform: undefined,
      webinarUrl: undefined,
    });
  };

  const addSpeaker = () => {
    const newSpeaker: Speaker = {
      id: `speaker-${Date.now()}`,
      name: "",
      title: "",
      bio: "",
      image: "",
      social: {},
    };
    updateFormData({ speakers: [...speakers, newSpeaker] });
  };

  const updateSpeaker = (index: number, updates: Partial<Speaker>) => {
    const updated = [...speakers];
    updated[index] = { ...updated[index], ...updates };
    updateFormData({ speakers: updated });
  };

  const removeSpeaker = (index: number) => {
    updateFormData({ speakers: speakers.filter((_, i) => i !== index) });
  };

  const addAgendaItem = () => {
    const newItem: AgendaItem = {
      id: `agenda-${Date.now()}`,
      time: "",
      title: "",
      description: "",
      duration: 0,
    };
    updateFormData({ agenda: [...agenda, newItem] });
  };

  const updateAgendaItem = (index: number, updates: Partial<AgendaItem>) => {
    const updated = [...agenda];
    updated[index] = { ...updated[index], ...updates };
    updateFormData({ agenda: updated });
  };

  const removeAgendaItem = (index: number) => {
    updateFormData({ agenda: agenda.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h3 className="font-semibold text-lg">Webinar Details</h3>

      {/* Date, Time, Duration */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="webinarDate">Webinar Date</Label>
          <Input
            id="webinarDate"
            type="date"
            value={formData.webinarDate || ""}
            onChange={(e) => updateFormData({ webinarDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="webinarTime">Start Time</Label>
          <Input
            id="webinarTime"
            type="time"
            value={formData.webinarTime || ""}
            onChange={(e) => updateFormData({ webinarTime: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="webinarDuration">Duration (min)</Label>
          <Input
            id="webinarDuration"
            type="number"
            placeholder="90"
            value={formData.webinarDuration || ""}
            onChange={(e) => updateFormData({ webinarDuration: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Platform Connection */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Video className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Webinar Platform</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your Zoom or Google Meet account
              </p>
            </div>
          </div>
          {formData.webinarConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Connected
            </Badge>
          )}
        </div>

        {!formData.webinarConnected ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleConnectZoom}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 8.5A1.5 1.5 0 0 1 3.5 7h11A1.5 1.5 0 0 1 16 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 15.5v-7zm18.5 0l-3 3v-3l3-3v6z" />
                </svg>
                Connect Zoom
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleConnectGMeet}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                </svg>
                Connect Google Meet
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
              <Label htmlFor="webinarUrl">Enter Custom Meeting URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webinarUrl"
                  type="url"
                  placeholder="https://zoom.us/j/123456789 or custom URL"
                  value={formData.webinarUrl || ""}
                  onChange={(e) => updateFormData({ webinarUrl: e.target.value })}
                />
                <Button
                  variant="secondary"
                  onClick={() => updateFormData({ webinarPlatform: "custom" })}
                  disabled={!formData.webinarUrl}
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
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">
                  {formData.webinarPlatform === "zoom" && "Zoom"}
                  {formData.webinarPlatform === "gmeet" && "Google Meet"}
                  {formData.webinarPlatform === "custom" && "Custom Platform"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.webinarUrl || "user@example.com"}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        )}
      </Card>

      {/* Speakers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Speakers</Label>
          <Button variant="outline" size="sm" onClick={addSpeaker}>
            <Plus className="w-4 h-4 mr-2" />
            Add Speaker
          </Button>
        </div>

        {speakers.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No speakers added yet</p>
            <Button variant="outline" size="sm" onClick={addSpeaker}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Speaker
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {speakers.map((speaker, index) => (
              <Card key={speaker.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {speaker.image ? (
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Speaker name"
                        value={speaker.name}
                        onChange={(e) => updateSpeaker(index, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Title/Role"
                        value={speaker.title}
                        onChange={(e) => updateSpeaker(index, { title: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="Profile image URL"
                      value={speaker.image}
                      onChange={(e) => updateSpeaker(index, { image: e.target.value })}
                    />
                    <Textarea
                      placeholder="Short bio"
                      value={speaker.bio}
                      onChange={(e) => updateSpeaker(index, { bio: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpeaker(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Agenda */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Webinar Agenda</Label>
          <Button variant="outline" size="sm" onClick={addAgendaItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {agenda.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-sm text-muted-foreground mb-3">No agenda items yet</p>
            <Button variant="outline" size="sm" onClick={addAgendaItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {agenda.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        type="time"
                        placeholder="Time"
                        value={item.time}
                        onChange={(e) => updateAgendaItem(index, { time: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Duration (min)"
                        value={item.duration || ""}
                        onChange={(e) => updateAgendaItem(index, { duration: Number(e.target.value) })}
                      />
                      <Input
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) => updateAgendaItem(index, { title: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateAgendaItem(index, { description: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAgendaItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mock Connection Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4 animate-in fade-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Connecting Platform...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we connect to your account
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
