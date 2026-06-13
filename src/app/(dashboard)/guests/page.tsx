"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Star, BadgeCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { guests } from "@/lib/mock-data";

export default function GuestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Guest CRM" description="Profiles, stay history, preferences and VIP status." />

      <Input placeholder="Search guests by name, email or nationality…" className="max-w-md" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guests.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="gold-gradient text-navy text-base font-semibold">
                      {g.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold">{g.name}</p>
                      {g.vip && <BadgeCheck className="size-4 text-gold" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{g.nationality}</p>
                  </div>
                  {g.vip && <Badge variant="gold">VIP</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-3.5" /> {g.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-3.5" /> {g.phone}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/50 p-3 text-sm">
                  <div>
                    <p className="font-semibold">{g.stays}</p>
                    <p className="text-xs text-muted-foreground">Stays</p>
                  </div>
                  <div>
                    <p className="font-semibold">${g.totalSpend.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Spend</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="size-3.5 fill-gold text-gold" />
                    <p className="font-semibold">{g.rating}</p>
                  </div>
                </div>
                {g.preferences.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {g.preferences.map((p) => (
                      <Badge key={p} variant="secondary">
                        {p}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
