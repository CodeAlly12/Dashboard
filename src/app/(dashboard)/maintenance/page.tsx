"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, User, Calendar } from "lucide-react";
import { VariantProps } from "class-variance-authority";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  properties,
  maintenanceIssues,
  maintenancePriorityColor,
  type MaintenancePriority,
} from "@/lib/mock-data";

const priorities: (MaintenancePriority | "All")[] = ["All", "Critical", "High", "Medium", "Low"];

export default function MaintenancePage() {
  const [filter, setFilter] = React.useState<MaintenancePriority | "All">("All");
  const filtered = maintenanceIssues.filter((m) => filter === "All" || m.priority === filter);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Maintenance"
        description="Open issues, scheduled maintenance, and asset tracking."
        actions={
          <Button variant="gold" size="sm">
            <Plus className="size-4" /> Report Issue
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as MaintenancePriority | "All")}>
        <TabsList>
          {priorities.map((p) => (
            <TabsTrigger key={p} value={p}>
              {p}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <Card>
              <CardContent className="flex flex-col gap-3 pt-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.id}</p>
                  </div>
                  <Badge
                    variant={maintenancePriorityColor[m.priority] as VariantProps<typeof badgeVariants>["variant"]}
                  >
                    {m.priority}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" /> {properties[m.property].name} · {m.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" /> {m.assignedTo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" /> {m.reported}
                  </span>
                </div>
                <Badge variant="outline" className="w-fit">
                  {m.status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
