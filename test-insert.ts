const { db } = require("./src/db/index");
const { contactMessages } = require("./src/db/schema");
const { createId } = require("@paralleldrive/cuid2");

async function test() {
  try {
    const res = await db.insert(contactMessages).values({
      id: "test-" + createId(),
      senderName: "Test User",
      senderEmail: "test@example.com",
      senderPhone: "1234567890",
      subject: "Test Subject",
      message: "Test Message",
      ipAddress: "127.0.0.1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    console.log("SUCCESS:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("DETAILED ERROR:", e);
    console.error("ERROR MESSAGE:", e.message);
    if (e.detail) console.error("ERROR DETAIL:", e.detail);
  }
  process.exit(0);
}

test();
