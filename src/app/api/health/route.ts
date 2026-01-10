import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		// Check database connectivity
		const result = await db.execute(sql`SELECT 1 as health`);

		if (!result) {
			throw new Error("Database query failed");
		}

		return NextResponse.json(
			{
				status: "healthy",
				timestamp: new Date().toISOString(),
				database: "connected",
				service: "Paste-Bin API",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Health check failed:", error);

		return NextResponse.json(
			{
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				database: "disconnected",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 503 },
		);
	}
}
