// lib/api.ts
// Central API client — all backend calls go through here.
// Cookies are sent automatically (same-origin Next.js app).

const BASE = "/api";

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: "include",
      ...options,
    });

    const contentType = res.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return { success: false, error: "Invalid server response" };
    }

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json?.error || "Request failed",
      };
    }

    return json;
  } catch (err) {
    return {
      success: false,
      error: "Network error",
    };
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User }>("/auth/me"),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => request<{ user: User }>("/users/me"),

  update: (data: { name: string; department?: string }) =>
    request<{ user: User }>("/users/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request("/users/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── Complaints ───────────────────────────────────────────────────────────────

export interface ComplaintsQuery {
  page?: number;
  limit?: number;
  status?: string;
  department?: string;
  priority?: string;
  search?: string;
}

export const complaintsApi = {
  list: (query: ComplaintsQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "all") {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    return request<{ complaints: Complaint[]; pagination: Pagination }>(
      `/complaints${qs ? `?${qs}` : ""}`,
    );
  },

  get: (id: string) => request<{ complaint: Complaint }>(`/complaints/${id}`),

  create: (data: CreateComplaintInput) =>
    request<{ complaint: Complaint }>("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateComplaintInput) =>
    request<{ complaint: Complaint }>(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => request(`/complaints/${id}`, { method: "DELETE" }),

  getTimeline: (id: string) =>
    request<{ timeline: TimelineEvent[] }>(`/complaints/${id}/timeline`),

  getComments: (id: string) =>
    request<{ comments: Comment[] }>(`/complaints/${id}/comments`),

  addComment: (id: string, message: string) =>
    request<{ comment: Comment }>(`/complaints/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};

export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch("/api/upload", { method: "POST", body: formData, credentials: "include" }).then(res => res.json());
  },
};


// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () => request<{ stats: AdminStats }>("/admin/stats"),
  trends: () => request<{ trend: TrendPoint[] }>("/admin/trends"),
  distribution: () =>
    request<{ distribution: Distribution }>("/admin/distribution"),
};

// Analytics

export const analyticsApi = {
  stats: () => request<{ stats: AdminStats }>("/analytics/stats"),
  trends: () => request<{ trend: TrendPoint[] }>("/analytics/trends"),
  distribution: () => request<{ distribution: Distribution }>("/analytics/distribution"),
};


// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "user" | "admin" | "staff";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type Status = "Pending" | "In Progress" | "Resolved";
export type Department =
  | "IT"
  | "Electrical"
  | "Maintenance"
  | "Cleaning"
  | "General";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  department?: Department;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  department: Department;
  category: string;
  location: string;
  priority: Priority;
  status: Status;
  submittedBy: User;
  assignedTo?: User;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  department?: string;
  category: string;
  location: string;
  priority?: Priority;
  attachments?: string[];
}

export interface UpdateComplaintInput {
  status?: Status;
  priority?: Priority;
  department?: Department;
  assignedTo?: string | null;
  title?: string;
  description?: string;
  location?: string;
}

export interface TimelineEvent {
  _id: string;
  complaintId: string;
  type: "created" | "assigned" | "updated" | "resolved" | "comment";
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface Comment {
  _id: string;
  complaintId: string;
  userId: User;
  message: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  urgent: number;
  avgResolutionTime: number;
  satisfaction: number;
  resolutionRate: number;
}

export interface TrendPoint {
  day: string;
  submitted: number;
  resolved: number;
}

export interface Distribution {
  byDepartment: { label: string; value: number }[];
  byPriority: { label: string; value: number }[];
  byStatus: { label: string; value: number }[];
  byCategory: { label: string; value: number }[];
}
