"use client";

import { motion } from "framer-motion";
import { Calendar, DollarSign, Boxes, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { channelConnections, channelColors, properties } from "@/lib/mock-data";

const syncIcon = {
  Synced: CheckCircle2,
  Syncing: Loader2,
  Error: XCircle,
};

const syncColor: Record<string, string> = {
  Synced: "text-emerald-500",
  Syncing: "text-sky-500",
  Error: "text-red-500",
};

export default function ChannelManagerPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Channel Manager"
        description="Synchronize listings, rates, and availability across all OTAs."
        actions={
          <Button variant="gold" size="sm">
            <RefreshCw className="size-4" /> Sync All
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channelConnections.map((c, i) => {
          return (
            <motion.div
              key={`${c.property}-${c.channel}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-9 items-center justify-center rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: channelColors[c.channel] }}
                      >
                        {c.channel.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <CardTitle className="text-base">{c.channel}</CardTitle>
                        <CardDescription>{properties[c.property].name}</CardDescription>
                      </div>
                    </div>
                    <Switch checked={c.connected} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <SyncRow icon={Calendar} label="Calendar Sync" status={c.calendarSync} />
                  <SyncRow icon={DollarSign} label="Rate Sync" status={c.rateSync} />
                  <SyncRow icon={Boxes} label="Inventory Sync" status={c.inventorySync} />
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last sync</span>
                    <span>{c.lastSync}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SyncRow({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ElementType;
  label: string;
  status: "Synced" | "Syncing" | "Error";
}) {
  const StatusIcon = syncIcon[status];
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <Badge variant="outline" className={`gap-1 ${syncColor[status]}`}>
        <StatusIcon className={`size-3 ${status === "Syncing" ? "animate-spin" : ""}`} />
        {status}
      </Badge>
    </div>
  );
}
