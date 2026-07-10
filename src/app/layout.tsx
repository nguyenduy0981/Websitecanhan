import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
