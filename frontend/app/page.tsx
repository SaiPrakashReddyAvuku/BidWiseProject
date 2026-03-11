import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const featured = [
  "E-commerce Checkout Optimization",
  "Customer Support AI Chatbot",
  "Mobile App UI Refresh"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-sky-100 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <h1 className="text-2xl font-bold text-primary">BidWise</h1>
        <div className="space-x-3">
          <Button variant="outline" asChild><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/register">Get Started</Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-14 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Reverse Bidding Marketplace</p>
          <h2 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">Post projects. Receive lower bids. Pick the best vendor.</h2>
          <p className="text-lg text-muted-foreground">BidWise helps buyers get competitive offers while sellers win work by offering smarter pricing and delivery terms.</p>
          <div className="space-x-3">
            <Button asChild><Link href="/register">Create account</Link></Button>
            <Button variant="outline" asChild><Link href="/login">Explore demo</Link></Button>
          </div>
        </div>
        <Card className="border-primary/25">
          <CardHeader>
            <CardTitle>How reverse bidding works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Buyer posts a requirement with budget and deadline.</p>
            <p>2. Sellers compete by submitting lower bids and proposals.</p>
            <p>3. Buyer compares bids and awards the project.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h3 className="mb-4 text-2xl font-bold text-foreground">Featured Projects</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((title) => (
            <Card key={title}>
              <CardHeader><CardTitle className="text-base text-foreground">{title}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Live bidding in progress with multiple competing vendors.</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-10 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Top Categories</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Web Development, AI Solutions, Design, Marketing, Data.</CardContent></Card>
        <Card><CardHeader><CardTitle>Benefits</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Lower costs, transparent comparison, faster vendor selection.</CardContent></Card>
        <Card><CardHeader><CardTitle>Testimonials</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">&quot;We reduced vendor cost by 18% on our first project.&quot;</CardContent></Card>
      </section>

      <footer className="border-t border-white/30 bg-white/65 py-8 text-center text-sm text-muted-foreground dark:bg-slate-900/65">BidWise (c) 2026. Built for full reverse bidding workflow simulation.</footer>
    </div>
  );
}

