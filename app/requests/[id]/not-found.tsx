import Link from "next/link";

export default function RequestNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-5 py-16 sm:px-8">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Request not found
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          This feature request may have been removed, or the link may be incorrect.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Browse requests
        </Link>
      </div>
    </main>
  );
}
