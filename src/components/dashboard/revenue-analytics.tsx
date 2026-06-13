"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  channels,
  channelColors,
  dailyRevenue,
  weeklyRevenue,
  monthlyRevenue,
  yearlyRevenue,
} from "@/lib/mock-data";

const ranges = [
  { key: "daily", label: "Daily", data: dailyRevenue, chart: "area" as const },
  { key: "weekly", label: "Weekly", data: weeklyRevenue, chart: "bar" as const },
  { key: "monthly", label: "Monthly", data: monthlyRevenue, chart: "bar" as const },
  { key: "yearly", label: "Yearly", data: yearlyRevenue, chart: "area" as const },
];

export function RevenueAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>
          Daily, weekly, monthly and yearly revenue across all booking channels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly">
          <TabsList>
            {ranges.map((r) => (
              <TabsTrigger key={r.key} value={r.key}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {ranges.map((r) => (
            <TabsContent key={r.key} value={r.key}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="h-80 w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  {r.chart === "area" ? (
                    <AreaChart data={r.data}>
                      <defs>
                        {channels.map((c) => (
                          <linearGradient key={c} id={`grad-${c}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={channelColors[c]} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={channelColors[c]} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} width={48} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                      />
                      <Legend />
                      {channels.map((c) => (
                        <Area
                          key={c}
                          type="monotone"
                          dataKey={c}
                          stackId="1"
                          stroke={channelColors[c]}
                          fill={`url(#grad-${c})`}
                          strokeWidth={2}
                          animationDuration={900}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <BarChart data={r.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} width={48} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                      />
                      <Legend />
                      {channels.map((c) => (
                        <Bar
                          key={c}
                          dataKey={c}
                          stackId="1"
                          fill={channelColors[c]}
                          radius={[4, 4, 0, 0]}
                          animationDuration={900}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
