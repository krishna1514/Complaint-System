"use client";
import { useState, useRef } from "react";
import { Sparkles, Send, CheckCircle2, Upload, X, Loader2 } from "lucide-react";
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
import { complaintsApi, uploadApi } from "@/lib/api";
import { DEPARTMENT_KEYWORDS } from "@/lib/helpers";

/* -------------------- CONSTANTS -------------------- */

type Department = "IT" | "Electrical" | "Maintenance" | "Cleaning" | "General";

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

// Keyword → department mapping for image filename analysis
const IMAGE_KEYWORDS: Record<string, Department> = {};
Object.entries(DEPARTMENT_KEYWORDS).forEach(([dept, keywords]) => {
  keywords.forEach((kw) => {
    IMAGE_KEYWORDS[kw] = dept as Department;
  });
});

/* -------------------- COMPONENT -------------------- */

export default function SubmitComplaints() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState<string>("Medium");
  const [submitting, setSubmitting] = useState(false);

  // Image states
  const [isUploading, setIsUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingStatus, setUploadingStatus] = useState<
    Record<number, { loading: boolean; success?: boolean; error?: string }>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* -------------------- SMART MATCHING (text) -------------------- */

  const suggestedDept = (() => {
    const text = `${title} ${description}`.toLowerCase();
    let bestMatch: { dept: Department; count: number } | null = null;
    for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS) as [
      Department,
      string[],
    ][]) {
      let count = 0;
      for (const keyword of keywords) if (text.includes(keyword)) count++;
      if (count > 0 && (!bestMatch || count > bestMatch.count))
        bestMatch = { dept, count };
    }
    return bestMatch?.dept || null;
  })();

  /* -------------------- IMAGE UPLOAD & ANALYSIS -------------------- */

  const detectDeptFromFilename = (filename: string): Department | null => {
    const lower = filename.toLowerCase();
    for (const [keyword, dept] of Object.entries(IMAGE_KEYWORDS)) {
      if (lower.includes(keyword)) return dept;
    }
    return null;
  };

  const handleImagesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Add new files with previews and reset status
    const startIndex = imageFiles.length;
    const newFiles = [...imageFiles, ...files];
    const newPreviews = [
      ...imagePreviews,
      ...files.map((f) => URL.createObjectURL(f)),
    ];
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setUploadingStatus((prev) => {
      const updated = { ...prev };
      for (let i = 0; i < files.length; i++) {
        updated[startIndex + i] = { loading: true };
      }
      return updated;
    });

    setIsUploading(true);
    const uploaded = [...uploadedUrls];

    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const idx = startIndex + i;
      try {
        const data = await uploadApi.upload(file);
        if (data.success) {
          uploaded.push(data.data.url);
          setUploadingStatus((prev) => ({
            ...prev,
            [idx]: { loading: false, success: true },
          }));
          // Filename analysis
          const detectedDept = detectDeptFromFilename(file.name);
          if (detectedDept && !department) {
            setDepartment(detectedDept);
            toast.info(`Image suggests department: ${detectedDept}`);
          }
        } else {
          setUploadingStatus((prev) => ({
            ...prev,
            [idx]: { loading: false, success: false, error: data.error },
          }));
          toast.error(
            `Failed to upload ${file.name}: ${data.error || "Unknown error"}`,
          );
        }
      } catch (err) {
        setUploadingStatus((prev) => ({
          ...prev,
          [idx]: { loading: false, success: false, error: "Network error" },
        }));
        toast.error(`Upload error for ${file.name}`);
      }
    }

    setUploadedUrls(uploaded);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    const newUrls = [...uploadedUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    newUrls.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setUploadedUrls(newUrls);
    // Remove status for that index and shift later ones
    setUploadingStatus((prev) => {
      const updated: typeof prev = {};
      let shift = 0;
      for (let i = 0; i < imageFiles.length; i++) {
        if (i === index) {
          shift = 1;
          continue;
        }
        updated[i - shift] = prev[i];
      }
      return updated;
    });
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !department || !location || !category) {
      toast.error("Please fill out all required fields.");
      return;
    }
    if (isUploading) {
      toast.error("Please wait for images to finish uploading.");
      return;
    }
    setSubmitting(true);
    const res = await complaintsApi.create({
      title,
      description,
      department,
      category,
      location,
      priority: priority as any,
      attachments: uploadedUrls,
    });
    if (res.success) {
      toast.success("Complaint submitted");
      router.push("/dashboard/complaints");
    } else {
      toast.error(res.error ?? "Submission failed");
    }
    setSubmitting(false);
  };

  /* -------------------- UI -------------------- */

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
          {/* LEFT SIDE */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Complaint details</CardTitle>
                <CardDescription className="text-xs">
                  Be specific so we can route it correctly.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Title, Description, Department, Category, Location, Priority unchanged */}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g. Wi-Fi outage in Block C"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    className="min-h-[140px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select
                      value={department || suggestedDept || ""}
                      onValueChange={setDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
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
                  <Label>Location *</Label>
                  <Input
                    placeholder="Block A · Floor 2"
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
                        className="flex items-center gap-2 border p-2 rounded-md"
                      >
                        <RadioGroupItem value={p} />
                        {p}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Image Upload Section with improved UX */}
                <div className="space-y-2 pt-2">
                  <Label>Attachments (images)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || imageFiles.length >= 5}
                    >
                      <Upload className="h-4 w-4 mr-1" /> Select images
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImagesSelected}
                    />
                    {isUploading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {imagePreviews.map((src, idx) => {
                        const status = uploadingStatus[idx];
                        const isLoading = status?.loading;
                        const isError = status?.success === false;
                        return (
                          <div key={idx} className="relative group">
                            <div className="relative">
                              <img
                                src={src}
                                alt={`preview-${idx}`}
                                className={`w-full h-24 object-cover rounded border ${isError ? "border-red-500 opacity-70" : ""}`}
                              />
                              {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                                </div>
                              )}
                              {isError && !isLoading && (
                                <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded">
                                  <X className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => !isLoading && removeImage(idx)}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition disabled:opacity-0"
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max 5 images. Filename keywords (e.g., &quot;broken
                    chair&quot;) help auto‑detect department.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4" />
                  Smart routing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedDept ? (
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p>Suggested (text): {suggestedDept}</p>
                      {department !== suggestedDept && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setDepartment(suggestedDept)}
                        >
                          Use this
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start typing to get suggestion
                  </p>
                )}
                <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
                  💡 Tip: Upload an image with a filename like
                  &quot;broken-chair.jpg&quot; – we&apos;ll auto‑detect the
                  department from keywords!
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={
                submitting ||
                isUploading ||
                imageFiles.some((_, idx) => uploadingStatus[idx]?.loading)
              }
              className="w-full"
            >
              {(submitting || isUploading) && (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              )}
              {submitting
                ? "Submitting..."
                : isUploading
                  ? "Uploading images..."
                  : "Submit complaint"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
