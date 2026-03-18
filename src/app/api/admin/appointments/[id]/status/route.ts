import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    const [updated] = await db
      .update(appointments)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(appointments.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating appointment status" }, { status: 500 });
  }
}
