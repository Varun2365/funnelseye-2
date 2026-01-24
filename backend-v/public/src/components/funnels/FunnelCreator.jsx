import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

import { useToast } from "../../contexts/ToastContext";
import { templates, templateCategories } from "../../funnels/funnel-templates";

const FunnelCreator = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAudience: "customer",
    category: "",
    templateKey: "",
    funnelUrl: "",
  });

  /* ---------------- Helpers ---------------- */

  const generateSlug = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  useEffect(() => {
    if (formData.name) {
      setFormData((prev) => ({
        ...prev,
        funnelUrl: generateSlug(formData.name),
      }));
    }
  }, [formData.name]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.description)) {
      showToast("Please fill all required fields", "warning");
      return;
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  /* ---------------- Selections ---------------- */

  const selectCategory = (id) => {
    setSelectedCategory(id);
    updateField("category", id);
    setTemplateModalOpen(true);
  };

  const selectTemplate = (key) => {
    setSelectedTemplate(key);
    updateField("templateKey", key);
    setTemplateModalOpen(false);
    setStep(4);
  };

  /* ---------------- Create Funnel ---------------- */

  const createFunnel = async () => {
    try {
      setCreating(true);

      await new Promise((r) => setTimeout(r, 1500));

      showToast("Funnel created successfully", "success");

      navigate(
        `/funnels/builder/new/${formData.category}/${formData.templateKey}`
      );
    } catch (e) {
      showToast("Failed to create funnel", "error");
    } finally {
      setCreating(false);
    }
  };

  /* ---------------- Render Steps ---------------- */

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div>
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <p className="text-muted-foreground">
                Set up the basics of your funnel
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Funnel Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Target Audience</Label>
                <RadioGroup
                  value={formData.targetAudience}
                  onValueChange={(v) =>
                    updateField("targetAudience", v)
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">Customer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="coach" id="coach" />
                    <Label htmlFor="coach">Coach</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Funnel URL</Label>
                <Input
                  value={formData.funnelUrl}
                  onChange={(e) =>
                    updateField("funnelUrl", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templateCategories.map((cat) => (
              <Card
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className="cursor-pointer hover:shadow-lg transition"
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">{cat.icon}</div>
                  <h3 className="font-medium">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 4:
        return (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Review & Create</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{formData.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Audience</p>
                <Badge>{formData.targetAudience}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Template</p>
                <p>
                  {
                    templates[selectedCategory]?.[selectedTemplate]
                      ?.name
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">URL</p>
                <code>/f/{formData.funnelUrl}</code>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  /* ---------------- Layout ---------------- */

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Create Funnel</h1>
            <p className="text-muted-foreground">
              Build your funnel step by step
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/funnels")}>
            Cancel
          </Button>
        </div>

        <Progress value={(step / 4) * 100} />

        <Card>
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={prevStep}
          >
            Previous
          </Button>

          {step < 3 && (
            <Button onClick={nextStep}>Next</Button>
          )}

          {step === 4 && (
            <Button onClick={createFunnel} disabled={creating}>
              {creating ? "Creating..." : "Create Funnel"}
            </Button>
          )}
        </div>
      </div>

      {/* Template Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Select Template</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates[selectedCategory] ? (
              Object.entries(templates[selectedCategory]).map(
                ([key, tpl]) => (
                  <Card
                    key={key}
                    className="cursor-pointer hover:shadow-lg"
                    onClick={() => selectTemplate(key)}
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="h-24 bg-muted rounded flex items-center justify-center text-3xl">
                        🎨
                      </div>
                      <h4 className="font-medium">{tpl.name}</h4>
                      <Badge variant="secondary">{tpl.category}</Badge>
                    </CardContent>
                  </Card>
                )
              )
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No templates available
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setTemplateModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FunnelCreator;
