import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { blog } from "@/db/schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

// Helper: convert empty strings to null
function emptyToNull(val: any): string | null {
  if (val === undefined || val === null || val === "") return null;
  return String(val);
}

// Helper: safely parse tags into a string array
function parseTags(val: any): string[] {
  if (!val || val === "") return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // Treat comma-separated string as tags
      return val.split(",").map((t: string) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

// Helper: safely parse a date value
function parseDate(val: any): Date | null {
  if (!val || val === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ 
        error: "Database not configured. Cannot create blog post. Setup DATABASE_URL in .env.local first." 
      }, { status: 400 });
    }

    const body = await req.json();

    // ========== SANITIZE EVERY FIELD ==========
    const now = new Date();

    const insertData = {
      id: body.id || createId(),
      title: body.title || "Untitled Post",
      slug: body.slug || createId(),
      excerpt: body.excerpt || "",
      content: body.content || "",
      coverImageUrl: emptyToNull(body.coverImageUrl),
      category: emptyToNull(body.category) || "General",
      tags: JSON.stringify(parseTags(body.tags)),
      readingTimeMinutes: typeof body.readingTimeMinutes === "number" 
        ? body.readingTimeMinutes 
        : parseInt(body.readingTimeMinutes, 10) || 0,
      isPublished: body.isPublished === true || body.isPublished === "true",
      publishedAt: parseDate(body.publishedAt),
      metaTitle: emptyToNull(body.metaTitle),
      metaDescription: emptyToNull(body.metaDescription),
      createdAt: now,
      updatedAt: now,
    };

    const [newPost] = await db
      .insert(blog)
      .values(insertData)
      .returning();
    
    // Defensive revalidation
    try {
      revalidateTag("blog");
      revalidatePath("/blog");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Blog POST] Revalidation failed:", revalError);
    }

    return NextResponse.json(newPost);
  } catch (error: any) {
    console.error("[Blog POST Error Details]:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    
    return NextResponse.json({ 
      error: "Error creating blog post",
      details: error.message || "Unknown database error"
    }, { status: 500 });
  }
}
