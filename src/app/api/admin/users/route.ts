import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { requireAuth } from "@/modules/auth";
import { requireRole, listUsers } from "@/modules/admin";

export const GET = withApiHandler(async (req: NextRequest) => {
  const user = await requireAuth(req.cookies);
  requireRole(user, "SUPER_ADMIN");

  const users = await listUsers();
  return NextResponse.json({ users });
});
