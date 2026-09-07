"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { supportFeatureRequestAction } from "@/app/requests/actions";
import type { SupportFeatureRequestState } from "@/lib/feature-request-validation";

const initialState: SupportFeatureRequestState = { message: null };

function SupportButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400"
    >
      {pending ? "Adding support…" : "Support this request"}
    </button>
  );
}

export function SupportForm({ requestId }: { requestId: string }) {
  const supportAction = supportFeatureRequestAction.bind(null, requestId);
  const [state, formAction] = useActionState(supportAction, initialState);

  return (
    <form action={formAction}>
      <SupportButton />
      {state.message ? (
        <p role="alert" className="mt-3 text-sm text-rose-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
