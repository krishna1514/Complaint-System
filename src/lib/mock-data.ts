export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type Department = "IT" | "Electrical" | "Maintenance" | "Cleaning";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  department: Department;
  category: string;
  location: string;
  priority: Priority;
  status: ComplaintStatus;
  date: string;
  submittedBy: string;
  assignedTo?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  type: "created" | "assigned" | "updated" | "resolved" | "comment";
}

export const complaints: Complaint[] = [
  {
    id: "CMP-1042",
    title: "Wi-Fi outage in Block C, 3rd floor",
    description:
      "Intermittent connectivity affecting roughly 40 users since this morning. DHCP appears to fail on reconnect.",
    department: "IT",
    category: "Network",
    location: "Block C · Floor 3",
    priority: "High",
    status: "In Progress",
    date: "2026-04-28T09:14:00Z",
    submittedBy: "Aarav Mehta",
    assignedTo: "Priya Sharma",
  },
  {
    id: "CMP-1041",
    title: "Flickering tube light in conference room",
    description:
      "Tube light near the projector flickers constantly, distracting during meetings.",
    department: "Electrical",
    category: "Lighting",
    location: "Block A · Conf. Room 2",
    priority: "Medium",
    status: "Pending",
    date: "2026-04-28T07:42:00Z",
    submittedBy: "Neha Kapoor",
  },
  {
    id: "CMP-1040",
    title: "Leaking tap in pantry",
    description:
      "Continuous dripping causing water wastage. Needs washer replacement.",
    department: "Maintenance",
    category: "Plumbing",
    location: "Block B · Pantry",
    priority: "Low",
    status: "Resolved",
    date: "2026-04-27T16:05:00Z",
    submittedBy: "Rohan Iyer",
    assignedTo: "Suresh Kumar",
  },
  {
    id: "CMP-1039",
    title: "Restroom needs deep cleaning",
    description: "Reported odor and unclean floors on the 2nd floor restroom.",
    department: "Cleaning",
    category: "Sanitation",
    location: "Block A · Floor 2",
    priority: "Medium",
    status: "In Progress",
    date: "2026-04-27T11:28:00Z",
    submittedBy: "Ishita Rao",
    assignedTo: "Lakshmi Devi",
  },
  {
    id: "CMP-1038",
    title: "Projector not turning on",
    description: "HDMI input shows no signal even after switching cables.",
    department: "IT",
    category: "Hardware",
    location: "Block C · Lab 4",
    priority: "Urgent",
    status: "Pending",
    date: "2026-04-27T08:11:00Z",
    submittedBy: "Karthik Menon",
  },
  {
    id: "CMP-1037",
    title: "AC not cooling in cabin 12",
    description: "Temperature stays around 28°C despite setting at 22°C.",
    department: "Electrical",
    category: "HVAC",
    location: "Block B · Cabin 12",
    priority: "High",
    status: "Resolved",
    date: "2026-04-26T13:50:00Z",
    submittedBy: "Sneha Pillai",
    assignedTo: "Manoj Verma",
  },
  {
    id: "CMP-1036",
    title: "Broken chair in library",
    description: "Backrest detached, unsafe for use.",
    department: "Maintenance",
    category: "Furniture",
    location: "Library · Zone B",
    priority: "Low",
    status: "Resolved",
    date: "2026-04-26T10:02:00Z",
    submittedBy: "Vikram Joshi",
    assignedTo: "Suresh Kumar",
  },
  {
    id: "CMP-1035",
    title: "Spilled coffee near reception",
    description: "Slipping hazard near the main entrance.",
    department: "Cleaning",
    category: "Sanitation",
    location: "Reception",
    priority: "Urgent",
    status: "Resolved",
    date: "2026-04-26T09:18:00Z",
    submittedBy: "Anjali Desai",
    assignedTo: "Lakshmi Devi",
  },
];

export const stats = {
  total: 248,
  pending: 36,
  inProgress: 58,
  resolved: 154,
  avgResolution: "1d 6h",
  satisfaction: 92,
};

export const complaintsByCategory = [
  { category: "IT", value: 78 },
  { category: "Electrical", value: 54 },
  { category: "Maintenance", value: 62 },
  { category: "Cleaning", value: 54 },
];

export const statusDistribution = [
  { name: "Pending", value: 36 },
  { name: "In Progress", value: 58 },
  { name: "Resolved", value: 154 },
];

export const resolutionTrend = [
  { day: "Mon", submitted: 22, resolved: 18 },
  { day: "Tue", submitted: 28, resolved: 21 },
  { day: "Wed", submitted: 19, resolved: 24 },
  { day: "Thu", submitted: 32, resolved: 26 },
  { day: "Fri", submitted: 25, resolved: 30 },
  { day: "Sat", submitted: 14, resolved: 17 },
  { day: "Sun", submitted: 9, resolved: 12 },
];

export const timeline: TimelineEvent[] = [
  {
    id: "t1",
    title: "Complaint submitted",
    description: "Ticket created and queued for routing.",
    timestamp: "2026-04-28T09:14:00Z",
    actor: "Aarav Mehta",
    type: "created",
  },
  {
    id: "t2",
    title: "Auto-routed to IT department",
    description: "Smart routing matched keywords: Wi-Fi, network, DHCP.",
    timestamp: "2026-04-28T09:14:30Z",
    actor: "System",
    type: "updated",
  },
  {
    id: "t3",
    title: "Assigned to Priya Sharma",
    description: "Priya is the on-call network engineer.",
    timestamp: "2026-04-28T09:22:00Z",
    actor: "Admin",
    type: "assigned",
  },
  {
    id: "t4",
    title: "Investigation in progress",
    description: "Restarted access points on floor 3. Monitoring stability.",
    timestamp: "2026-04-28T10:05:00Z",
    actor: "Priya Sharma",
    type: "comment",
  },
];
