import { useState } from "react";
import { BiolinkProfile, BiolinkSocialLink, SocialPlatform } from "@/types/biolink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Globe,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface BiolinkEditorProps {
  profile: BiolinkProfile;
  onUpdate: (profile: BiolinkProfile) => void;
}

const platformOptions: { value: SocialPlatform; label: string; icon: any }[] = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "tiktok", label: "TikTok", icon: MessageCircle },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "telegram", label: "Telegram", icon: Send },
  { value: "custom", label: "Custom Link", icon: Globe },
];

export const BiolinkEditor = ({ profile, onUpdate }: BiolinkEditorProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  const handleProfileUpdate = (updates: Partial<BiolinkProfile>) => {
    onUpdate({ ...profile, ...updates });
  };

  const handleImageUpload = (field: "profileImage" | "backgroundImage") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          handleProfileUpdate({ [field]: reader.result as string });
          toast.success("Image uploaded successfully");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addSocialLink = (platform: SocialPlatform) => {
    const newLink: BiolinkSocialLink = {
      id: `link-${Date.now()}`,
      platform,
      url: "",
      enabled: true,
      order: profile.socialLinks.length,
    };
    handleProfileUpdate({
      socialLinks: [...profile.socialLinks, newLink],
    });
  };

  const updateSocialLink = (id: string, updates: Partial<BiolinkSocialLink>) => {
    handleProfileUpdate({
      socialLinks: profile.socialLinks.map((link) =>
        link.id === id ? { ...link, ...updates } : link
      ),
    });
  };

  const removeSocialLink = (id: string) => {
    handleProfileUpdate({
      socialLinks: profile.socialLinks.filter((link) => link.id !== id),
    });
  };

  const moveSocialLink = (id: string, direction: "up" | "down") => {
    const index = profile.socialLinks.findIndex((link) => link.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === profile.socialLinks.length - 1)
    ) {
      return;
    }

    const newLinks = [...profile.socialLinks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];

    // Update order values
    newLinks.forEach((link, idx) => {
      link.order = idx;
    });

    handleProfileUpdate({ socialLinks: newLinks });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Biolink Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Create your Linktree-style profile page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="biolink-enabled">Enable Biolink</Label>
          <Switch
            id="biolink-enabled"
            checked={profile.enabled}
            onCheckedChange={(enabled) => handleProfileUpdate({ enabled })}
          />
        </div>
      </div>

      {profile.enabled && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div>
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImageUpload("profileImage")}
                    >
                      Upload Image
                    </Button>
                    {profile.profileImage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleProfileUpdate({ profileImage: undefined })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) =>
                    handleProfileUpdate({ displayName: e.target.value })
                  }
                  placeholder="Your name or brand"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleProfileUpdate({ bio: e.target.value })}
                  placeholder="Tell your audience about yourself..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ""}
                  onChange={(e) =>
                    handleProfileUpdate({ location: e.target.value })
                  }
                  placeholder="City, Country"
                />
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showContactButton">Show Contact Button</Label>
                  <Switch
                    id="showContactButton"
                    checked={profile.showContactButton}
                    onCheckedChange={(checked) =>
                      handleProfileUpdate({ showContactButton: checked })
                    }
                  />
                </div>

                {profile.showContactButton && (
                  <>
                    <div>
                      <Label htmlFor="contactButtonText">Button Text</Label>
                      <Input
                        id="contactButtonText"
                        value={profile.contactButtonText || ""}
                        onChange={(e) =>
                          handleProfileUpdate({ contactButtonText: e.target.value })
                        }
                        placeholder="Get in Touch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={profile.contactEmail || ""}
                        onChange={(e) =>
                          handleProfileUpdate({ contactEmail: e.target.value })
                        }
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={profile.contactPhone || ""}
                        onChange={(e) =>
                          handleProfileUpdate({ contactPhone: e.target.value })
                        }
                        placeholder="+91 1234567890"
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Social Links</Label>
                <Select onValueChange={(value) => addSocialLink(value as SocialPlatform)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Add platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {profile.socialLinks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No social links added yet. Add your first platform above.
                  </p>
                ) : (
                  profile.socialLinks.map((link, index) => {
                    const platform = platformOptions.find(
                      (p) => p.value === link.platform
                    );
                    const Icon = platform?.icon || Globe;

                    return (
                      <Card key={link.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1 mt-2">
                            <button
                              onClick={() => moveSocialLink(link.id, "up")}
                              disabled={index === 0}
                              className="p-1 hover:bg-muted rounded disabled:opacity-30"
                            >
                              <GripVertical className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {platform?.label}
                              </span>
                              <Switch
                                checked={link.enabled}
                                onCheckedChange={(checked) =>
                                  updateSocialLink(link.id, { enabled: checked })
                                }
                                className="ml-auto"
                              />
                            </div>

                            <Input
                              value={link.url}
                              onChange={(e) =>
                                updateSocialLink(link.id, { url: e.target.value })
                              }
                              placeholder={`https://${link.platform}.com/yourprofile`}
                            />

                            {link.platform === "custom" && (
                              <Input
                                value={link.label || ""}
                                onChange={(e) =>
                                  updateSocialLink(link.id, { label: e.target.value })
                                }
                                placeholder="Link label"
                              />
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSocialLink(link.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={profile.theme}
                  onValueChange={(value: "light" | "dark" | "custom") =>
                    handleProfileUpdate({ theme: value })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile.theme === "custom" && (
                <>
                  <div>
                    <Label htmlFor="accentColor">Accent/Gradient Color</Label>
                    <Input
                      id="accentColor"
                      value={profile.accentColor || ""}
                      onChange={(e) =>
                        handleProfileUpdate({ accentColor: e.target.value })
                      }
                      placeholder="from-purple-500 to-pink-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use Tailwind gradient classes (e.g., "from-blue-500 to-purple-600")
                    </p>
                  </div>

                  <div>
                    <Label>Background Image</Label>
                    <div className="space-y-2 mt-2">
                      {profile.backgroundImage && (
                        <img
                          src={profile.backgroundImage}
                          alt="Background"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImageUpload("backgroundImage")}
                        >
                          Upload Background
                        </Button>
                        {profile.backgroundImage && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleProfileUpdate({ backgroundImage: undefined })
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t">
                <Label htmlFor="customHtml">Custom HTML</Label>
                <Textarea
                  id="customHtml"
                  value={profile.customHtml || ""}
                  onChange={(e) =>
                    handleProfileUpdate({ customHtml: e.target.value })
                  }
                  placeholder="<div>Custom HTML content...</div>"
                  rows={5}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add custom HTML at the bottom of your biolink page
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showProducts">Show Products Section</Label>
                <Switch
                  id="showProducts"
                  checked={profile.showProductsSection}
                  onCheckedChange={(checked) =>
                    handleProfileUpdate({ showProductsSection: checked })
                  }
                />
              </div>

              {profile.showProductsSection && (
                <div>
                  <Label htmlFor="productsTitle">Section Title</Label>
                  <Input
                    id="productsTitle"
                    value={profile.productsTitle || ""}
                    onChange={(e) =>
                      handleProfileUpdate({ productsTitle: e.target.value })
                    }
                    placeholder="Featured Products"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your published products will be displayed in a 2-column (mobile) /
                    3-column (desktop) grid
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
