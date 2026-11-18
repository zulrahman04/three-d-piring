import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CERAMIX 3D STUDIO — Bespoke Porcelain Customizer",
  description: "Atelier Kustomisasi Piring Porselen 3D bergaya Scandinavian Japandi",
};

import AdminShortcutListener from "@/components/common/AdminShortcutListener";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F3F0] text-[#1C1917] antialiased selection:bg-stone-800/10 selection:text-stone-900">
        <AdminShortcutListener />
        {children}
      </body>
    </html>
  );
}
