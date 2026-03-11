export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="glass-panel animate-pulse rounded-xl p-6 text-sm text-muted-foreground">{label}</div>
  );
}



