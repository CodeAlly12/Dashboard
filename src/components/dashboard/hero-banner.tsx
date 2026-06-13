"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarCheck2, TrendingUp, Users } from "lucide-react";

import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { kpis } from "@/lib/mock-data";

const stats = [
  {
    icon: TrendingUp,
    label: "Total Revenue (MTD)",
    value: kpis.totalRevenue,
    prefix: "$",
    change: "+12.4%",
  },
  {
    icon: CalendarCheck2,
    label: "Total Bookings",
    value: kpis.totalBookings,
    suffix: "",
    change: "+8 this week",
  },
  {
    icon: Users,
    label: "Avg. Occupancy",
    value: kpis.avgOccupancy,
    suffix: "%",
    change: "+5.2%",
  },
  {
    icon: ArrowUpRight,
    label: "Guest Rating",
    value: kpis.avgRating,
    decimals: 1,
    suffix: " / 5",
    change: "Excellent",
  },
];

export function HeroBanner() {
  return (
    <div className="navy-gradient relative overflow-hidden rounded-2xl p-6 text-white sm:p-8">
      <motion.div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium uppercase tracking-[0.3em] text-gold"
          >
            North Star Hospitality OS
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl font-semibold sm:text-4xl"
          >
            Welcome Back, Ally
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-1 max-w-xl text-sm text-white/70 sm:text-base"
          >
            Manage HH Villa and Giant House from one place — bookings, revenue,
            occupancy and guest experience, all in real time.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-4"
            >
              <stat.icon className="mb-2 size-4 text-gold" />
              <div className="text-xl font-semibold sm:text-2xl">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </div>
              <div className="mt-1 text-xs text-white/60">{stat.label}</div>
              <div className="mt-1 text-xs text-gold">{stat.change}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
