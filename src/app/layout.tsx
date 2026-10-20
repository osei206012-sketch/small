import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizTools — Automated business tools for small businesses",
  description:
    "Construction cost calculator, invoice & quotation generator, profit calculator, business flyer generator, CV generator and stock management — one subscription, six tools.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
