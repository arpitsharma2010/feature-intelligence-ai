import type { Metadata } from "next";
import Link from "next/link";

import { RequestForm } from "@/components/request-form";
import { linkAccent, surfaceCard } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Submit a request | Feature Intelligence",
  description: "Share a product improvement with the Feature Intelligence community.",
};

export default function NewRequestPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <Link href="/" className={linkAccent}>
        <span aria-hidden="true">←</span> Back to requests
      </Link>

      <div className="mt-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">
          New request
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          What should we improve?
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Share the problem you are trying to solve. Clear context helps others
          understand and support your idea.
        </p>
      </div>

      <div className={`mt-9 p-6 sm:p-8 ${surfaceCard}`}>
        <RequestForm />
      </div>
    </main>
  );
}
