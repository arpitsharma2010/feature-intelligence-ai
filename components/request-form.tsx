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

function DecisionButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        type="submit"
        name="intent"
        value="create-separately"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        {pending ? "Working…" : "Create separately"}
      </button>
      <button
        type="submit"
        name="intent"
        value="support-existing"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {pending ? "Working…" : "Support existing"}
      </button>
    </div>
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
        <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-sm font-semibold text-indigo-950">
            This may already exist
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-950">
            {state.suggestion.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {state.suggestion.description}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            {state.suggestion.supportCount} supporters ·{" "}
            {Math.round(state.suggestion.confidence * 100)}% match
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {state.suggestion.rationale}
          </p>
        </section>
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

      {state.suggestion ? <DecisionButtons /> : <div className="flex justify-end"><SubmitButton /></div>}
    </form>
  );
}
