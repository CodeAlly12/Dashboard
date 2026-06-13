"use client";

import { motion } from "framer-motion";
import { FileText, Download, TrendingUp, Hotel, Users, Wrench } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reports = [
  {
    icon: TrendingUp,
    title: "Monthly Revenue Report",
    description: "Channel-by-channel revenue breakdown for HH Villa and Giant House.",
    updated: "Generated daily",
  },
  {
    icon: Hotel,
    title: "Occupancy & RevPAR Report",
    description: "Occupancy rate, ADR, RevPAR and length-of-stay trends.",
    updated: "Generated weekly",
  },
  {
    icon: Users,
    title: "Guest Insights Report",
    description: "Guest demographics, repeat stays, VIP activity and satisfaction.",
    updated: "Generated monthly",
  },
  {
    icon: Wrench,
    title: "Operations Report",
    description: "Housekeeping turnaround times and maintenance resolution rates.",
    updated: "Generated weekly",
  },
  {
    icon: FileText,
    title: "Tax & Accounting Summary",
    description: "Income, expenses, commissions and taxes due across both properties.",
    updated: "Generated monthly",
  },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Download and review operational and financial reports." />

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="gold-gradient flex size-10 items-center justify-center rounded-xl">
                    <r.icon className="size-5 text-navy" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <CardDescription>{r.updated}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{r.description}</p>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Download className="size-4" /> Export
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
