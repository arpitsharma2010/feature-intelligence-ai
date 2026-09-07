"use client";

import { useEffect } from "react";

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
      <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          We could not load this page
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Something went wrong while loading feature requests. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
