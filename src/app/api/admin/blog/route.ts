import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { blog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const [newPost] = await db
      .insert(blog)
      .values(body)
      .returning();
    
    revalidateTag("blog");

    return NextResponse.json(newPost);
  } catch (error: any) {
    console.error("[Blog POST Error]:", error.message || error);
    return NextResponse.json({ error: error.message || "Error creating blog post" }, { status: 500 });
  }
}
