import { z } from "zod";

// 8 chars is an app-level policy choice (Supabase Auth's own default
// minimum is 6) — deliberately stricter since this becomes the one real
// password gate for the whole reward economy once Auth ships.
const passwordSchema = z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.");

export const signUpSchema = z.object({
  email: z.string().trim().email("Email không đúng định dạng."),
  password: passwordSchema,
  username: z
    .string()
    .trim()
    .min(3, "Username cần ít nhất 3 ký tự.")
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Username chỉ gồm chữ thường, số và dấu gạch dưới."),
  displayName: z.string().trim().min(1, "Tên hiển thị không được để trống.").max(24),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Email không đúng định dạng."),
  password: z.string().min(1, "Nhập mật khẩu đi đã."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
