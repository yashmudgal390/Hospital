import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // allow toggling both status and isStarred
    const updateData: any = { updatedAt: new Date() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isStarred !== undefined) updateData.isStarred = body.isStarred;

    const [updated] = await db
      .update(contactMessages)
      .set(updateData)
      .where(eq(contactMessages.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating message status" }, { status: 500 });
  }
}
