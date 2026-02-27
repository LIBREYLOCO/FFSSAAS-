import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const getSecret = () =>
    new TextEncoder().encode(
        process.env.AUTH_SECRET || "aura-dev-secret-change-in-production"
    );

// ─── Password hashing (solo en Node.js runtime, nunca en Edge) ───────────────

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

export interface SessionPayload {
    id: string;
    name: string;
    email: string;
    role: string;
    sucursalId?: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getSecret());
}

export async function verifyToken(
    token: string
): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

// ─── Session helper (Server Components / API routes) ─────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura_session")?.value;
    if (!token) return null;
    return verifyToken(token);
}

export function requireRole(session: SessionPayload | null, role: string): boolean {
    if (!session) return false;
    if (session.role === "ADMIN") return true; // ADMIN tiene acceso total
    return session.role === role;
}
