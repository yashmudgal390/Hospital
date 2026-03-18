import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { services } from "@/db/schema";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const [newService] = await db
      .insert(services)
      .values(body)
      .returning();
    
    revalidateTag("services");

    return NextResponse.json(newService);
  } catch (error) {
    return NextResponse.json({ error: "Error creating service" }, { status: 500 });
  }
}
