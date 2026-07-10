import { env, isResendConfigured } from "@/env";
import { logger } from "@/lib/logger";

/**
 * Thin Resend wrapper. Per CLAUDE.md "Honesty": when RESEND_API_KEY /
 * EMAIL_FROM aren't configured yet, this no-ops (logs a warning) instead of
 * throwing, so auth flows that depend on it (password reset) still work
 * end-to-end in an environment "awaiting credentials" — the reset token is
 * still created, it just isn't emailed until Resend is wired up.
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!isResendConfigured) {
    logger.warn({ to, subject }, "email not sent: Resend is not configured (awaiting credentials)");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ status: res.status, body }, "Resend API request failed");
    throw new Error("Failed to send email");
  }
}

export function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  return sendEmail(
    to,
    "Đặt lại mật khẩu LoveBox",
    `<p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản LoveBox này.</p>
     <p><a href="${resetUrl}">Bấm vào đây để đặt lại mật khẩu</a>. Liên kết có hiệu lực trong thời gian giới hạn và chỉ dùng được một lần.</p>
     <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
  );
}
