import { Product, CourseModule } from "@/types/products";
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
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface CourseDetailsFormProps {
  formData: Partial<Product>;
  updateFormData: (updates: Partial<Product>) => void;
}

export const CourseDetailsForm = ({ formData, updateFormData }: CourseDetailsFormProps) => {
  const modules = formData.modules || [];
  const whatYouWillLearn = formData.whatYouWillLearn || [];
  const courseIncludes = formData.courseIncludes || [];

  const addModule = () => {
    const newModule: CourseModule = {
      id: `mod-${Date.now()}`,
      title: "",
      description: "",
      lessons: 0,
      duration: "",
      order: modules.length + 1,
    };
    updateFormData({ modules: [...modules, newModule] });
  };

  const updateModule = (index: number, updates: Partial<CourseModule>) => {
    const updated = [...modules];
    updated[index] = { ...updated[index], ...updates };
    updateFormData({ modules: updated });
  };

  const removeModule = (index: number) => {
    updateFormData({ modules: modules.filter((_, i) => i !== index) });
  };

  const addWhatYouWillLearn = () => {
    updateFormData({ whatYouWillLearn: [...whatYouWillLearn, ""] });
  };

  const updateWhatYouWillLearn = (index: number, value: string) => {
    const updated = [...whatYouWillLearn];
    updated[index] = value;
    updateFormData({ whatYouWillLearn: updated });
  };

  const removeWhatYouWillLearn = (index: number) => {
    updateFormData({ whatYouWillLearn: whatYouWillLearn.filter((_, i) => i !== index) });
  };

  const addCourseIncludes = () => {
    updateFormData({ courseIncludes: [...courseIncludes, ""] });
  };

  const updateCourseIncludes = (index: number, value: string) => {
    const updated = [...courseIncludes];
    updated[index] = value;
    updateFormData({ courseIncludes: updated });
  };

  const removeCourseIncludes = (index: number) => {
    updateFormData({ courseIncludes: courseIncludes.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h3 className="font-semibold text-lg">Course Details</h3>

      {/* Basic Course Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Course Duration</Label>
          <Input
            id="duration"
            placeholder="e.g., 12 weeks, 40 hours"
            value={formData.duration || ""}
            onChange={(e) => updateFormData({ duration: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Difficulty Level</Label>
          <Select
            value={formData.level || "beginner"}
            onValueChange={(v) => updateFormData({ level: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Course Format</Label>
        <Select
          value={formData.format || "video"}
          onValueChange={(v) => updateFormData({ format: v as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="text">Text-based</SelectItem>
            <SelectItem value="mixed">Mixed (Video + Text)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Course Curriculum</Label>
          <Button variant="outline" size="sm" onClick={addModule}>
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>

        {modules.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-sm text-muted-foreground mb-3">No modules added yet</p>
            <Button variant="outline" size="sm" onClick={addModule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Module
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {modules.map((module, index) => (
              <Card key={module.id} className="p-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Module title"
                        value={module.title}
                        onChange={(e) => updateModule(index, { title: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Lessons"
                          value={module.lessons || ""}
                          onChange={(e) => updateModule(index, { lessons: Number(e.target.value) })}
                        />
                        <Input
                          placeholder="Duration"
                          value={module.duration}
                          onChange={(e) => updateModule(index, { duration: e.target.value })}
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Module description"
                      value={module.description}
                      onChange={(e) => updateModule(index, { description: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeModule(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* What You'll Learn */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">What Students Will Learn</Label>
          <Button variant="outline" size="sm" onClick={addWhatYouWillLearn}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {whatYouWillLearn.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="e.g., Build responsive websites from scratch"
                value={item}
                onChange={(e) => updateWhatYouWillLearn(index, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeWhatYouWillLearn(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {whatYouWillLearn.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add learning outcomes to show students what they'll achieve
            </p>
          )}
        </div>
      </div>

      {/* Course Includes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Course Includes</Label>
          <Button variant="outline" size="sm" onClick={addCourseIncludes}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {courseIncludes.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="e.g., 50+ hours of video content"
                value={item}
                onChange={(e) => updateCourseIncludes(index, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCourseIncludes(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {courseIncludes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add what's included in the course (videos, resources, certificates, etc.)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
