import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SupportForm } from "@/components/support-form";
import { getFeatureRequest } from "@/lib/feature-requests";
import { formatDate, formatStatus } from "@/lib/format";

export const dynamic = "force-dynamic";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: RequestDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const request = await getFeatureRequest(id);

  if (!request) {
    return { title: "Request not found | Feature Intelligence" };
  }

  return {
    title: `${request.title} | Feature Intelligence`,
    description: request.description.slice(0, 160),
  };
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const request = await getFeatureRequest(id);

  if (!request) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/"
        className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
      >
        <span aria-hidden="true">←</span> Back to requests
      </Link>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              {formatStatus(request.status)}
            </span>
            <time
              dateTime={request.createdAt.toISOString()}
              className="text-sm text-slate-500"
            >
              Submitted {formatDate(request.createdAt)}
            </time>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {request.title}
          </h1>
          <div className="mt-7 border-t border-slate-100 pt-7">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-700">
              {request.description}
            </p>
          </div>
        </article>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Community support</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-slate-950">
            {request.supportCount}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {request.supportCount === 1
              ? "person supports this request"
              : "people support this request"}
          </p>
          <div className="mt-6 border-t border-slate-100 pt-6">
            <SupportForm requestId={request.id} />
          </div>
        </aside>
      </div>
    </main>
  );
}
