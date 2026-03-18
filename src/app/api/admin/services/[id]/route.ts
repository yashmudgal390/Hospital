import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    body.updatedAt = new Date();

    const [updated] = await db
      .update(services)
      .set(body)
      .where(eq(services.id, params.id))
      .returning();
    
    revalidateTag("services");

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating service" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await db.delete(services).where(eq(services.id, params.id));
    revalidateTag("services");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting service" }, { status: 500 });
  }
}
