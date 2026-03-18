import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

// Manually parse .env.local because dotenv might not be in the environment for drizzle-kit
const envPath = path.resolve(process.cwd(), ".env.local");
let databaseUrl = process.env.DATABASE_URL;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/^DATABASE_URL=["']?(.+?)["']?$/m);
  if (match) {
    databaseUrl = match[1].replace(/\\/g, ""); // Remove escaping if present
  }
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl!,
  },
  verbose: true,
  strict: true,
});
