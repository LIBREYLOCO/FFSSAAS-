import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";
import ThemeProvider from "@/components/ThemeProvider";
// BackgroundLayer removed — ThemeProvider now handles background injection live
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

async function getSystemSettings(): Promise<{ primaryColor: string; backgroundId: string }> {
  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { in: ["primaryColor", "backgroundId"] } },
    });
    const map = Object.fromEntries(configs.map(c => [c.key, c.value]));
    return {
      primaryColor: map.primaryColor ?? "#C5A059",
      backgroundId: map.backgroundId ?? "none",
    };
  } catch {
    return { primaryColor: "#C5A059", backgroundId: "none" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ primaryColor, backgroundId }, session] = await Promise.all([
    getSystemSettings(),
    getSession(),
  ]);

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} antialiased flex h-screen overflow-hidden bg-bg-deep`}
      >
        {/* Fixed ambient gradient decorators */}
        <div className="fixed top-0 right-0 w-[540px] h-[540px] aura-gradient blur-[150px] opacity-[0.11] pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-0 w-[380px] h-[380px] bg-accent-500 blur-[130px] opacity-[0.07] pointer-events-none -z-10" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-gold-700 blur-[180px] opacity-[0.04] pointer-events-none -z-10" />

        <SidebarWrapper user={session} />
        <ThemeProvider primaryColor={primaryColor} backgroundId={backgroundId} />

        <main className="flex-1 h-screen overflow-y-auto custom-scrollbar">
          <div className="p-8 min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
