"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as notificationService from "@/vo-tri/server/services/notification-service";
import type { ServiceResult } from "@/vo-tri/server/errors";
import type { NotificationItem } from "@/vo-tri/social/types";

export async function getMyNotificationsAction(limit?: number): Promise<ServiceResult<NotificationItem[]>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return notificationService.getNotifications(auth.client, auth.userId, limit);
}

export async function markNotificationReadAction(notificationId: string): Promise<ServiceResult<null>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await notificationService.markRead(auth.client, notificationId);
  if (result.ok) revalidatePath("/");
  return result;
}
