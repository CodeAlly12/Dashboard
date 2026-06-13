import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  Network,
  Users,
  Sparkles,
  Wrench,
  TrendingUp,
  Wallet,
  UserCog,
  FileBarChart,
  Megaphone,
  Globe,
  CalendarDays,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: { title: string; href: string }[];
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Properties",
    href: "/properties",
    icon: Building2,
    children: [
      { title: "HH Villa", href: "/properties/hh-villa" },
      { title: "Giant House", href: "/properties/giant-house" },
    ],
  },
  { title: "Reservations", href: "/reservations", icon: CalendarRange },
  { title: "Channel Manager", href: "/channel-manager", icon: Network },
  { title: "Guests", href: "/guests", icon: Users },
  { title: "Housekeeping", href: "/housekeeping", icon: Sparkles },
  { title: "Maintenance", href: "/maintenance", icon: Wrench },
  { title: "Revenue", href: "/revenue", icon: TrendingUp },
  { title: "Accounting", href: "/accounting", icon: Wallet },
  { title: "Staff", href: "/staff", icon: UserCog },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Marketing", href: "/marketing", icon: Megaphone },
  { title: "Website Bookings", href: "/website-bookings", icon: Globe },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Settings", href: "/settings", icon: Settings },
];
