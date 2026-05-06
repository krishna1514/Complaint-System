"use client";
import { useComplaints } from "@/hooks/use-complaint";
import { ComplaintsTable } from "@/components/dashboard/complaints-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PlusCircle, Filter, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/dashboard/header";

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Resolved", value: "Resolved" },
];

export default function AdminComplaints() {
  const {
    complaints,
    pagination,
    filters,
    loading,
    updateFilter,
    setPage,
    deleteComplaint,
  } = useComplaints();
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearch = () => updateFilter("search", searchInput);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  if (loading && complaints.length === 0) {
    return (
      <>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card>
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Header
        title="All Complaints"
        description="Manage, filter, and update all tickets."
        actions={
          <>
            <Button asChild size="sm" className="h-9 gap-1.5 shadow-sm">
              <Link href="/admin/submit-complaint">
                <PlusCircle className="h-4 w-4" /> New complaint
              </Link>
            </Button>
          </>
        }
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={filters.status === "all" ? "all" : filters.status}
            onValueChange={(v) => updateFilter("status", v === "all" ? "" : v)}
          >
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSearch}
                placeholder="Search tickets…"
                className="h-9 w-full pl-9 sm:w-[240px]"
              />
            </div>
            <Select
              value={filters.department || "all"}
              onValueChange={(v) =>
                updateFilter("department", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="h-9 w-[150px]">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || "all"}
              onValueChange={(v) =>
                updateFilter("priority", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardContent className="px-0 pb-0">
          <ComplaintsTable data={complaints} onDelete={deleteComplaint} />
          <div className="flex items-center justify-between border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">
                {complaints.length}
              </span>{" "}
              of {pagination?.total ?? 0} complaints
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!pagination?.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!pagination?.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
