import { ContactFormConfig, ContactFormField } from "@/types/leads";
import { Product } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ContactFormBuilderProps {
  contactForm: ContactFormConfig;
  products: Product[];
  onUpdate: (config: ContactFormConfig) => void;
}

const defaultFields: ContactFormField[] = [
  { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your name" },
  { id: "email", label: "Email Address", type: "email", required: true, placeholder: "your.email@example.com" },
  { id: "phone", label: "Phone Number", type: "phone", required: false, placeholder: "+91 98765 43210" },
  { id: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help you?" },
];

export const ContactFormBuilder = ({
  contactForm,
  products,
  onUpdate,
}: ContactFormBuilderProps) => {
  const [localConfig, setLocalConfig] = useState<ContactFormConfig>(
    contactForm || {
      enabled: false,
      title: "Get in Touch",
      description: "Have questions? We'd love to hear from you.",
      fields: defaultFields,
      includeInterests: true,
      autoReply: false,
      successMessage: "Thank you! We'll get back to you soon.",
    }
  );

  const handleUpdate = (updates: Partial<ContactFormConfig>) => {
    const updated = { ...localConfig, ...updates };
    setLocalConfig(updated);
    onUpdate(updated);
  };

  const handleAddField = () => {
    const newField: ContactFormField = {
      id: `field-${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
    };
    handleUpdate({ fields: [...localConfig.fields, newField] });
  };

  const handleUpdateField = (index: number, updates: Partial<ContactFormField>) => {
    const fields = [...localConfig.fields];
    fields[index] = { ...fields[index], ...updates };
    handleUpdate({ fields });
  };

  const handleRemoveField = (index: number) => {
    if (localConfig.fields.length <= 1) {
      toast.error("Contact form must have at least one field");
      return;
    }
    handleUpdate({ fields: localConfig.fields.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Form</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the contact form on your website
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="enabled">Enable Contact Form</Label>
          <Switch
            id="enabled"
            checked={localConfig.enabled}
            onCheckedChange={(checked) => handleUpdate({ enabled: checked })}
          />
        </div>
      </div>

      {!localConfig.enabled ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground mb-4">
            Contact form is currently disabled
          </p>
          <Button onClick={() => handleUpdate({ enabled: true })}>
            Enable Contact Form
          </Button>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Form Settings</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={localConfig.title}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  placeholder="e.g., Get in Touch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={localConfig.description}
                  onChange={(e) => handleUpdate({ description: e.target.value })}
                  placeholder="Brief message above the form"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="successMessage">Success Message</Label>
                <Input
                  id="successMessage"
                  value={localConfig.successMessage}
                  onChange={(e) => handleUpdate({ successMessage: e.target.value })}
                  placeholder="Message shown after successful submission"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Include Product Interests</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show checkboxes for products users can indicate interest in
                  </p>
                </div>
                <Switch
                  checked={localConfig.includeInterests}
                  onCheckedChange={(checked) => handleUpdate({ includeInterests: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Auto-Reply Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send automatic confirmation email to submitter
                  </p>
                </div>
                <Switch
                  checked={localConfig.autoReply}
                  onCheckedChange={(checked) => handleUpdate({ autoReply: checked })}
                />
              </div>

              {localConfig.autoReply && (
                <div className="space-y-2 pl-4 border-l-2">
                  <Label htmlFor="autoReplyMessage">Auto-Reply Message</Label>
                  <Textarea
                    id="autoReplyMessage"
                    value={localConfig.autoReplyMessage || ""}
                    onChange={(e) => handleUpdate({ autoReplyMessage: e.target.value })}
                    placeholder="Thanks for reaching out! We'll get back to you within 24 hours."
                    rows={3}
                  />
                </div>
              )}
            </Card>

            {/* Form Fields */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Form Fields</h3>
                <Button variant="outline" size="sm" onClick={handleAddField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-3">
                {localConfig.fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Field label"
                            value={field.label}
                            onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                          />
                          <Select
                            value={field.type}
                            onValueChange={(v) => handleUpdateField(index, { type: v as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          placeholder="Placeholder text"
                          value={field.placeholder}
                          onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                        />
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                              className="rounded"
                            />
                            Required
                          </label>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold mb-4">Preview</h3>
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold mb-2">{localConfig.title}</h4>
                  <p className="text-muted-foreground">{localConfig.description}</p>
                </div>

                {localConfig.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea placeholder={field.placeholder} disabled />
                    ) : field.type === "select" ? (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        disabled
                      />
                    )}
                  </div>
                ))}

                {localConfig.includeInterests && products.filter(p => p.status === "published").length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>I'm interested in:</Label>
                    <div className="space-y-2">
                      {products.filter(p => p.status === "published").slice(0, 3).map((product) => (
                        <label key={product.id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" disabled className="rounded" />
                          {product.title}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full" disabled>
                  Submit
                </Button>

                {localConfig.autoReply && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    You'll receive an automatic confirmation email
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
