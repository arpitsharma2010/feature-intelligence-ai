import Link from "next/link";

import { normalizeFeatureRequestSort } from "@/lib/feature-request-sort";
import { listFeatureRequests } from "@/lib/feature-requests";
import { formatDate, formatStatus } from "@/lib/format";
import {
  buttonPrimary,
  buttonSecondary,
  linkAccent,
  surfaceCard,
} from "@/lib/ui";

export const dynamic = "force-dynamic";

const sortOptions = [
  { value: "recent", label: "Most recent" },
  { value: "supported", label: "Most supported" },
] as const;

type HomeProps = {
  searchParams: Promise<{ sort?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const sort = normalizeFeatureRequestSort((await searchParams).sort);
  const requests = await listFeatureRequests(sort);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <section className="flex flex-col gap-6 border-b border-slate-200 pb-9 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">
            Feature requests
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Help shape what we build next.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Explore ideas from the community, add your support, or share a product
            improvement of your own.
          </p>
        </div>
        <Link href="/requests/new" className={`shrink-0 ${buttonPrimary}`}>
          Submit a request
        </Link>
      </section>

      <section className="pt-9" aria-labelledby="request-list-heading">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-baseline gap-4">
            <h2 id="request-list-heading" className="text-xl font-bold text-slate-950">
              {sort === "supported" ? "Most supported requests" : "Recent requests"}
            </h2>
            <p className="text-sm text-slate-500">
              {requests.length} {requests.length === 1 ? "request" : "requests"}
            </p>
          </div>
          <nav aria-label="Sort requests" className="flex flex-wrap gap-2">
            {sortOptions.map((option) => {
              const isActive = option.value === sort;

              return (
                <Link
                  key={option.value}
                  href={`/?sort=${option.value}`}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? buttonPrimary : buttonSecondary}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              No requests yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Start the conversation by sharing the first product improvement.
            </p>
            <Link href="/requests/new" className={`mt-6 ${buttonPrimary}`}>
              Submit the first request
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <article
                key={request.id}
                className={`group p-5 transition hover:border-indigo-200 hover:shadow-md sm:p-6 ${surfaceCard}`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {formatStatus(request.status)}
                      </span>
                      <time
                        dateTime={request.createdAt.toISOString()}
                        className="text-sm text-slate-500"
                      >
                        {formatDate(request.createdAt)}
                      </time>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                      <Link
                        href={`/requests/${request.id}`}
                        className="outline-none group-hover:text-indigo-700 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      >
                        {request.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                      {request.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-6 border-t border-slate-100 pt-4 sm:min-w-36 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold tabular-nums text-slate-950">
                        {request.supportCount}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {request.supportCount === 1 ? "supporter" : "supporters"}
                      </p>
                    </div>
                    <Link href={`/requests/${request.id}`} className={linkAccent}>
                      View request <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
