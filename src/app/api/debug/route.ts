import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const results = {
            env: {
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL: process.env.DATABASE_URL ? (process.env.DATABASE_URL.startsWith('file') ? 'file:...' : 'secret') : 'NOT SET',
            },
            cwd: process.cwd(),
            prismaDir: fs.existsSync(path.join(process.cwd(), 'prisma')) ? 'exists' : 'NOT FOUND',
            schemaFile: fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.prisma')) ? 'exists' : 'NOT FOUND',
            databaseStatus: "unknown",
            error: null as any
        };

        try {
            // Test a simple query
            await prisma.$queryRaw`SELECT 1`;
            results.databaseStatus = "CONNECTED";
        } catch (dbError: any) {
            results.databaseStatus = "FAILED";
            results.error = dbError.message;
        }

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
