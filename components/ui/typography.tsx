import * as React from "react";

import { cn } from "@/lib/utils";

type TypographyVariant =
  | "title"
  | "subtitle"
  | "body"
  | "label"
  | "caption";

type TypographyProps = React.HTMLAttributes<HTMLParagraphElement> & {
  variant?: TypographyVariant;
  muted?: boolean;
};

const variantStyles: Record<TypographyVariant, string> = {
  title: "text-lg font-semibold",
  subtitle: "text-base font-medium",
  body: "text-base",
  label: "text-sm font-semibold uppercase tracking-[0.08em]",
  caption: "text-sm",
};

export function Typography({
  className,
  variant = "body",
  muted,
  ...props
}: TypographyProps) {
  return (
    <p
      className={cn(
        variantStyles[variant],
        muted ? "text-muted-foreground" : "text-foreground",
        className,
      )}
      {...props}
    />
  );
}
