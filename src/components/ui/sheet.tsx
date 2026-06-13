"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in-0", className)}
      {...props}
    />
  );
}

const sheetVariants = cva(
  "glass fixed z-50 flex flex-col gap-4 shadow-2xl transition ease-in-out animate-in",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm slide-in-from-left",
        right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm slide-in-from-right",
      },
    },
    defaultVariants: { side: "right" },
  }
);

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & VariantProps<typeof sheetVariants>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content className={cn(sheetVariants({ side }), "p-6", className)} {...props}>
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription };
