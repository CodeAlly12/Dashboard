"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export function Header() {
  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 px-4 py-3 lg:px-6">
      <MobileSidebar />

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search reservations, guests, rooms…" className="pl-9" />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="size-[18px]" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
            3
          </Badge>
        </Button>
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
