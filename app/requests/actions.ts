"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function createFeatureRequestAction(
  _previousState: CreateFeatureRequestState,
  formData: FormData,
): Promise<CreateFeatureRequestState> {
  const values = {
    title: getStringValue(formData.get("title")),
    description: getStringValue(formData.get("description")),
  };
  const result = featureRequestSchema.safeParse(values);

  if (!result.success) {
    return {
      values,
      fieldErrors: result.error.flatten().fieldErrors,
      message: "Please correct the highlighted fields and try again.",
    };
  }

  let request: Awaited<ReturnType<typeof createFeatureRequest>>;

  try {
    request = await createFeatureRequest(result.data);
  } catch (error) {
    console.error("Unable to create feature request", error);
    return {
      values,
      fieldErrors: {},
      message: "We could not save your request. Please try again.",
    };
  }

  revalidatePath("/");
  redirect(`/requests/${request.id}`);
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
