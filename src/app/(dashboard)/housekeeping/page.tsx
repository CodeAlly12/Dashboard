"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles as SparklesIcon, AlertCircle, ClipboardCheck, User } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { properties, housekeepingTasks, type RoomStatus } from "@/lib/mock-data";

const columns: { status: RoomStatus; icon: React.ElementType; accent: string }[] = [
  { status: "Dirty", icon: AlertCircle, accent: "text-red-500" },
  { status: "In Progress", icon: SparklesIcon, accent: "text-sky-500" },
  { status: "Inspection", icon: ClipboardCheck, accent: "text-amber-500" },
  { status: "Clean", icon: CheckCircle2, accent: "text-emerald-500" },
];

export default function HousekeepingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Housekeeping" description="Live room status, cleaning progress and inspections." />

      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((col, ci) => {
          const tasks = housekeepingTasks.filter((t) => t.status === col.status);
          return (
            <motion.div
              key={col.status}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.08 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <col.icon className={`size-4 ${col.accent}`} />
                    {col.status}
                    <Badge variant="secondary" className="ml-auto">
                      {tasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {tasks.map((t, i) => (
                    <motion.div
                      key={t.room}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: ci * 0.08 + i * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="rounded-xl border border-border/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{t.room}</p>
                        <Badge variant="outline">{properties[t.property].name}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="size-3" /> {t.assignedTo}
                        </span>
                        <span>{t.eta}</span>
                      </div>
                      {t.inspection !== "N/A" && (
                        <div className="mt-2">
                          <Badge variant={t.inspection === "Passed" ? "success" : "warning"}>
                            Inspection: {t.inspection}
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">No rooms</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
