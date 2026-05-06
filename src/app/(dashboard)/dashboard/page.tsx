"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import StatsCard from "@/components/dashboard/stats-card";
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
import { useAuth } from "@/context/auth";
import { userAccessor } from "@/lib/accessors/UserAccessor";
import {
  ArrowRight,
  CheckCircle2,
  Clock4,
  Filter,
  Inbox,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { complaintsApi, analyticsApi, type Complaint } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type TrendPoint = { day: string; submitted: number; resolved: number };
type AdminStats = {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgResolutionTime: number; // in hours
  satisfaction: number;
  resolutionRate: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { getDisplayName } = userAccessor;
  const name = getDisplayName(user?.name || "");

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [complaintsRes, statsRes, trendRes] = await Promise.all([
          complaintsApi.list({ limit: 6 }),
          analyticsApi.stats(),
          analyticsApi.trends(),
        ]);
        if (complaintsRes.success && complaintsRes.data) {
          setRecentComplaints(complaintsRes.data.complaints);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data.stats);
        }
        if (trendRes.success && trendRes.data) {
          setTrend(trendRes.data.trend);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatAvgResolution = (hours?: number) => {
    if (hours === undefined) return "—";
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-96" />
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayStats = {
    total: stats?.total ?? 0,
    pending: stats?.pending ?? 0,
    resolved: stats?.resolved ?? 0,
    avgResolution: formatAvgResolution(stats?.avgResolutionTime),
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back, {name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s how the complaint system is performing this week.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="h-9 gap-1.5 shadow-sm">
              <Link href="/dashboard/submit-complaint">
                <PlusCircle className="h-4 w-4" />
                New complaint
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Total complaints"
            value={displayStats.total}
            delta={12}
            hint="vs last week"
            icon={Inbox}
          />
          <StatsCard
            label="Pending"
            value={displayStats.pending}
            delta={-8}
            hint="resolving faster"
            icon={Clock4}
            tone="warning"
          />
          <StatsCard
            label="Resolved"
            value={displayStats.resolved}
            delta={18}
            hint="this week"
            icon={CheckCircle2}
            tone="success"
          />
          <StatsCard
            label="Avg. resolution"
            value={displayStats.avgResolution}
            delta={-14}
            hint="improvement"
            icon={TrendingUp}
            tone="info"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent complaints */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Recent complaints</CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Latest tickets across all departments
                </CardDescription>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
              >
                <Link href="/dashboard/complaints">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
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
                    <TableHead className="pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentComplaints.map((c) => (
                    <TableRow
                      key={c._id}
                      className="border-border/60 cursor-pointer"
                      onClick={() => (window.location.href = `/dashboard/complaints/${c._id}`)}
                    >
                      <TableCell className="pl-6 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground line-clamp-1">
                            {c.title}
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {c.complaintId} · {c.location}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{c.department}</span>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={c.priority} />
                      </TableCell>
                      <TableCell className="pr-6">
                        <StatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentComplaints.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No complaints found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick actions + activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick actions</CardTitle>
                <CardDescription className="text-xs">
                  Shortcuts to keep things moving
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <QuickAction
                  to="/dashboard/submit-complaint"
                  icon={PlusCircle}
                  title="Submit a complaint"
                  desc="File a new ticket"
                />
                <QuickAction
                  to="/dashboard/complaints"
                  icon={Inbox}
                  title="View all complaints"
                  desc="Browse and filter tickets"
                />
                <QuickAction
                  to="/dashboard/analytics"
                  icon={TrendingUp}
                  title="Open analytics"
                  desc="Trends & insights"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  This week
                </CardTitle>
                <CardDescription className="text-xs">
                  Submitted vs resolved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trend.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {trend.map((d) => {
                        const max = Math.max(
                          ...trend.flatMap((x) => [x.submitted, x.resolved]),
                        );
                        return (
                          <div key={d.day} className="flex items-center gap-3 text-xs">
                            <span className="w-8 text-muted-foreground">{d.day}</span>
                            <div className="flex flex-1 flex-col gap-1">
                              <div className="h-1.5 rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary/70"
                                  style={{ width: `${(d.submitted / max) * 100}%` }}
                                />
                              </div>
                              <div className="h-1.5 rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-success"
                                  style={{ width: `${(d.resolved / max) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="w-10 text-right tabular-nums text-muted-foreground">
                              {d.resolved}/{d.submitted}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary/70" /> Submitted
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-success" /> Resolved
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No trend data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof PlusCircle;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={to}
      className="group flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-all hover:border-border hover:bg-accent/50"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}