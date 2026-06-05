import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", {
  variants: {
    variant: {
      green: "bg-primary/15 text-primary",
      teal: "bg-secondary/15 text-secondary",
      muted: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { variant: "green" },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);
