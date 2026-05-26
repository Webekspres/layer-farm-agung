"use client";

import { useTheme } from "next-themes";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const sonnerStyle = {
  "--normal-bg": "var(--sonner-normal-bg)",
  "--normal-text": "var(--sonner-normal-text)",
  "--normal-border": "var(--sonner-normal-border)",
  "--success-bg": "var(--sonner-success-bg)",
  "--success-text": "var(--sonner-success-text)",
  "--success-border": "var(--sonner-success-border)",
  "--error-bg": "var(--sonner-error-bg)",
  "--error-text": "var(--sonner-error-text)",
  "--error-border": "var(--sonner-error-border)",
  "--warning-bg": "var(--sonner-warning-bg)",
  "--warning-text": "var(--sonner-warning-text)",
  "--warning-border": "var(--sonner-warning-border)",
  "--info-bg": "var(--sonner-info-bg)",
  "--info-text": "var(--sonner-info-text)",
  "--info-border": "var(--sonner-info-border)",
  "--border-radius": "var(--radius)",
} as React.CSSProperties;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={sonnerStyle}
      toastOptions={{
        classNames: {
          toast:
            "group toast !font-sans !shadow-md group-[.toaster]:border group-[.toaster]:border-border",
          description: "group-[.toast]:!text-muted-foreground",
          actionButton:
            "group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground",
          cancelButton:
            "group-[.toast]:!bg-muted group-[.toast]:!text-muted-foreground",
          closeButton:
            "group-[.toast]:!border-border group-[.toast]:!bg-muted/80 group-[.toast]:!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
