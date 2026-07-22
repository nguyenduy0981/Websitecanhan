import type { Metadata } from "next";
import "./globals.css";
import { voTriFontVariables } from "@/vo-tri/fonts";
import { SITE_URL } from "@/vo-tri/lib/site";
import { AppShell } from "@/vo-tri/shell";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "VÔ TRI",
  description: "Nơi sự vô tri trở thành nghệ thuật.",
  openGraph: {
    title: "VÔ TRI",
    description: "Nơi sự vô tri trở thành nghệ thuật.",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VÔ TRI",
    description: "Nơi sự vô tri trở thành nghệ thuật.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={voTriFontVariables}>
      <body className="font-vt-body">
        {/* No auth yet — every visitor renders as guest until a real session exists. */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
