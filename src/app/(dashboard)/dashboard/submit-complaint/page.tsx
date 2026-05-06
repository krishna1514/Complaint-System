"use client";
import { useState } from "react";
import { Sparkles, Upload, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import DashboardLayout from "@/components/dashboard/layout";
import Header from "@/components/dashboard/header";
import { useRouter } from "next/navigation";
import { complaintsApi } from "@/lib/api";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
const CATEGORIES = [
  "Network",
  "Hardware",
  "Software",
  "Lighting",
  "HVAC",
  "Plumbing",
  "Furniture",
  "Sanitation",
  "Other",
];

export default function SubmitComplaints() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState<string>("Medium");
  const [submitting, setSubmitting] = useState(false);

  const suggestedDept = (() => {
    const text = `${title} ${description}`.toLowerCase();
    if (
      /wifi|network|server|laptop|projector|software|printer|hardware/.test(
        text,
      )
    )
      return "IT";
    if (/light|fan|ac|hvac|switch|power|electric/.test(text))
      return "Electrical";
    if (/leak|tap|chair|table|door|furniture|plumb/.test(text))
      return "Maintenance";
    if (/clean|trash|odor|sanit|wash|spill/.test(text)) return "Cleaning";
    return null;
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !department || !location || !category) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setSubmitting(true);
    complaintsApi
      .create({
        title,
        description,
        department,
        category,
        location,
        priority: priority as any,
      })
      .then((res) => {
        if (res.success) {
          toast.success("Complaint submitted");
          router.push("/dashboard/complaints");
        } else {
          toast.error(res.error ?? "Submission failed");
        }
      })
      .catch(() => toast.error("Network error"))
      .finally(() => setSubmitting(false));
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Header
          title="Submit a complaint"
          description="File a new ticket — our smart router will assign it to the right team."
        />

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Complaint details</CardTitle>
                <CardDescription className="text-xs">
                  Be specific so we can route it correctly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Wi-Fi outage in Block C, 3rd floor"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue, when it started, and any steps you tried…"
                    className="min-h-[140px] resize-y"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Block A · Floor 2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <RadioGroup
                    value={priority}
                    onValueChange={setPriority}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  >
                    {PRIORITIES.map((p) => (
                      <Label
                        key={p}
                        htmlFor={`p-${p}`}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-normal transition-colors hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                      >
                        <RadioGroupItem id={`p-${p}`} value={p} />
                        {p}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart routing and tips (unchanged) */}
          <div className="space-y-6">
            <Card className="border-primary/30 bg-primary/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Smart routing
                </CardTitle>
                <CardDescription className="text-xs">
                  We analyze your description to suggest the right team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suggestedDept ? (
                  <div className="flex items-start gap-3 rounded-md border border-primary/20 bg-background p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Suggested: {suggestedDept}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Based on keywords in your description.
                      </p>
                      {department !== suggestedDept && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs"
                          onClick={() => setDepartment(suggestedDept)}
                        >
                          Use this suggestion
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Start typing a description to see a routing suggestion.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Mention the exact block and floor.</p>
                <p>• Note when the issue started.</p>
                <p>• Add a photo if it helps explain.</p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-1.5"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit complaint"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
