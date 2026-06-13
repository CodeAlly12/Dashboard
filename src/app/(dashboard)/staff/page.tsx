"use client";

import { motion } from "framer-motion";
import { Mail, Plus } from "lucide-react";
import { VariantProps } from "class-variance-authority";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { properties, staff } from "@/lib/mock-data";

const statusVariant: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
  "On Duty": "success",
  "Off Duty": "secondary",
  "On Leave": "warning",
};

export default function StaffPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description="Team directory, roles and shift status."
        actions={
          <Button variant="gold" size="sm">
            <Plus className="size-4" /> Add Staff
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <Card>
              <CardContent className="flex items-center gap-3 pt-2">
                <Avatar className="size-12">
                  <AvatarFallback className="gold-gradient text-navy text-base font-semibold">
                    {s.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="size-3" /> {s.email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {s.property === "both" ? "Both properties" : properties[s.property].name}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
