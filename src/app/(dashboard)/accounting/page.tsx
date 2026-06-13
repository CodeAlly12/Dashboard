"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Wallet, TrendingDown, TrendingUp, FileWarning, Receipt } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { Badge } from "@/components/ui/badge";
import { accountingSummary, expenseBreakdown } from "@/lib/mock-data";

const COLORS = ["#D4AF37", "#0F172A", "#38BDF8", "#34D399", "#F472B6"];

const stats = [
  { icon: TrendingUp, label: "Total Revenue", value: accountingSummary.totalRevenue, prefix: "$" },
  { icon: TrendingDown, label: "Total Expenses", value: accountingSummary.totalExpenses, prefix: "$" },
  { icon: Wallet, label: "Net Income", value: accountingSummary.netIncome, prefix: "$" },
  { icon: Receipt, label: "Taxes Due", value: accountingSummary.taxesDue, prefix: "$" },
];

export default function AccountingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounting"
        description="Revenue, expenses, taxes and outstanding invoices."
        actions={
          <Badge variant="warning" className="gap-1.5">
            <FileWarning className="size-3.5" /> {accountingSummary.outstandingInvoices} invoices due
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card>
              <CardContent className="pt-2">
                <s.icon className="mb-2 size-4 text-gold" />
                <div className="text-2xl font-semibold">
                  <AnimatedCounter value={s.value} prefix={s.prefix} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Where operating costs are going this month.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  animationDuration={900}
                >
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {expenseBreakdown.map((e, i) => (
              <div key={e.category} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm">{e.category}</span>
                </div>
                <span className="text-sm font-semibold">${e.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
