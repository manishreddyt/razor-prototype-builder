import { useState } from "react";
import { CustomPage } from "@/data/smartPageTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  GripVertical,
  Edit,
  Home,
  FileText,
  Users,
  Briefcase,
  Mail,
  Info,
  Settings,
  Star,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface CustomPagesManagerProps {
  templatePages: string[];
  customPages: CustomPage[];
  onUpdateCustomPages: (pages: CustomPage[]) => void;
}

const iconOptions = [
  { value: "home", label: "Home", icon: Home },
  { value: "file", label: "Document", icon: FileText },
  { value: "users", label: "Users", icon: Users },
  { value: "briefcase", label: "Business", icon: Briefcase },
  { value: "mail", label: "Contact", icon: Mail },
  { value: "info", label: "Info", icon: Info },
  { value: "settings", label: "Settings", icon: Settings },
  { value: "star", label: "Star", icon: Star },
  { value: "package", label: "Package", icon: Package },
];

const getIconComponent = (iconName: string) => {
  const option = iconOptions.find(o => o.value === iconName);
  return option?.icon || FileText;
};

export const CustomPagesManager = ({
  templatePages,
  customPages,
  onUpdateCustomPages,
}: CustomPagesManagerProps) => {
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddPage = () => {
    const newPage: CustomPage = {
      id: `custom_${Date.now()}`,
      name: "New Page",
      slug: "new-page",
      icon: "file",
      sections: [],
      order: customPages.length,
    };
    setEditingPage(newPage);
    setIsCreating(true);
  };

  const handleSavePage = (page: CustomPage) => {
    if (isCreating) {
      onUpdateCustomPages([...customPages, page]);
      toast.success("Page created successfully");
    } else {
      const updated = customPages.map(p => p.id === page.id ? page : p);
      onUpdateCustomPages(updated);
      toast.success("Page updated successfully");
    }
    setEditingPage(null);
    setIsCreating(false);
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      const filtered = customPages.filter(p => p.id !== pageId);
      // Re-order remaining pages
      const reordered = filtered.map((p, idx) => ({ ...p, order: idx }));
      onUpdateCustomPages(reordered);
      toast.success("Page deleted");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...customPages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    // Update order
    const reordered = newPages.map((p, idx) => ({ ...p, order: idx }));
    onUpdateCustomPages(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pages</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage navigation and custom pages
          </p>
        </div>
        <Button onClick={handleAddPage} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </div>

      <div className="space-y-3">
        {/* Template Pages */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Template Pages
          </p>
          <div className="space-y-2">
            {templatePages.map((pageName, idx) => {
              const Icon = idx === 0 ? Home : FileText;
              return (
                <Card key={pageName} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{pageName}</p>
                      <p className="text-xs text-muted-foreground">
                        Template page • Cannot be deleted
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Template
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Custom Pages */}
        {customPages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Custom Pages
            </p>
            <div className="space-y-2">
              {customPages
                .sort((a, b) => a.order - b.order)
                .map((page, idx) => {
                  const Icon = getIconComponent(page.icon || "file");
                  return (
                    <Card
                      key={page.id}
                      className={`p-3 transition-all ${
                        draggedIndex === idx ? "opacity-50" : ""
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{page.name}</p>
                          <p className="text-xs text-muted-foreground">
                            /{page.slug} • {page.sections.length} section
                            {page.sections.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPage(page);
                              setIsCreating(false);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePage(page.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {customPages.length === 0 && (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">No custom pages yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add custom pages to extend your website
            </p>
            <Button onClick={handleAddPage} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Page
            </Button>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {editingPage && (
        <CustomPageFormDialog
          page={editingPage}
          isCreating={isCreating}
          onSave={handleSavePage}
          onCancel={() => {
            setEditingPage(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
};

interface CustomPageFormDialogProps {
  page: CustomPage;
  isCreating: boolean;
  onSave: (page: CustomPage) => void;
  onCancel: () => void;
}

const CustomPageFormDialog = ({
  page,
  isCreating,
  onSave,
  onCancel,
}: CustomPageFormDialogProps) => {
  const [formData, setFormData] = useState<CustomPage>(page);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Page name is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Page slug is required");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Create Custom Page" : "Edit Custom Page"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Page Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., About Us"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Page Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., about-us"
            />
            <p className="text-xs text-muted-foreground">
              URL: /{formData.slug}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.icon === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, icon: option.value })}
                    className={`p-3 rounded-lg border-2 transition-all hover:border-primary/40 ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <Icon className="h-5 w-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium mb-2">Note</p>
            <p className="text-xs text-muted-foreground">
              Page sections can be added after creating the page. Navigate to the
              page in the preview to add content.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isCreating ? "Create Page" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
