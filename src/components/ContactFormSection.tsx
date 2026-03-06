import { useState } from "react";
import { ContactFormConfig } from "@/types/leads";
import { Product } from "@/types/products";
import { Lead } from "@/types/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContactFormSectionProps {
  config: ContactFormConfig;
  products: Product[];
  siteId: string;
  onLeadCreated?: (lead: Lead) => void;
}

export const ContactFormSection = ({
  config,
  products,
  siteId,
  onLeadCreated,
}: ContactFormSectionProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const publishedProducts = products.filter((p) => p.status === "published");

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleInterestToggle = (productId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (const field of config.fields) {
      if (field.required && !formData[field.id]) {
        toast.error(`Please fill in ${field.label}`);
        return;
      }
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create lead
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      websiteId: siteId,
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone,
      message: formData.message,
      interests: selectedInterests,
      source: "contact-form",
      metadata: formData,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // Save to localStorage
    try {
      const sitesKey = "website-builder-sites";
      const stored = localStorage.getItem(sitesKey);
      if (stored) {
        const sites = JSON.parse(stored);
        const siteIndex = sites.findIndex((s: any) => s.id === siteId);
        if (siteIndex >= 0) {
          if (!sites[siteIndex].leads) {
            sites[siteIndex].leads = [];
          }
          sites[siteIndex].leads.push(lead);
          localStorage.setItem(sitesKey, JSON.stringify(sites));
        }
      }
    } catch (error) {
      console.error("Failed to save lead:", error);
    }

    if (onLeadCreated) {
      onLeadCreated(lead);
    }

    setSubmitting(false);
    setSubmitted(true);
    toast.success(config.successMessage);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({});
      setSelectedInterests([]);
      setSubmitted(false);
    }, 3000);
  };

  if (!config.enabled) {
    return null;
  }

  if (submitted) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-4">{config.successMessage}</p>
            {config.autoReply && config.autoReplyMessage && (
              <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
                <p className="font-medium mb-1">You'll receive a confirmation email shortly</p>
                <p>{config.autoReplyMessage}</p>
              </div>
            )}
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">{config.title}</h2>
            <p className="text-lg text-muted-foreground">{config.description}</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {config.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>

                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={4}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={formData[field.id] || ""}
                      onValueChange={(v) => handleInputChange(field.id, v)}
                      required={field.required}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              {config.includeInterests && publishedProducts.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <Label>I'm interested in learning more about:</Label>
                  <div className="space-y-2">
                    {publishedProducts.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(product.id)}
                          onChange={() => handleInterestToggle(product.id)}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting} size="lg">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>

              {config.autoReply && (
                <p className="text-xs text-center text-muted-foreground">
                  You'll receive an automatic confirmation email after submitting
                </p>
              )}
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};
