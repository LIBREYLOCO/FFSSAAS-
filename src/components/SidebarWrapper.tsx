"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { SessionPayload } from "@/lib/auth";

export default function SidebarWrapper({ user }: { user: SessionPayload | null }) {
    const pathname = usePathname();
    if (pathname === "/login") return null;
    return <Sidebar user={user} />;
}
