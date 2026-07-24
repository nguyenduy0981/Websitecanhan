"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as gameplayService from "@/vo-tri/server/services/gameplay-service";
import type { RecordSessionInput, RecordSessionResult } from "@/vo-tri/server/services/gameplay-service";
import type { ServiceResult } from "@/vo-tri/server/errors";

export async function recordActivitySessionAction(input: RecordSessionInput): Promise<ServiceResult<RecordSessionResult>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await gameplayService.recordSession(auth.client, input);
  if (result.ok) revalidatePath("/profile");
  return result;
}
