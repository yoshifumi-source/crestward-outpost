import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Crestward — Life Navigation RPG",
  description: "Navigate your life like an open-world RPG.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Crestward"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f6f8f6"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-stone-50 text-stone-900 min-h-screen pb-20">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
