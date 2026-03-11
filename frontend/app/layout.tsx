import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BidWise",
  description: "Reverse bidding marketplace prototype"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


