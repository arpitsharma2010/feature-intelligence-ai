import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Feature Intelligence",
  description: "Discover, submit, and support product feature requests.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-slate-950 transition hover:text-indigo-700"
            >
              Feature Intelligence
            </Link>
            <nav aria-label="Primary navigation" className="flex items-center gap-5">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                Requests
              </Link>
              <Link
                href="/requests/new"
                className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
              >
                Submit request
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
