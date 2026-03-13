import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
};

export function StatCard({ title, value, subtitle, href }: StatCardProps) {
  const card = (
    <Card className={href ? "transition-colors hover:border-primary/50 hover:bg-white/60 dark:hover:bg-slate-900/50" : ""}>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </CardContent>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}
