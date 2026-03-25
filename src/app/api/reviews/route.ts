import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/db";
import { reviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    if (!isDbConfigured) {
      return NextResponse.json([]);
    }

    // Only fetch approved reviews for the public site
    const data = await db
      .select()
      .from(reviews)
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.createdAt));
      
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Public Reviews GET] error", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log("POST /api/reviews called");
  try {
    if (!isDbConfigured) {
      console.log("DB not configured");
      return NextResponse.json({ error: "Database not configured" }, { status: 400 });
    }

    const body = await req.json();
    console.log("Body parsed:", body);
    const { patientName, rating, comment } = body;

    if (!patientName || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Generate a simple ID
    console.log("Generating ID");
    const newId = crypto.randomUUID();
    console.log("ID generated:", newId);

    const [newReview] = await db
      .insert(reviews)
      .values({
        id: newId,
        patientName,
        rating,
        comment,
        isApproved: false, // Default to pending moderation
      })
      .returning();

    console.log("Insert successful", newReview);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("[Public Reviews POST] error", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
