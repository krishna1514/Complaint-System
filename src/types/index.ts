import { Types } from "mongoose";

export type Role = "user" | "admin" | "staff";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type Status = "Pending" | "In Progress" | "Resolved";
export type Department = "IT" | "Electrical" | "Maintenance" | "Cleaning" | "General";
export type TimelineType = "created" | "assigned" | "updated" | "resolved" | "comment";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  department?: Department;
  createdAt: Date;
}

export interface IComplaint {
  _id: Types.ObjectId;
  complaintId: string;
  title: string;
  description: string;
  department: Department;
  category: string;
  location: string;
  priority: Priority;
  status: Status;
  submittedBy: Types.ObjectId | IUser;
  assignedTo?: Types.ObjectId | IUser;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  escalated: boolean;
}

export interface ITimeline {
  _id: Types.ObjectId;
  complaintId: Types.ObjectId;
  type: TimelineType;
  title: string;
  description: string;
  actor: string;
  timestamp: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  complaintId: Types.ObjectId;
  userId: Types.ObjectId | IUser;
  message: string;
  createdAt: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: Status;
  department?: Department;
  priority?: Priority;
  search?: string;
}