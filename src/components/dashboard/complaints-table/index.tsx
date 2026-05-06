"use client";
import { ChevronRight, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/dashboard/status-badge";
import EmptyState from "@/components/dashboard/empty-state";
import { Inbox } from "lucide-react";
import type { Complaint } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ComplaintsTable({ data, onDelete }: { data: Complaint[]; onDelete?: (id: string) => void }) {

  const {user} = useAuth();
  const path=user?.role === "admin" ? "/admin/complaints/" : "/dashboard/complaints/";

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No complaints found"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/60 hover:bg-transparent">
          <TableHead className="pl-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ticket
          </TableHead>
          <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Department
          </TableHead>
          <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Priority
          </TableHead>
          <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Submitted
          </TableHead>
          <TableHead className="pr-6 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((c) => (
          <TableRow key={c._id} className="border-border/60 group">
            <TableCell className="pl-6 py-3">
              <Link href={`${path}/${c._id}`} className="flex flex-col">
                <span className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary">
                  {c.title}
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {c.complaintId} · {c.location}
                </span>
              </Link>
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground">{c.department}</span>
            </TableCell>
            <TableCell>
              <PriorityBadge priority={c.priority} />
            </TableCell>
            <TableCell>
              <StatusBadge status={c.status} />
            </TableCell>
            <TableCell className="text-xs text-muted-foreground tabular-nums">
              {formatDate(c.createdAt)}
            </TableCell>
            <TableCell className="pr-6 text-right">
              <div className="flex items-center justify-end gap-1">
                <Link
                  href={`${path}/${c._id}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-accent hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
                {onDelete && c.status === "Pending" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(c._id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}