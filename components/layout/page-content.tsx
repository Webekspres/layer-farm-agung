import { cn } from "@/lib/utils";

type PageContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-6 p-4 pb-8 md:p-6 lg:p-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
