"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("bg-secondary relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <motion.div
        className={cn("h-full gold-gradient rounded-full", indicatorClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${value ?? 0}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
