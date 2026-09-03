export function ProgressBar({ step, total }: { step: number; total: number }) {
  const value = ((step + 1) / total) * 100;

  return (
    <div className="mb-6">
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Étape {step + 1} / {total}
      </p>
    </div>
  );
}
