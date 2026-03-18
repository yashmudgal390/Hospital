import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [deleted] = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, params.id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact DELETE Error]", error);
    return NextResponse.json({ error: "Error deleting message" }, { status: 500 });
  }
}
