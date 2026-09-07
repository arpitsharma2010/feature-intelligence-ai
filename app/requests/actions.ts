"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  enrichFeatureRequestEmbedding,
  triageFeatureRequest,
} from "@/lib/ai/triage-service";
import {
  createSubmissionCoordinator,
  type SubmissionIntent,
} from "@/lib/feature-request-submission";
import {
  createFeatureRequest,
  incrementFeatureRequestSupport,
} from "@/lib/feature-requests";
import {
  type CreateFeatureRequestState,
  featureRequestSchema,
  type SupportFeatureRequestState,
} from "@/lib/feature-request-validation";

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

const submitFeatureRequest = createSubmissionCoordinator({
  triage: triageFeatureRequest,
  enrichEmbedding: enrichFeatureRequestEmbedding,
  create: createFeatureRequest,
  support: incrementFeatureRequestSupport,
});

export async function createFeatureRequestAction(
  previousState: CreateFeatureRequestState,
  formData: FormData,
): Promise<CreateFeatureRequestState> {
  const values = {
    title: getStringValue(formData.get("title")),
    description: getStringValue(formData.get("description")),
  };
  const intentValue = getStringValue(formData.get("intent"));
  const intent: SubmissionIntent =
    intentValue === "support-existing" || intentValue === "create-separately"
      ? intentValue
      : "initial";

  if (intent === "support-existing") {
    if (!previousState.suggestion) {
      return {
        values,
        fieldErrors: {},
        message: "The duplicate suggestion expired. Please submit again.",
      };
    }

    try {
      await submitFeatureRequest({
        draft: values,
        intent,
        suggestion: previousState.suggestion,
      });
    } catch (error) {
      console.error("Unable to support feature request", error);
      return {
        values,
        fieldErrors: {},
        message: "We could not add your support. Please try again.",
        suggestion: previousState.suggestion,
      };
    }

    revalidatePath("/");
    revalidatePath(`/requests/${previousState.suggestion.matchedRequestId}`);
    redirect(`/requests/${previousState.suggestion.matchedRequestId}`);
  }

  const result = featureRequestSchema.safeParse(values);

  if (!result.success) {
    return {
      values,
      fieldErrors: result.error.flatten().fieldErrors,
      message: "Please correct the highlighted fields and try again.",
      suggestion:
        intent === "create-separately" ? previousState.suggestion : undefined,
    };
  }

  let submission: Awaited<ReturnType<typeof submitFeatureRequest>>;

  try {
    submission = await submitFeatureRequest({
      draft: result.data,
      intent,
      suggestion: previousState.suggestion,
    });
  } catch (error) {
    console.error("Unable to create feature request", error);
    return {
      values,
      fieldErrors: {},
      message: "We could not save your request. Please try again.",
      suggestion:
        intent === "create-separately" ? previousState.suggestion : undefined,
    };
  }

  if (submission.status === "suggestion") {
    return {
      values: result.data,
      fieldErrors: {},
      message: null,
      suggestion: submission.suggestion,
    };
  }

  revalidatePath("/");
  redirect(`/requests/${submission.id}`);
}

export async function supportFeatureRequestAction(
  id: string,
  _previousState: SupportFeatureRequestState,
  _formData: FormData,
): Promise<SupportFeatureRequestState> {
  void _previousState;
  void _formData;

  try {
    await incrementFeatureRequestSupport(id);
  } catch (error) {
    console.error("Unable to support feature request", error);
    return {
      message: "We could not add your support. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/requests/${id}`);

  return { message: null };
}
