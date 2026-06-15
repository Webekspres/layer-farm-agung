type DailyInputRecapEmptyPanelProps = {
  title: string;
  description: string;
};

export function DailyInputRecapEmptyPanel({
  title,
  description,
}: DailyInputRecapEmptyPanelProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
