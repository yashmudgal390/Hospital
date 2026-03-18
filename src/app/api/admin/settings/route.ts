import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured" }, { status: 400 });
    }

    const [s] = await db.select().from(settings).where(eq(settings.id, "main")).limit(1);
    return NextResponse.json(s || {});
  } catch (error) {
    return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured. Setup DATABASE_URL to save." }, { status: 400 });
    }

    // Fetch existing settings or default to an empty object
    const [existing] = await db.select().from(settings).where(eq(settings.id, "main")).limit(1);
    const existingData = existing || {};

    // Build the update payload by merging existing with incoming, but skip nulls/undefineds
    // which usually come from unvisited tabs in the form.
    const mergedData: any = { ...existingData };
    
    // Explicitly copy fields from body that are not null or undefined
    Object.keys(body).forEach(key => {
      // Skip immutable fields
      if (key === 'id' || key === 'createdAt') return;
      
      // We only update if the body has a value. 
      // This prevents unvisited tabs from nullifying existing values.
      if (body[key] !== undefined && body[key] !== null) {
        mergedData[key] = body[key];
      }
    });

    mergedData.id = "main";
    mergedData.updatedAt = new Date();

    const [updated] = await db
      .insert(settings)
      .values(mergedData)
      .onConflictDoUpdate({
        target: settings.id,
        set: mergedData,
      })
      .returning();

    // Trigger revalidations for all public pages
    revalidateTag("settings");
    revalidatePath("/", "layout");
    
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[Settings API Error]", error);
    return NextResponse.json({ error: "Error updating settings" }, { status: 500 });
  }
}
