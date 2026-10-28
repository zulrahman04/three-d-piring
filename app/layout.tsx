import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demo 3D - Design Plate Dzul",
  description: "Design Plate 3D",
};

import AdminShortcutListener from "@/components/common/AdminShortcutListener";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-zinc-900 antialiased selection:bg-indigo-500/20 selection:text-indigo-700">
        <AdminShortcutListener />
        {children}
      </body>
    </html>
  );
}
