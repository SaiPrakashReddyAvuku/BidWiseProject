export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass-panel rounded-xl border-dashed p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}



