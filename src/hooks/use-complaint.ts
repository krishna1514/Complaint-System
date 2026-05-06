"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { complaintsApi, type Complaint, type Pagination } from "@/lib/api";
import { toast } from "sonner";

interface Filters {
  search: string;
  status: string;
  department: string;
  priority: string;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "all",
  department: "all",
  priority: "all",
};

export function useComplaints(initialPage = 1, pageSize = 10) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ✅ debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 350);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [filters.search]);

  // ✅ FETCH LIST (correct)
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      setError(null);

      const res = await complaintsApi.list({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        department:
          filters.department !== "all" ? filters.department : undefined,
        priority: filters.priority !== "all" ? filters.priority : undefined,
      });

      if (!isMounted) return;

      if (res.success && res.data) {
        setComplaints(res.data.complaints);
        setPagination(res.data.pagination);
      } else {
        setError(res.error ?? "Failed to load complaints");
      }

      setLoading(false);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [
    page,
    pageSize,
    debouncedSearch,
    filters.status,
    filters.department,
    filters.priority,
  ]);

  // manual refresh
  const refresh = useCallback(async () => {
    const res = await complaintsApi.list({
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      department: filters.department !== "all" ? filters.department : undefined,
      priority: filters.priority !== "all" ? filters.priority : undefined,
    });

    if (res.success && res.data) {
      setComplaints(res.data.complaints);
      setPagination(res.data.pagination);
    }
  }, [page, pageSize, debouncedSearch, filters]);

  const updateFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const deleteComplaint = useCallback(
    async (id: string) => {
      const res = await complaintsApi.delete(id);
      if (res.success) {
        toast.success("Complaint deleted");
        refresh();
      } else {
        toast.error(res.error ?? "Failed to delete complaint");
      }
    },
    [refresh],
  );

  return {
    complaints,
    pagination,
    filters,
    page,
    loading,
    error,
    setPage,
    updateFilter,
    resetFilters,
    refresh,
    deleteComplaint,
  };
}

export function useComplaint(id: string) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);

      const res = await complaintsApi.get(id);

      if (!isMounted) return;

      if (res.success && res.data) {
        setComplaint(res.data.complaint);
      } else {
        setError(res.error ?? "Complaint not found");
      }

      setLoading(false);
    };

    if (id) init();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const refresh = useCallback(async () => {
    const res = await complaintsApi.get(id);
    if (res.success && res.data) {
      setComplaint(res.data.complaint);
    }
  }, [id]);

  return { complaint, loading, error, refresh, setComplaint };
}
