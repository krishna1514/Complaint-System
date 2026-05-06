"use client";
import { useEffect, useState } from "react";
import {
  PriorityBadge,
  StatusBadge,
} from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { complaintsApi, adminApi, type Complaint } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock4,
  Inbox,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type AdminStats = {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  urgent: number;
  avgResolutionTime: number;
  satisfaction: number;
  resolutionRate: number;
};

type TrendPoint = { day: string; submitted: number; resolved: number };
type Distribution = {
  byDepartment: { label: string; value: number }[];
  byPriority: { label: string; value: number }[];
  byStatus: { label: string; value: number }[];
  byCategory: { label: string; value: number }[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, trendRes, distRes, complaintsRes] = await Promise.all([
          adminApi.stats(),
          adminApi.trends(),
          adminApi.distribution(),
          complaintsApi.list({ limit: 6 }),
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data.stats);
        if (trendRes.success && trendRes.data) setTrend(trendRes.data.trend);
        if (distRes.success && distRes.data)
          setDistribution(distRes.data.distribution);
        if (complaintsRes.success && complaintsRes.data)
          setRecentComplaints(complaintsRes.data.complaints);
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const adminStatsCards = [
    {
      label: "Total Complaints",
      value: stats?.total ?? 0,
      delta: 12,
      icon: Inbox,
      tone: "primary",
      hint: "vs last week",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      delta: -8,
      icon: Clock4,
      tone: "warning",
      hint: "queue clearing",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0,
      delta: 4,
      icon: Loader2,
      tone: "info",
      hint: "active tickets",
    },
    {
      label: "Resolved",
      value: stats?.resolved ?? 0,
      delta: 18,
      icon: CheckCircle2,
      tone: "success",
      hint: "this week",
    },
    {
      label: "Urgent",
      value: stats?.urgent ?? 0,
      delta: -22,
      icon: AlertTriangle,
      tone: "destructive",
      hint: "critical now",
    },
  ];

  const toneRing: Record<string, string> = {
    primary: "from-primary/15 to-primary/0 ring-primary/20 text-primary",
    warning: "from-warning/15 to-warning/0 ring-warning/20 text-warning",
    info: "from-info/15 to-info/0 ring-info/20 text-info",
    success: "from-success/15 to-success/0 ring-success/20 text-success",
    destructive:
      "from-destructive/15 to-destructive/0 ring-destructive/20 text-destructive",
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Admin Panel
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Control Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor complaint flow, route work, and keep resolution metrics on
            track.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button asChild size="sm" className="h-9 gap-1.5 shadow-sm">
            <Link href="/admin/complaints">
              <ListChecks className="h-4 w-4" /> Manage queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {adminStatsCards.map((s) => (
          <AdminStatCard key={s.label} {...s} toneRing={toneRing} />
        ))}
      </div>

      {/* Trends + Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Complaint Trends</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Submitted vs Resolved · last 7 days
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Submitted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" /> Resolved
              </span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">
              Admin shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <ActionTile
              to="/admin/complaints"
              icon={UserPlus}
              label="Assign"
              tone="primary"
            />
            <ActionTile
              to="/admin/complaints"
              icon={RefreshCw}
              label="Update status"
              tone="info"
            />
            <ActionTile
              to="/admin/complaints"
              icon={Inbox}
              label="View all"
              tone="success"
            />
            <ActionTile
              to="/admin/users"
              icon={Users}
              label="Manage users"
              tone="warning"
            />
          </CardContent>
        </Card>
      </div>

      {/* Distribution grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Department</CardTitle>
            <CardDescription className="text-xs">
              Workload split
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={distribution?.byDepartment ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Status</CardTitle>
            <CardDescription className="text-xs">
              Pipeline state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={distribution?.byStatus ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Priority</CardTitle>
            <CardDescription className="text-xs">Severity mix</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList data={distribution?.byPriority ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Category</CardTitle>
            <CardDescription className="text-xs">Top topics</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList data={distribution?.byCategory ?? []} />
          </CardContent>
        </Card>
      </div>

      {/* Recent complaints table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base">Recent Complaints</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Latest 6 tickets across all departments
            </CardDescription>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
          >
            <Link href="/admin/complaints">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ID
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Title
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dept
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Priority
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentComplaints.map((c) => (
                <TableRow
                  key={c._id}
                  className="cursor-pointer border-border/60"
                  onClick={() =>
                    (window.location.href = `/admin/complaints/${c._id}`)
                  }
                >
                  <TableCell className="pl-6 py-3 text-xs font-mono text-muted-foreground">
                    {c.complaintId}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {c.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {c.location}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {c.department}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={c.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper Components (same as before, but updated to use real data) ---

function ActionTile({ to, icon: Icon, label, tone }: any) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary group-hover:bg-primary/15",
    info: "bg-info/10 text-info group-hover:bg-info/15",
    success: "bg-success/10 text-success group-hover:bg-success/15",
    warning: "bg-warning/15 text-warning group-hover:bg-warning/20",
  };
  return (
    <Link
      href={to}
      className="group flex flex-col items-start gap-2 rounded-lg border border-border/60 p-3 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-sm"
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          tones[tone],
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </Link>
  );
}

function AdminStatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
  hint,
  toneRing,
}: any) {
  const positive = delta >= 0;
  return (
    <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-br opacity-60",
          toneRing[tone],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl ring-1 backdrop-blur",
            toneRing[tone],
            "bg-background/40",
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
            positive
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(delta)}%
        </span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
    </Card>
  );
}

function TrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length)
    return (
      <p className="text-center text-sm text-muted-foreground">No trend data</p>
    );
  const max = Math.max(...data.flatMap((d) => [d.submitted, d.resolved]));
  const W = 560,
    H = 200,
    PAD = 28;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const points = (key: "submitted" | "resolved") =>
    data.map(
      (d, i) =>
        [
          PAD + (i / (data.length - 1)) * innerW,
          PAD + innerH - (d[key] / max) * innerH,
        ] as const,
    );
  const toSmoothPath = (pts: readonly (readonly [number, number])[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const cx = (x1 + x2) / 2;
      d += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    }
    return d;
  };
  const submittedPts = points("submitted");
  const resolvedPts = points("resolved");
  const submittedArea = `${toSmoothPath(submittedPts)} L ${PAD + innerW} ${PAD + innerH} L ${PAD} ${PAD + innerH} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full">
      <defs>
        <linearGradient id="areaSubmitted" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={PAD}
          x2={W - PAD}
          y1={PAD + innerH * t}
          y2={PAD + innerH * t}
          stroke="var(--border)"
          strokeDasharray="3 4"
          strokeWidth={1}
        />
      ))}
      <path d={submittedArea} fill="url(#areaSubmitted)" />
      <path
        d={toSmoothPath(submittedPts)}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d={toSmoothPath(resolvedPts)}
        fill="none"
        stroke="var(--success)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {submittedPts.map(([x, y], i) => (
        <circle
          key={`s-${i}`}
          cx={x}
          cy={y}
          r={3.5}
          fill="var(--background)"
          stroke="var(--primary)"
          strokeWidth={2}
        />
      ))}
      {resolvedPts.map(([x, y], i) => (
        <circle
          key={`r-${i}`}
          cx={x}
          cy={y}
          r={3.5}
          fill="var(--background)"
          stroke="var(--success)"
          strokeWidth={2}
        />
      ))}
      {data.map((d, i) => (
        <text
          key={d.day}
          x={PAD + (i / (data.length - 1)) * innerW}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 10 }}
        >
          {d.day}
        </text>
      ))}
    </svg>
  );
}

function BarList({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length)
    return <p className="text-center text-sm text-muted-foreground">No data</p>;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{d.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {d.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length)
    return <p className="text-center text-sm text-muted-foreground">No data</p>;
  const total = data.reduce((a, b) => a + b.value, 0);
  const colors = [
    "var(--primary)",
    "var(--info)",
    "var(--success)",
    "var(--warning)",
    "var(--destructive)",
  ];
  const R = 42,
    C = 2 * Math.PI * R;
  const segments = data.map((d, i) => ({
    ...d,
    len: (d.value / total) * C,
    color: colors[i % colors.length],
  }));
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
        />
        {segments.map((d, i) => {
          const path = (
            <circle
              key={d.label}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="14"
              strokeDasharray={`${d.len} ${C - d.len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += d.len;
          return path;
        })}
      </svg>
      <ul className="flex-1 space-y-1.5 text-xs">
        {segments.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />{" "}
              {d.label}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
