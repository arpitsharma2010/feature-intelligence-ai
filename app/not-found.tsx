import Link from "next/link";

import { buttonPrimary, surfaceCard } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-5 py-16 sm:px-8">
      <div className={`w-full p-8 text-center sm:p-12 ${surfaceCard}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Page not found
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          The page you are looking for does not exist, or the link may be incorrect.
        </p>
        <Link href="/" className={`mt-7 ${buttonPrimary}`}>
          Browse requests
        </Link>
      </div>
    </main>
  );
}
