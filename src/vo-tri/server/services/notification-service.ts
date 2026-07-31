import type { SupabaseClient } from "@supabase/supabase-js";
import { toNotificationItem } from "@/vo-tri/server/adapters/social";
import { mapSupabaseError, ok, type ServiceResult } from "@/vo-tri/server/errors";
import { listNotifications, markNotificationRead } from "@/vo-tri/server/repositories/notification-repository";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { NotificationItem } from "@/vo-tri/social/types";

type Client = SupabaseClient<Database>;

export async function getNotifications(client: Client, userId: string, limit = 30): Promise<ServiceResult<NotificationItem[]>> {
  const { data, error } = await listNotifications(client, userId, limit);
  if (error) return mapSupabaseError(error);
  return ok((data ?? []).map(toNotificationItem));
}

export async function markRead(client: Client, notificationId: string): Promise<ServiceResult<null>> {
  const { error } = await markNotificationRead(client, notificationId);
  if (error) return mapSupabaseError(error);
  return ok(null);
}
