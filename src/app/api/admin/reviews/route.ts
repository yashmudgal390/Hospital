import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { reviews } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json([]);
    }

    const data = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Reviews GET] error", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
