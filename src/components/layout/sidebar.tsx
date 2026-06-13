"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronsLeft, ChevronsRight, Compass } from "lucide-react";

import { navItems } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [propertiesOpen, setPropertiesOpen] = React.useState(true);

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 268 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className={cn(
        "glass relative hidden h-screen flex-col border-r border-border/60 px-3 py-5 lg:flex",
        className
      )}
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="gold-gradient flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
          <Compass className="size-5 text-navy" strokeWidth={2.5} />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-sm font-semibold leading-tight whitespace-nowrap">
                North Star
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Hospitality OS
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.children) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => setPropertiesOpen((v) => !v)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/70",
                    isActive && "bg-secondary/70"
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left whitespace-nowrap">{item.title}</span>
                      <motion.span animate={{ rotate: propertiesOpen ? 180 : 0 }}>
                        <ChevronDown className="size-4" />
                      </motion.span>
                    </>
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {!collapsed && propertiesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-9"
                    >
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary/70",
                              childActive
                                ? "text-gold font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/70",
                isActive ? "text-navy dark:text-gold" : "text-foreground/80"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-secondary/80"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 size-[18px] shrink-0" />
              {!collapsed && <span className="relative z-10 whitespace-nowrap">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((v) => !v)}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-border/60 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/70"
      >
        {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        {!collapsed && "Collapse"}
      </button>
    </motion.aside>
  );
}
