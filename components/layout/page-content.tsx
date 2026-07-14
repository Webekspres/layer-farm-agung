import { cn } from "@/lib/utils";

type PageContentProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wrapper for dashboard main content.
 * Layout/spacing: `page-content` utility in `app/globals.css`.
 */
export function PageContent({ children, className }: PageContentProps) {
  return <div className={cn("page-content", className)}>{children}</div>;
}
