"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { supportFeatureRequestAction } from "@/app/requests/actions";
import type { SupportFeatureRequestState } from "@/lib/feature-request-validation";
import { buttonPrimary } from "@/lib/ui";

const initialState: SupportFeatureRequestState = { message: null };

function SupportButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
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
