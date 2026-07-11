import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { requireAuth } from "@/modules/auth";
import { requireRole, setUserRoleSchema, changeUserRole } from "@/modules/admin";

type Ctx = { params: Promise<{ userId: string }> };

export const PATCH = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const actor = await requireAuth(req.cookies);
  requireRole(actor, "SUPER_ADMIN");

  const { userId } = await params;
  const { role } = parseOrThrow(setUserRoleSchema, await req.json());

  const user = await changeUserRole(userId, role, actor.id);
  log.info({ actorId: actor.id, userId, role }, "user role changed");

  return NextResponse.json({ user });
});
