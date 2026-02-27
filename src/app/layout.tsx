import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";
import ThemeProvider from "@/components/ThemeProvider";
import StarField from "@/components/StarField";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura Forever Friends | Control de Crematorio",
  description: "Software de gestión premium para servicios de cremación de mascotas.",
};

async function getPrimaryColor(): Promise<string> {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: "primaryColor" } });
    return config?.value || "#C5A059";
  } catch {
    return "#C5A059";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [primaryColor, session] = await Promise.all([getPrimaryColor(), getSession()]);
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} antialiased flex h-screen overflow-hidden bg-bg-deep`}
      >
        {/* Fixed ambient decorators — outside scroll container so they stay put */}
        <div className="fixed top-0 right-0 w-[540px] h-[540px] aura-gradient blur-[150px] opacity-[0.11] pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-0 w-[380px] h-[380px] bg-accent-500 blur-[130px] opacity-[0.07] pointer-events-none -z-10" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-gold-700 blur-[180px] opacity-[0.04] pointer-events-none -z-10" />

        <StarField />
        <SidebarWrapper user={session} />
        <ThemeProvider primaryColor={primaryColor} />

        <main className="flex-1 h-screen overflow-y-auto custom-scrollbar">
          <div className="p-8 min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
