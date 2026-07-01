type DailyInputRecapEmptyPanelProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export function DailyInputRecapEmptyPanel({
  title,
  description,
  icon,
}: DailyInputRecapEmptyPanelProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
      {icon ? <div className="mb-4">{icon}</div> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
