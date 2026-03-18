import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { appointments } from "@/db/schema";
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

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured" }, { status: 400 });
    }

    const { id } = params;

    await db.delete(appointments).where(eq(appointments.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Appointment Delete Error]", error);
    return NextResponse.json({ error: "Error deleting appointment" }, { status: 500 });
  }
}
