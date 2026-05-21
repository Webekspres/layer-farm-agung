import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
