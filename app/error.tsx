"use client";

import { useEffect } from "react";

import { buttonPrimary, surfaceCard } from "@/lib/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-5 py-16 sm:px-8">
      <div className={`w-full p-8 text-center sm:p-12 ${surfaceCard}`}>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          We could not load this page
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Something went wrong while loading feature requests. Please try again.
        </p>
        <button type="button" onClick={reset} className={`mt-7 ${buttonPrimary}`}>
          Try again
        </button>
      </div>
    </main>
  );
}
