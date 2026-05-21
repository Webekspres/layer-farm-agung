import { cn } from "@/lib/utils";

type PageContentProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Standard main-area spacing for all dashboard pages.
 * Keeps content away from sidebar/header across breakpoints.
 */
export function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 w-full max-w-full flex-1 flex-col gap-6",
        "p-4 pb-8 pt-5",
        "sm:gap-6 sm:p-5 sm:pb-10 sm:pt-6",
        "md:gap-6 md:p-6 md:pb-10 md:pt-6",
        "lg:gap-8 lg:p-8 lg:pb-12 lg:pt-8",
        "xl:gap-8 xl:p-12 xl:pb-14 xl:pt-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
