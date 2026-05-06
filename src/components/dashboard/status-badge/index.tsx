import { cn } from "@/lib/utils";
import type { ComplaintStatus, Priority } from "@/lib/mock-data";

const statusStyles: Record<ComplaintStatus, string> = {
  Pending:
    "bg-warning/10 text-warning-foreground border-warning/30 dark:bg-warning/15 dark:text-warning",
  "In Progress": "bg-info/10 text-info border-info/30 dark:bg-info/15",
  Resolved: "bg-success/10 text-success border-success/30 dark:bg-success/15",
};

const priorityStyles: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-info/10 text-info border-info/30",
  High: "bg-warning/15 text-warning border-warning/30",
  Urgent: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "Pending" && "bg-warning",
          status === "In Progress" && "bg-info",
          status === "Resolved" && "bg-success",
        )}
      />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}
