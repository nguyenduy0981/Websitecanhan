import type { Metadata } from "next";
import "./globals.css";
import { env } from "@/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: "LoveBox",
  description: "Hộp quà kỹ thuật số cảm xúc — gửi yêu thương theo cách của bạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
