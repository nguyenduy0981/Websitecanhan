import { z } from "zod";

// Same limits as EditProfileSheet's NAME_MAX/TAGLINE_MAX (src/vo-tri/profile/EditProfileSheet.tsx)
// — the server must enforce the same rule the form already communicates,
// not a different number nobody told the user about.
export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Tên hiển thị không được để trống.").max(24),
  tagline: z.string().trim().max(60).optional().default(""),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
