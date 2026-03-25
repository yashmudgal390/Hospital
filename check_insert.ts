process.env.DATABASE_URL="postgresql://postgres.cmewkwqoxwriafbijnph:AGmKqqO4NQHkBCDd@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
import { db } from "./src/db";
import { reviews } from "./src/db/schema";
import crypto from "crypto";

async function run() {
  try {
    const newId = crypto.randomUUID();
    const [newReview] = await db
      .insert(reviews)
      .values({
        id: newId,
        patientName: "Test Patient",
        rating: 5,
        comment: "Excellent",
        isApproved: false,
      })
      .returning();
    console.log("Success:", newReview);
  } catch(e) {
    console.error("Insert Error:", e);
  }
  process.exit(0);
}
run();
