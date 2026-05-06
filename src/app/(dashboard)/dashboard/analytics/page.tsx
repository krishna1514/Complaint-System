"use client";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
import DashboardLayout from "@/components/dashboard/layout";
import StatsCard from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { CheckCircle2, Clock4, Inbox, Star, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TrendPoint = { day: string; submitted: number; resolved: number };
type DistributionItem = { label: string; value: number };
type Distribution = {
  byDepartment: DistributionItem[];
  byStatus: DistributionItem[];
  byPriority: DistributionItem[];
  byCategory: DistributionItem[];
};
type AdminStats = {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  urgent: number;
  avgResolutionTime: number;
  satisfaction?: number;
  resolutionRate?: number;
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [distribution, setDistribution] = useState<Distribution | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, trendRes, distRes] = await Promise.all([
          analyticsApi.stats(),
          analyticsApi.trends(),
          analyticsApi.distribution(),
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data.stats);
        if (trendRes.success && trendRes.data) setTrend(trendRes.data.trend);
        if (distRes.success && distRes.data) setDistribution(distRes.data.distribution);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-80" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const displayStats = {
    total: stats?.total ?? 0,
    resolved: stats?.resolved ?? 0,
    avgResolution: formatAvgResolution(stats?.avgResolutionTime),
    satisfaction: stats?.satisfaction ?? 92, // fallback or compute from rating?
  };

  const trendData = trend.length ? trend : [];
  const maxTrend =
  trendData.length > 0
    ? Math.max(...trendData.flatMap(d => [d.submitted, d.resolved]), 1)
    : 1;
  const byDept = distribution?.byDepartment ?? [];
  const maxDept = byDept.length > 0 ? Math.max(...byDept.map(d => d.value)) : 1;
  const statusDist = distribution?.byStatus ?? [];
  const totalDist = statusDist.reduce((s, d) => s + d.value, 0);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Header
          title="Analytics"
          description="Trends, throughput, and insights across all departments."
          actions={
            <>
              <Button variant="outline" size="sm" className="h-9">
                Last 7 days
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                Export report
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total complaints" value={displayStats.total} delta={12} hint="vs last week" icon={Inbox} />
          <StatsCard label="Resolved" value={displayStats.resolved} delta={18} hint="this week" icon={CheckCircle2} tone="success" />
          <StatsCard label="Avg. resolution" value={displayStats.avgResolution} delta={-14} hint="improvement" icon={Clock4} tone="info" />
          <StatsCard label="Satisfaction" value={`${displayStats.satisfaction}%`} delta={4} hint="positive feedback" icon={Star} tone="warning" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Submitted vs resolved
              </CardTitle>
              <CardDescription className="text-xs">Daily volume across the past week</CardDescription>
            </CardHeader>
             <CardContent>
            {trendData.length > 0 ? (
              <>
                <div className="flex h-[260px] items-end gap-3">
                  {trendData.map((d) => (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">

                      {/* ✅ FIXED HEIGHT CONTAINER */}
                      <div className="flex h-[220px] w-full items-end justify-center gap-1">

                        {/* Submitted */}
                        <div
                          className="w-1/2 bg-blue-500 rounded-t-sm"
                          style={{
                            height: `${Math.max((d.submitted / maxTrend) * 100, 3)}%`,
                          }}
                          title={`${d.submitted} submitted`}
                        />

                        {/* Resolved */}
                        <div
                          className="w-1/2 bg-green-500 rounded-t-sm"
                          style={{
                            height: `${Math.max((d.resolved / maxTrend) * 100, 3)}%`,
                          }}
                          title={`${d.resolved} resolved`}
                        />
                      </div>

                      <span className="text-xs text-muted-foreground">{d.day}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-blue-500 rounded-sm" /> Submitted
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-green-500 rounded-sm" /> Resolved
                  </span>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No data available
              </p>
            )}
          </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status breakdown</CardTitle>
              <CardDescription className="text-xs">Current open & closed</CardDescription>
            </CardHeader>
            <CardContent>
              {statusDist.length > 0 ? (
                <div className="space-y-3">
                  {statusDist.map((s) => {
                    const pct = Math.round((s.value / totalDist) * 100);
                    const color =
                      s.label === "Pending" ? "bg-warning" : s.label === "In Progress" ? "bg-info" : "bg-success";
                    return (
                      <div key={s.label}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{s.label}</span>
                          <span className="text-muted-foreground tabular-nums">{s.value} · {pct}%</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complaints by department</CardTitle>
            <CardDescription className="text-xs">Volume distribution across teams</CardDescription>
          </CardHeader>
          <CardContent>
            {byDept.length > 0 ? (
              <div className="space-y-4">
                {byDept.map((c) => (
                  <div key={c.label} className="grid grid-cols-[100px_1fr_50px] items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{c.label}</span>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        style={{ width: `${(c.value / maxDept) * 100}%` }}
                      />
                    </div>
                    <span className="text-right text-sm tabular-nums text-muted-foreground">{c.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        {distribution?.byCategory && distribution.byCategory.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Complaints by category</CardTitle>
              <CardDescription className="text-xs">Top issue categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distribution.byCategory.map((c) => (
                  <div key={c.label} className="grid grid-cols-[100px_1fr_50px] items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{c.label}</span>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        style={{ width: `${(c.value / maxDept) * 100}%` }}
                      />
                    </div>
                    <span className="text-right text-sm tabular-nums text-muted-foreground">{c.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}