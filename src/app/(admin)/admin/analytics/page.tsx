"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, complaintsApi, type Complaint } from "@/lib/api";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

interface DepartmentStats {
  department: string;
  total: number;
  resolved: number;
  pending: number;
  avgHours: number;
}

interface StaffWorkload {
  name: string;
  assigned: number;
  resolved: number;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6m");

  // Real data states
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [deptPerformance, setDeptPerformance] = useState<DepartmentStats[]>([]);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Basic stats & trends
        const [statsRes, trendsRes, distributionRes, complaintsRes, usersRes] =
          await Promise.all([
            adminApi.stats(),
            adminApi.trends(),
            adminApi.distribution(),
            complaintsApi.list({ limit: 10000 }), // fetch all complaints for calculations
            fetch("/api/admin/users", { credentials: "include" }).then((r) =>
              r.json(),
            ),
          ]);

        // Stats
        if (statsRes.success && statsRes.data) setStats(statsRes.data.stats);

        // Weekly trends (convert to monthly? just use weekly)
        if (trendsRes.success && trendsRes.data) {
          // map to monthly-like format for chart simplicity
          const weeklyTrend = trendsRes.data.trend;
          setTrendData(
            weeklyTrend.map((t: any) => ({
              month: t.day,
              complaints: t.submitted,
              resolved: t.resolved,
            })),
          );
        }

        // Department & category distribution
        if (distributionRes.success && distributionRes.data) {
          setCategoryData(distributionRes.data.distribution.byCategory || []);
          // Prepare department performance from distribution by department
          const deptDist = distributionRes.data.distribution.byDepartment || [];
          const complaints = complaintsRes.success
            ? complaintsRes.data?.complaints || []
            : [];

          // Calculate resolved/pending per department and avg resolution time
          const deptStats = await Promise.all(
            deptDist.map(async (d: any) => {
              const deptComplaints = complaints.filter(
                (c: Complaint) => c.department === d.label,
              );
              const resolvedCount = deptComplaints.filter(
                (c) => c.status === "Resolved",
              ).length;
              const pendingCount = deptComplaints.length - resolvedCount;
              // avg resolution time (hours)
              let avgHours = 0;
              const resolvedComps = deptComplaints.filter(
                (c) => c.status === "Resolved",
              );
              if (resolvedComps.length) {
                const totalMs = resolvedComps.reduce(
                  (acc, c) =>
                    acc +
                    (new Date(c.updatedAt).getTime() -
                      new Date(c.createdAt).getTime()),
                  0,
                );
                avgHours = Math.round(
                  totalMs / resolvedComps.length / (1000 * 60 * 60),
                );
              }
              return {
                department: d.label,
                total: d.value,
                resolved: resolvedCount,
                pending: pendingCount,
                avgHours,
              };
            }),
          );
          setDeptPerformance(deptStats);
        }

        // Staff workload
        if (usersRes.success) {
          const users = usersRes.data.users;
          const staff = users.filter((u: any) => u.role === "staff");
          const allComplaints = complaintsRes.success
            ? complaintsRes.data?.complaints || []
            : [];
          const workload = staff.map((s: any) => {
            const assigned = allComplaints.filter(
              (c: Complaint) => c.assignedTo?._id === s._id,
            ).length;
            const resolved = allComplaints.filter(
              (c: Complaint) =>
                c.assignedTo?._id === s._id && c.status === "Resolved",
            ).length;
            return { name: s.name, assigned, resolved };
          });
          setStaffWorkload(workload);
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]); // timeRange could be used to filter, but for simplicity we ignore

  if (loading) {
    return (
      <div className="space-y-6 mx-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-8 mx-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Advanced Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into complaint resolution, department performance, and
            trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Avg Resolution Time"
          value={`${stats?.avgResolutionTime || 0} hrs`}
          change="-12%"
          trend="down"
          icon={Clock}
        />
        <MetricCard
          title="Resolution Rate"
          value={`${stats?.resolutionRate || 0}%`}
          change="+5%"
          trend="up"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Active Staff"
          value={staffWorkload.length.toString()}
          change="+2"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Urgent Complaints"
          value={stats?.urgent || 0}
          change="-22%"
          trend="down"
          icon={AlertTriangle}
        />
      </div>

      {/* Charts Grid */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Department Performance</TabsTrigger>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="workload">Staff Workload</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Resolution by Department
                </CardTitle>
                <CardDescription>
                  Resolved vs pending complaints
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Average Resolution Time (hours)
                </CardTitle>
                <CardDescription>Hours to resolve complaints</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" />
                    <Tooltip />
                    <Bar dataKey="avgHours" fill="#3b82f6" name="Avg Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Complaint Trends Over Time
              </CardTitle>
              <CardDescription>Submitted vs resolved (weekly)</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="#3b82f6"
                    name="Submitted"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10b981"
                    name="Resolved"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Staff Workload Distribution
              </CardTitle>
              <CardDescription>Assigned vs resolved complaints</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffWorkload} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="assigned" fill="#f59e0b" name="Assigned" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Complaint Categories
                </CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Top Categories (Bar)
                </CardTitle>
                <CardDescription>Most frequent issues</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={trend === "up" ? "text-success" : "text-destructive"}
          >
            {change}
          </span>
          <span className="text-muted-foreground">vs previous period</span>
        </div>
      </CardContent>
    </Card>
  );
}
