import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { uploadImageBuffer } from "@/lib/cloudinary";

// Must use Node runtime because the `cloudinary` SDK requires Node APIs
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Upload API] Received upload request...");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "clinic";

    if (!file) {
      console.warn("[Upload API] No file found in form data.");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`[Upload API] File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    // 3. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Check if Cloudinary is configured (falsy values, empty strings, or placeholders)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.replace(/["']/g, "").trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/["']/g, "").trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/["']/g, "").trim();

    const isCloudinaryConfigured = cloudName && apiKey && apiSecret;
    console.log(`[Upload API] Cloudinary configured: ${isCloudinaryConfigured}`);

    if (!isCloudinaryConfigured) {
      // DEMO MODE: Return a data URI so the user can test the app without Cloudinary
      const contentType = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      const dataUri = `data:${contentType};base64,${base64}`;
      
      console.log(`[Upload API] Demo Mode active. Returning DataURI (length: ${dataUri.length}).`);
      return NextResponse.json({
        success: true,
        url: dataUri,
        publicId: `demo-${Date.now()}`,
      });
    }

    // 4. Upload to Cloudinary
    const result = await uploadImageBuffer(buffer, folder);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary" },
        { status: 500 }
      );
    }

    // 5. Return the secure URL and public ID
    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("[Upload API Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
