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
  title: "Aura Forever Friends | Control de Crematorio",
  description: "Software de gestión premium para servicios de cremación de mascotas.",
};

import SidebarWrapper from "@/components/SidebarWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen overflow-hidden bg-bg-deep`}
      >
        <SidebarWrapper />
        <main className="flex-1 h-screen overflow-y-auto p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 aura-gradient blur-[120px] opacity-20 -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 blur-[100px] opacity-10 -z-10 pointer-events-none" />
          {children}
        </main>
      </body>
    </html>
  );
}
