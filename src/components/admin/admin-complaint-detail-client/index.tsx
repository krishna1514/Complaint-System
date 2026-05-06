"use client";
import { useState, useEffect } from "react";
import { useComplaint } from "@/hooks/use-complaint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatusBadge,
  PriorityBadge,
} from "@/components/dashboard/status-badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { complaintsApi, type Comment, type TimelineEvent } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Building2,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock4,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import NotFound from "@/app/not-found";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}
const TYPE_ICON = {
  created: PlusCircle,
  assigned: User,
  updated: Clock4,
  resolved: CheckCircle2,
  comment: MessageSquare,
} as const;

export default function AdminComplaintDetailClient({ id }: { id: string }) {
  const { complaint, loading, refresh } = useComplaint(id);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [timelineRes, commentsRes] = await Promise.all([
        complaintsApi.getTimeline(id),
        complaintsApi.getComments(id),
      ]);
      if (timelineRes.success && timelineRes.data)
        setTimeline(timelineRes.data.timeline);
      if (commentsRes.success && commentsRes.data)
        setComments(commentsRes.data.comments);
    };
    fetch();
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
    } else toast.error(res.error ?? "Failed to add comment");
    setPosting(false);
  };

  const handleUpdate = async (field: string, value: string) => {
    setUpdating(true);
    const res = await complaintsApi.update(id, { [field]: value });
    if (res.success) {
      toast.success(`${field} updated`);
      refresh();
      const timelineRes = await complaintsApi.getTimeline(id);
      if (timelineRes.success && timelineRes.data)
        setTimeline(timelineRes.data.timeline);
    } else toast.error(res.error ?? "Update failed");
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this complaint permanently?")) return;
    const res = await complaintsApi.delete(id);
    if (res.success) {
      toast.success("Complaint deleted");
      window.location.href = "/admin/complaints";
    } else toast.error(res.error ?? "Delete failed");
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-40" />
      </div>
    );
  if (!complaint) return <NotFound />;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 gap-1.5">
          <Link href="/admin/complaints">
            <ArrowLeft className="h-4 w-4" /> Back
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
              <Building2 className="h-3.5 w-3.5" /> {complaint.department}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={complaint.status}
            onValueChange={(v) => handleUpdate("status", v)}
            disabled={updating}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={complaint.priority}
            onValueChange={(v) => handleUpdate("priority", v)}
            disabled={updating}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{complaint.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-5 pl-2">
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
                {timeline.map((e) => {
                  const Icon = TYPE_ICON[e.type];
                  return (
                    <div key={e._id} className="relative flex gap-4">
                      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{e.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(e.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {e.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {e.actor}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                <label className="text-xs font-medium">Add a comment</label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={posting}
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
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
              <p className="text-xs font-medium">Category</p>
              <p>{complaint.category}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
