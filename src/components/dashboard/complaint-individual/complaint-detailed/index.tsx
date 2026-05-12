"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Building2,
  MessageSquare,
  CheckCircle2,
  Clock4,
  PlusCircle,
  Send,
  Image as ImageIcon,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  StatusBadge,
  PriorityBadge,
} from "@/components/dashboard/status-badge";
import Link from "next/link";
import NotFound from "@/app/not-found";
import { useComplaint } from "@/hooks/use-complaint";
import { complaintsApi, type Comment, type TimelineEvent } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const TYPE_ICON = {
  created: PlusCircle,
  assigned: User,
  updated: Clock4,
  resolved: CheckCircle2,
  comment: MessageSquare,
} as const;

export default function ComplaintDetailed({ id }: { id: string }) {
  const { complaint, loading, refresh } = useComplaint(id);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch timeline and comments
  useEffect(() => {
    if (!id) return;
    const fetchExtras = async () => {
      const [timelineRes, commentsRes] = await Promise.all([
        complaintsApi.getTimeline(id),
        complaintsApi.getComments(id),
      ]);
      if (timelineRes.success && timelineRes.data)
        setTimeline(timelineRes.data.timeline);
      if (commentsRes.success && commentsRes.data)
        setComments(commentsRes.data.comments);
    };
    fetchExtras();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    const res = await complaintsApi.addComment(id, newComment);
    if (res.success && res.data) {
      setComments((prev) => [...prev, res.data!.comment]);
      setNewComment("");
      toast.success("Comment added");
      const timelineRes = await complaintsApi.getTimeline(id);
      if (timelineRes.success && timelineRes.data)
        setTimeline(timelineRes.data.timeline);
    } else {
      toast.error(res.error ?? "Failed to add comment");
    }
    setPosting(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!complaint) return;
    setUpdatingStatus(true);
    const res = await complaintsApi.update(id, { status: newStatus as any });
    if (res.success) {
      toast.success(`Status updated to ${newStatus}`);
      refresh();
      const timelineRes = await complaintsApi.getTimeline(id);
      if (timelineRes.success && timelineRes.data)
        setTimeline(timelineRes.data.timeline);
    } else {
      toast.error(res.error ?? "Update failed");
    }
    setUpdatingStatus(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) return <NotFound />;

  const attachments = complaint.attachments || [];

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Image Lightbox Modal */}
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Full size"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 -ml-2 gap-1.5"
          >
            <Link href="/dashboard/complaints">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <span>·</span>
          <span className="font-mono text-xs">{complaint.complaintId}</span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {complaint.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {complaint.department}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {complaint.status !== "Resolved" && (
              <Select
                value={complaint.status}
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            )}
            {complaint.status === "Pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const res = await complaintsApi.delete(id);
                  if (res.success) {
                    toast.success("Complaint deleted");
                    window.location.href = "/dashboard/complaints";
                  } else {
                    toast.error(res.error ?? "Delete failed");
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {complaint.description}
                </p>
              </CardContent>
            </Card>

            {/* Image Gallery Section */}
            {attachments.map((url, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer rounded-md overflow-hidden border bg-muted aspect-square"
                onClick={() => setSelectedImage(url)}
              >
                <img
                  src={url}
                  alt={`Attachment ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-5 pl-2">
                  <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
                  {timeline.map((event) => {
                    const Icon = TYPE_ICON[event.type];
                    return (
                      <div key={event._id} className="relative flex gap-4">
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {event.title}
                            </p>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatDateTime(event.timestamp)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {event.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            by {event.actor}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Add a comment
                  </label>
                  <Textarea
                    placeholder="Write an update for the team…"
                    className="min-h-[80px] resize-none"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={posting || !newComment.trim()}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      {posting ? "Posting..." : "Post update"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <DetailRow
                icon={Building2}
                label="Department"
                value={complaint.department}
              />
              <DetailRow
                icon={MapPin}
                label="Location"
                value={complaint.location}
              />
              <DetailRow
                icon={User}
                label="Submitted by"
                value={
                  typeof complaint.submittedBy === "object"
                    ? complaint.submittedBy.name
                    : complaint.submittedBy
                }
              />
              <DetailRow
                icon={User}
                label="Assigned to"
                value={
                  complaint.assignedTo
                    ? typeof complaint.assignedTo === "object"
                      ? complaint.assignedTo.name
                      : complaint.assignedTo
                    : "Unassigned"
                }
              />
              <DetailRow
                icon={Calendar}
                label="Submitted"
                value={formatDateTime(complaint.createdAt)}
              />
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {complaint.category}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Priority
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {complaint.priority}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
