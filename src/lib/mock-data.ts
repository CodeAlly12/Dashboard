// Centralized mock data for North Star Hospitality OS
// Replace with live Supabase queries / channel APIs in production.

export type Channel =
  | "Airbnb"
  | "Booking.com"
  | "Expedia"
  | "Vrbo"
  | "Direct Website"
  | "Social Media";

export const channels: Channel[] = [
  "Airbnb",
  "Booking.com",
  "Expedia",
  "Vrbo",
  "Direct Website",
  "Social Media",
];

export const channelColors: Record<Channel, string> = {
  Airbnb: "#FF5A5F",
  "Booking.com": "#003580",
  Expedia: "#FFC72C",
  Vrbo: "#3D67FF",
  "Direct Website": "#D4AF37",
  "Social Media": "#34D399",
};

export type PropertyId = "hh-villa" | "giant-house";

export const properties: Record<
  PropertyId,
  {
    id: PropertyId;
    name: string;
    location: string;
    website?: string;
    image: string;
    rooms: number;
    occupancy: number;
    revenue: number;
    upcomingArrivals: number;
    availableRooms: number;
    adr: number;
    revpar: number;
    leadTime: number;
    lengthOfStay: number;
    channels: Channel[];
  }
> = {
  "hh-villa": {
    id: "hh-villa",
    name: "HH Villa",
    location: "Oceanfront, Harbour Hills",
    website: "www.hhvilla.com",
    image: "/images/hh-villa.svg",
    rooms: 6,
    occupancy: 82,
    revenue: 48250,
    upcomingArrivals: 4,
    availableRooms: 1,
    adr: 410,
    revpar: 336,
    leadTime: 21,
    lengthOfStay: 4.2,
    channels: ["Airbnb", "Booking.com", "Direct Website", "Social Media"],
  },
  "giant-house": {
    id: "giant-house",
    name: "Giant House",
    location: "Hillside Estate, North Ridge",
    image: "/images/giant-house.svg",
    rooms: 8,
    occupancy: 68,
    revenue: 35400,
    upcomingArrivals: 3,
    availableRooms: 3,
    adr: 365,
    revpar: 248,
    leadTime: 17,
    lengthOfStay: 3.6,
    channels: ["Airbnb", "Booking.com", "Expedia", "Vrbo", "Direct Website"],
  },
};

// Revenue analytics ------------------------------------------------------

export const dailyRevenue = Array.from({ length: 14 }).map((_, i) => {
  const day = i + 1;
  return {
    label: `Jun ${day}`,
    Airbnb: Math.round(900 + Math.random() * 600),
    "Booking.com": Math.round(700 + Math.random() * 500),
    Expedia: Math.round(200 + Math.random() * 300),
    Vrbo: Math.round(150 + Math.random() * 250),
    "Direct Website": Math.round(400 + Math.random() * 400),
    "Social Media": Math.round(100 + Math.random() * 200),
  };
});

export const weeklyRevenue = [
  { label: "Week 1", Airbnb: 6200, "Booking.com": 4800, Expedia: 1500, Vrbo: 1200, "Direct Website": 3000, "Social Media": 900 },
  { label: "Week 2", Airbnb: 7100, "Booking.com": 5200, Expedia: 1700, Vrbo: 1400, "Direct Website": 3400, "Social Media": 1100 },
  { label: "Week 3", Airbnb: 6800, "Booking.com": 5600, Expedia: 1900, Vrbo: 1600, "Direct Website": 3700, "Social Media": 1250 },
  { label: "Week 4", Airbnb: 7600, "Booking.com": 6100, Expedia: 2100, Vrbo: 1750, "Direct Website": 4000, "Social Media": 1400 },
];

export const monthlyRevenue = [
  { label: "Jan", Airbnb: 22000, "Booking.com": 17000, Expedia: 5200, Vrbo: 4100, "Direct Website": 9800, "Social Media": 3000 },
  { label: "Feb", Airbnb: 24000, "Booking.com": 18500, Expedia: 5600, Vrbo: 4400, "Direct Website": 10200, "Social Media": 3200 },
  { label: "Mar", Airbnb: 27500, "Booking.com": 20000, Expedia: 6100, Vrbo: 4900, "Direct Website": 11500, "Social Media": 3600 },
  { label: "Apr", Airbnb: 29000, "Booking.com": 21500, Expedia: 6500, Vrbo: 5200, "Direct Website": 12300, "Social Media": 3900 },
  { label: "May", Airbnb: 31500, "Booking.com": 23000, Expedia: 7000, Vrbo: 5600, "Direct Website": 13200, "Social Media": 4200 },
  { label: "Jun", Airbnb: 33800, "Booking.com": 24800, Expedia: 7400, Vrbo: 6000, "Direct Website": 14100, "Social Media": 4600 },
];

export const yearlyRevenue = [
  { label: "2021", Airbnb: 180000, "Booking.com": 140000, Expedia: 42000, Vrbo: 33000, "Direct Website": 78000, "Social Media": 21000 },
  { label: "2022", Airbnb: 215000, "Booking.com": 165000, Expedia: 51000, Vrbo: 40000, "Direct Website": 95000, "Social Media": 27000 },
  { label: "2023", Airbnb: 248000, "Booking.com": 188000, Expedia: 58000, Vrbo: 47000, "Direct Website": 112000, "Social Media": 33000 },
  { label: "2024", Airbnb: 281000, "Booking.com": 212000, Expedia: 66000, Vrbo: 54000, "Direct Website": 129000, "Social Media": 39000 },
  { label: "2025", Airbnb: 312000, "Booking.com": 236000, Expedia: 74000, Vrbo: 61000, "Direct Website": 147000, "Social Media": 46000 },
];

export const occupancyTrend = [
  { label: "Jan", "HH Villa": 58, "Giant House": 44 },
  { label: "Feb", "HH Villa": 62, "Giant House": 49 },
  { label: "Mar", "HH Villa": 70, "Giant House": 55 },
  { label: "Apr", "HH Villa": 74, "Giant House": 58 },
  { label: "May", "HH Villa": 79, "Giant House": 63 },
  { label: "Jun", "HH Villa": 82, "Giant House": 68 },
];

// Reservations ------------------------------------------------------------

export type ReservationStatus =
  | "New Booking"
  | "Check-in Today"
  | "Check-out Today"
  | "Pending Payment"
  | "Cancelled";

export const reservationStatusColor: Record<ReservationStatus, string> = {
  "New Booking": "info",
  "Check-in Today": "success",
  "Check-out Today": "warning",
  "Pending Payment": "destructive",
  Cancelled: "secondary",
};

export interface Reservation {
  id: string;
  guest: string;
  property: PropertyId;
  channel: Channel;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: ReservationStatus;
  avatar: string;
}

export const reservations: Reservation[] = [
  { id: "RES-1042", guest: "Olivia Bennett", property: "hh-villa", channel: "Airbnb", checkIn: "2026-06-13", checkOut: "2026-06-18", guests: 4, total: 2050, status: "Check-in Today", avatar: "OB" },
  { id: "RES-1041", guest: "Marco Tessier", property: "giant-house", channel: "Booking.com", checkIn: "2026-06-08", checkOut: "2026-06-13", guests: 6, total: 1825, status: "Check-out Today", avatar: "MT" },
  { id: "RES-1040", guest: "Aiko Tanaka", property: "hh-villa", channel: "Direct Website", checkIn: "2026-06-20", checkOut: "2026-06-27", guests: 2, total: 2870, status: "New Booking", avatar: "AT" },
  { id: "RES-1039", guest: "Daniel Okafor", property: "giant-house", channel: "Expedia", checkIn: "2026-06-22", checkOut: "2026-06-25", guests: 5, total: 1095, status: "Pending Payment", avatar: "DO" },
  { id: "RES-1038", guest: "Sofia Reyes", property: "hh-villa", channel: "Social Media", checkIn: "2026-07-01", checkOut: "2026-07-06", guests: 3, total: 2050, status: "New Booking", avatar: "SR" },
  { id: "RES-1037", guest: "Lucas Meyer", property: "giant-house", channel: "Vrbo", checkIn: "2026-06-05", checkOut: "2026-06-10", guests: 7, total: 1825, status: "Cancelled", avatar: "LM" },
  { id: "RES-1036", guest: "Imani Brooks", property: "hh-villa", channel: "Booking.com", checkIn: "2026-06-15", checkOut: "2026-06-19", guests: 2, total: 1640, status: "New Booking", avatar: "IB" },
];

// Guests --------------------------------------------------------------------

export interface Guest {
  id: string;
  name: string;
  nationality: string;
  email: string;
  phone: string;
  stays: number;
  totalSpend: number;
  rating: number;
  vip: boolean;
  lastStay: string;
  preferences: string[];
  avatar: string;
}

export const guests: Guest[] = [
  { id: "G-001", name: "Olivia Bennett", nationality: "United Kingdom", email: "olivia.bennett@example.com", phone: "+44 7700 900123", stays: 5, totalSpend: 12400, rating: 4.9, vip: true, lastStay: "2026-06-13", preferences: ["Late checkout", "Ocean view", "Vegan breakfast"], avatar: "OB" },
  { id: "G-002", name: "Marco Tessier", nationality: "France", email: "marco.tessier@example.com", phone: "+33 6 12 34 56 78", stays: 2, totalSpend: 4200, rating: 4.6, vip: false, lastStay: "2026-06-13", preferences: ["Airport transfer"], avatar: "MT" },
  { id: "G-003", name: "Aiko Tanaka", nationality: "Japan", email: "aiko.tanaka@example.com", phone: "+81 90-1234-5678", stays: 7, totalSpend: 21800, rating: 5.0, vip: true, lastStay: "2026-05-02", preferences: ["Quiet room", "Extra towels", "Early check-in"], avatar: "AT" },
  { id: "G-004", name: "Daniel Okafor", nationality: "Nigeria", email: "daniel.okafor@example.com", phone: "+234 802 123 4567", stays: 1, totalSpend: 1095, rating: 4.2, vip: false, lastStay: "2026-06-22", preferences: [], avatar: "DO" },
  { id: "G-005", name: "Sofia Reyes", nationality: "Spain", email: "sofia.reyes@example.com", phone: "+34 612 345 678", stays: 3, totalSpend: 6800, rating: 4.8, vip: false, lastStay: "2026-07-01", preferences: ["Pet friendly", "Crib"], avatar: "SR" },
];

// Housekeeping --------------------------------------------------------------

export type RoomStatus = "Clean" | "In Progress" | "Dirty" | "Inspection";

export const roomStatusColor: Record<RoomStatus, string> = {
  Clean: "success",
  "In Progress": "info",
  Dirty: "destructive",
  Inspection: "warning",
};

export interface HousekeepingTask {
  room: string;
  property: PropertyId;
  status: RoomStatus;
  assignedTo: string;
  inspection: "Passed" | "Pending" | "Failed" | "N/A";
  eta: string;
}

export const housekeepingTasks: HousekeepingTask[] = [
  { room: "Villa Suite 1", property: "hh-villa", status: "Clean", assignedTo: "Marisol Cruz", inspection: "Passed", eta: "Done" },
  { room: "Villa Suite 2", property: "hh-villa", status: "In Progress", assignedTo: "Marisol Cruz", inspection: "Pending", eta: "11:30 AM" },
  { room: "Villa Suite 3", property: "hh-villa", status: "Dirty", assignedTo: "Unassigned", inspection: "N/A", eta: "—" },
  { room: "Ocean Loft", property: "hh-villa", status: "Inspection", assignedTo: "James Wu", inspection: "Pending", eta: "12:00 PM" },
  { room: "Main Wing A", property: "giant-house", status: "Clean", assignedTo: "Bea Santos", inspection: "Passed", eta: "Done" },
  { room: "Main Wing B", property: "giant-house", status: "In Progress", assignedTo: "Bea Santos", inspection: "Pending", eta: "1:00 PM" },
  { room: "Garden Annex", property: "giant-house", status: "Dirty", assignedTo: "Unassigned", inspection: "N/A", eta: "—" },
];

// Maintenance -----------------------------------------------------------------

export type MaintenancePriority = "Critical" | "High" | "Medium" | "Low";

export const maintenancePriorityColor: Record<MaintenancePriority, string> = {
  Critical: "destructive",
  High: "warning",
  Medium: "info",
  Low: "secondary",
};

export interface MaintenanceIssue {
  id: string;
  title: string;
  property: PropertyId;
  location: string;
  priority: MaintenancePriority;
  status: "Open" | "Scheduled" | "In Progress" | "Resolved";
  assignedTo: string;
  reported: string;
}

export const maintenanceIssues: MaintenanceIssue[] = [
  { id: "MX-204", title: "Pool heater malfunction", property: "hh-villa", location: "Pool Deck", priority: "Critical", status: "In Progress", assignedTo: "Carlos Diaz", reported: "2026-06-12" },
  { id: "MX-203", title: "AC unit noise - Suite 2", property: "hh-villa", location: "Villa Suite 2", priority: "High", status: "Open", assignedTo: "Unassigned", reported: "2026-06-11" },
  { id: "MX-202", title: "Garden irrigation timer reset", property: "giant-house", location: "Garden", priority: "Medium", status: "Scheduled", assignedTo: "Pedro Alvez", reported: "2026-06-10" },
  { id: "MX-201", title: "Replace lobby light fixtures", property: "giant-house", location: "Main Wing A", priority: "Low", status: "Scheduled", assignedTo: "Pedro Alvez", reported: "2026-06-08" },
  { id: "MX-200", title: "Hot tub jet repair", property: "hh-villa", location: "Ocean Loft Terrace", priority: "High", status: "Resolved", assignedTo: "Carlos Diaz", reported: "2026-06-02" },
];

// Channel Manager ---------------------------------------------------------------

export interface ChannelConnection {
  channel: Channel;
  connected: boolean;
  property: PropertyId;
  calendarSync: "Synced" | "Syncing" | "Error";
  rateSync: "Synced" | "Syncing" | "Error";
  inventorySync: "Synced" | "Syncing" | "Error";
  lastSync: string;
}

export const channelConnections: ChannelConnection[] = [
  { channel: "Airbnb", connected: true, property: "hh-villa", calendarSync: "Synced", rateSync: "Synced", inventorySync: "Synced", lastSync: "2 min ago" },
  { channel: "Booking.com", connected: true, property: "hh-villa", calendarSync: "Synced", rateSync: "Syncing", inventorySync: "Synced", lastSync: "5 min ago" },
  { channel: "Direct Website", connected: true, property: "hh-villa", calendarSync: "Synced", rateSync: "Synced", inventorySync: "Synced", lastSync: "1 min ago" },
  { channel: "Airbnb", connected: true, property: "giant-house", calendarSync: "Synced", rateSync: "Synced", inventorySync: "Synced", lastSync: "3 min ago" },
  { channel: "Booking.com", connected: false, property: "giant-house", calendarSync: "Error", rateSync: "Error", inventorySync: "Error", lastSync: "Never" },
  { channel: "Expedia", connected: false, property: "giant-house", calendarSync: "Error", rateSync: "Error", inventorySync: "Error", lastSync: "Never" },
  { channel: "Vrbo", connected: false, property: "giant-house", calendarSync: "Error", rateSync: "Error", inventorySync: "Error", lastSync: "Never" },
  { channel: "Direct Website", connected: true, property: "giant-house", calendarSync: "Synced", rateSync: "Synced", inventorySync: "Synced", lastSync: "4 min ago" },
];

// Staff -------------------------------------------------------------------------

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  property: PropertyId | "both";
  status: "On Duty" | "Off Duty" | "On Leave";
  avatar: string;
  email: string;
}

export const staff: StaffMember[] = [
  { id: "S-01", name: "Marisol Cruz", role: "Head Housekeeper", property: "hh-villa", status: "On Duty", avatar: "MC", email: "marisol@northstar.io" },
  { id: "S-02", name: "James Wu", role: "Guest Experience Manager", property: "hh-villa", status: "On Duty", avatar: "JW", email: "james@northstar.io" },
  { id: "S-03", name: "Carlos Diaz", role: "Maintenance Lead", property: "both", status: "On Duty", avatar: "CD", email: "carlos@northstar.io" },
  { id: "S-04", name: "Bea Santos", role: "Housekeeper", property: "giant-house", status: "On Duty", avatar: "BS", email: "bea@northstar.io" },
  { id: "S-05", name: "Pedro Alvez", role: "Groundskeeper", property: "giant-house", status: "Off Duty", avatar: "PA", email: "pedro@northstar.io" },
  { id: "S-06", name: "Hannah Price", role: "Revenue Manager", property: "both", status: "On Leave", avatar: "HP", email: "hannah@northstar.io" },
];

// Messages -----------------------------------------------------------------------

export interface Message {
  id: string;
  guest: string;
  channel: "Airbnb" | "Booking.com" | "WhatsApp" | "Email";
  preview: string;
  time: string;
  unread: boolean;
  avatar: string;
  aiSuggestion: string;
}

export const messages: Message[] = [
  { id: "MSG-1", guest: "Olivia Bennett", channel: "Airbnb", preview: "Hi! What time can we check in today? We land at noon.", time: "9:14 AM", unread: true, avatar: "OB", aiSuggestion: "Hi Olivia! Early check-in from 12:30 PM is available at no extra cost — your Ocean Suite will be ready. Let us know your flight details and we'll arrange a welcome drink on arrival." },
  { id: "MSG-2", guest: "Aiko Tanaka", channel: "Email", preview: "Could you recommend a quiet restaurant nearby for our anniversary?", time: "8:02 AM", unread: true, avatar: "AT", aiSuggestion: "Congratulations on your anniversary! We recommend Marea Cliffside, a 5-minute walk with sunset views — shall we make a reservation for two at 7:30 PM?" },
  { id: "MSG-3", guest: "Marco Tessier", channel: "WhatsApp", preview: "Thanks for a great stay, everything was perfect!", time: "Yesterday", unread: false, avatar: "MT", aiSuggestion: "Thank you so much for the kind words, Marco! It was a pleasure hosting you — we hope to welcome you back soon." },
  { id: "MSG-4", guest: "Daniel Okafor", channel: "Booking.com", preview: "Is the property pet friendly? We'd like to bring our dog.", time: "Yesterday", unread: false, avatar: "DO", aiSuggestion: "Giant House is pet friendly for dogs under 25kg with a small cleaning fee of $50 — happy to add this to your reservation!" },
];

// Marketing ------------------------------------------------------------------

export const marketingChannels = [
  { name: "Google Ads", spend: 2400, conversions: 38, roi: 4.2 },
  { name: "Facebook Ads", spend: 1800, conversions: 27, roi: 3.6 },
  { name: "Instagram", spend: 1500, conversions: 31, roi: 4.8 },
  { name: "Organic / SEO", spend: 0, conversions: 22, roi: Infinity },
];

export const websiteTraffic = [
  { label: "Mon", visitors: 420, bookings: 6 },
  { label: "Tue", visitors: 380, bookings: 4 },
  { label: "Wed", visitors: 510, bookings: 8 },
  { label: "Thu", visitors: 470, bookings: 7 },
  { label: "Fri", visitors: 620, bookings: 11 },
  { label: "Sat", visitors: 740, bookings: 14 },
  { label: "Sun", visitors: 690, bookings: 12 },
];

// Calendar -----------------------------------------------------------------------

export interface CalendarEntry {
  date: string;
  property: PropertyId;
  type: "reservation" | "checkin" | "checkout" | "blocked" | "maintenance";
  label: string;
}

export const calendarEntries: CalendarEntry[] = [
  { date: "2026-06-13", property: "hh-villa", type: "checkin", label: "Olivia Bennett" },
  { date: "2026-06-13", property: "giant-house", type: "checkout", label: "Marco Tessier" },
  { date: "2026-06-15", property: "hh-villa", type: "reservation", label: "Imani Brooks" },
  { date: "2026-06-18", property: "hh-villa", type: "checkout", label: "Olivia Bennett" },
  { date: "2026-06-20", property: "hh-villa", type: "checkin", label: "Aiko Tanaka" },
  { date: "2026-06-16", property: "giant-house", type: "blocked", label: "Owner stay" },
  { date: "2026-06-17", property: "giant-house", type: "maintenance", label: "Pool heater service" },
  { date: "2026-06-22", property: "giant-house", type: "checkin", label: "Daniel Okafor" },
];

// Reports / accounting -------------------------------------------------------------

export const accountingSummary = {
  totalRevenue: 83650,
  totalExpenses: 28430,
  netIncome: 55220,
  outstandingInvoices: 4,
  taxesDue: 6120,
};

export const expenseBreakdown = [
  { category: "Housekeeping", amount: 9800 },
  { category: "Maintenance", amount: 6200 },
  { category: "Utilities", amount: 5400 },
  { category: "Marketing", amount: 4100 },
  { category: "Channel Commissions", amount: 2930 },
];

// KPI summary used on dashboard header counters

export const kpis = {
  totalRevenue: 83650,
  totalBookings: 47,
  avgOccupancy: 75,
  avgRating: 4.8,
};
