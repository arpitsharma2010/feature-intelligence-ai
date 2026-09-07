"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createFeatureRequestAction } from "@/app/requests/actions";
import type { CreateFeatureRequestState } from "@/lib/feature-request-validation";

const initialState: CreateFeatureRequestState = {
  values: { title: "", description: "" },
  fieldErrors: {},
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400"
    >
      {pending ? "Submitting…" : "Submit request"}
    </button>
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
          className="mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-rose-100"
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
          className="mt-2 block w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-rose-100"
          placeholder="Describe the problem you are trying to solve and how this would help."
        />
        {state.fieldErrors.description ? (
          <p id="description-error" className="mt-2 text-sm text-rose-700">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
