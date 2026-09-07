"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createFeatureRequestAction } from "@/app/requests/actions";
import type { CreateFeatureRequestState } from "@/lib/feature-request-validation";
import { buttonPrimary, buttonSecondary, linkAccent } from "@/lib/ui";

type Suggestion = NonNullable<CreateFeatureRequestState["suggestion"]>;

const initialState: CreateFeatureRequestState = {
  values: { title: "", description: "" },
  fieldErrors: {},
  message: null,
};

const fieldClassName =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3.5 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-rose-100";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={buttonPrimary}>
      {pending ? "Submitting…" : "Submit request"}
    </button>
  );
}

// DOM order is load-bearing: `create-separately` must stay the FIRST submit
// button in the form. Implicit submission (Enter inside a text field) activates
// the first submit button in tree order, so leading with `support-existing`
// would silently turn Enter into a vote on someone else's request.
function DecisionButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="mt-6 border-t border-indigo-200 pt-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <button
            type="submit"
            name="intent"
            value="create-separately"
            disabled={pending}
            aria-describedby="decision-create-hint"
            className={`${buttonSecondary} w-full`}
          >
            {pending ? "Working…" : "Create separately"}
          </button>
          <p id="decision-create-hint" className="mt-2 text-sm leading-6 text-slate-600">
            Files your draft as its own request. Choose this if the match is wrong.
          </p>
        </div>

        <div>
          <button
            type="submit"
            name="intent"
            value="support-existing"
            disabled={pending}
            aria-describedby="decision-support-hint"
            className={`${buttonPrimary} w-full`}
          >
            {pending ? "Working…" : "Support existing"}
          </button>
          <p id="decision-support-hint" className="mt-2 text-sm leading-6 text-slate-600">
            Adds your support to the matched request and discards your draft.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {pending ? "Applying your decision…" : "Nothing is saved until you choose."}
      </p>
    </div>
  );
}

function RecommendationPanel({ suggestion }: { suggestion: Suggestion }) {
  return (
    <section
      aria-labelledby="recommendation-heading"
      className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          AI recommendation
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
          You decide
        </span>
      </div>

      <h2
        id="recommendation-heading"
        className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
      >
        This looks like an existing request
      </h2>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            {suggestion.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {suggestion.description}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            {suggestion.supportCount}{" "}
            {suggestion.supportCount === 1 ? "supporter" : "supporters"}
          </p>
          {/* Opens in a new tab on purpose: navigating this tab would unmount the
              form and discard the pending suggestion held in action state. */}
          <a
            href={`/requests/${suggestion.matchedRequestId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 inline-flex underline underline-offset-2 ${linkAccent}`}
          >
            Open the matched request in a new tab
            <span aria-hidden="true">&nbsp;↗</span>
          </a>
        </div>

        <div className="shrink-0 rounded-lg border border-indigo-200 bg-white px-5 py-4 text-center sm:min-w-36">
          <p className="text-4xl font-bold tabular-nums text-indigo-700">
            {Math.round(suggestion.confidence * 100)}%
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            match
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-indigo-200 bg-white p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Why the model flagged this
        </h4>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {suggestion.rationale}
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Written by the triage model from your draft and the closest existing
          requests. It can be wrong — review the match before choosing.
        </p>
      </div>

      <DecisionButtons />
    </section>
  );
}

export function RequestForm() {
  const [state, formAction] = useActionState(
    createFeatureRequestAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {state.message}
        </div>
      ) : null}

      {state.suggestion ? (
        <RecommendationPanel suggestion={state.suggestion} />
      ) : null}

      {/* Rendered unconditionally with only the className swapped. Branching to a
          different element, or adding a key, would remount the inputs and drop
          anything typed after the recommendation appeared, because defaultValue
          only applies on mount. De-emphasis is a quiet card rather than opacity,
          which would also dim the field errors on the re-validation path. */}
      <section
        aria-labelledby="draft-heading"
        className={
          state.suggestion
            ? "space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
            : "space-y-6"
        }
      >
        <h2
          id="draft-heading"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Your draft
        </h2>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-900">
            Title
          </label>
          <p className="mt-1 text-sm text-slate-500">
            Summarize the improvement in a few words.
          </p>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={state.values.title}
            maxLength={120}
            aria-invalid={Boolean(state.fieldErrors.title)}
            aria-describedby={state.fieldErrors.title ? "title-error" : undefined}
            className={`min-h-11 py-2 ${fieldClassName}`}
            placeholder="e.g. Export quarterly reports as CSV"
          />
          {state.fieldErrors.title ? (
            <p id="title-error" className="mt-2 text-sm text-rose-700">
              {state.fieldErrors.title[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-slate-900"
          >
            Description
          </label>
          <p className="mt-1 text-sm text-slate-500">
            Explain the need, who it affects, and what a useful outcome would be.
          </p>
          <textarea
            id="description"
            name="description"
            defaultValue={state.values.description}
            maxLength={5000}
            rows={8}
            aria-invalid={Boolean(state.fieldErrors.description)}
            aria-describedby={
              state.fieldErrors.description ? "description-error" : undefined
            }
            className={`resize-y py-3 ${fieldClassName}`}
            placeholder="Describe the problem you are trying to solve and how this would help."
          />
          {state.fieldErrors.description ? (
            <p id="description-error" className="mt-2 text-sm text-rose-700">
              {state.fieldErrors.description[0]}
            </p>
          ) : null}
        </div>
      </section>

      {state.suggestion ? null : (
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      )}
    </form>
  );
}
