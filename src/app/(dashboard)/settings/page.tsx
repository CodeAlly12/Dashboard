"use client";

import { Building2, Bell, Link2, Palette, User } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { properties, channels } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your account, properties, integrations and preferences." />

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile"><User className="size-4" /> Profile</TabsTrigger>
          <TabsTrigger value="properties"><Building2 className="size-4" /> Properties</TabsTrigger>
          <TabsTrigger value="integrations"><Link2 className="size-4" /> Integrations</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-4" /> Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" defaultValue="Ally" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="allyessie12@gmail.com" />
              </div>
              <Button variant="gold" className="w-fit">Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(properties).map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.location}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Property name</Label>
                    <Input defaultValue={p.name} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Website</Label>
                    <Input defaultValue={p.website ?? ""} placeholder="https://" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Total rooms</Label>
                    <Input defaultValue={p.rooms} type="number" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>Manage OTA, payment and communication integrations.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[...channels, "Stripe Payments", "WhatsApp Business", "Google Analytics"].map((c) => (
                <div key={c} className="flex items-center justify-between rounded-xl border border-border/50 p-3 text-sm">
                  <span>{c}</span>
                  <Switch defaultChecked={!["Vrbo", "Expedia"].includes(c)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                "New reservations",
                "Cancellations",
                "Pending payments",
                "Maintenance alerts",
                "Guest messages",
                "Revenue forecasts from North Star AI",
              ].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-xl border border-border/50 p-3 text-sm">
                  <span>{n}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Switch between light and dark mode.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <span className="text-sm">Theme</span>
              <ThemeToggle />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
