import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/db";
import { gallery } from "@/db/schema/gallery";
import { getAdminSession } from "@/lib/session";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath, revalidateTag } from "next/cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 1. Check admin session
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary environment variables are not configured on the server. Please add them in Vercel." },
        { status: 500 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { imageUrl, imageData, altText, caption, category, sortOrder, isActive, cloudinaryPublicId } = body;

    const imagePayload = imageData || imageUrl;

    if (!imagePayload) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    if (!altText) {
      return NextResponse.json({ error: "Alt text is required" }, { status: 400 });
    }

    let finalUrl = imagePayload;
    let finalPublicId = cloudinaryPublicId || null;

    // 4. Upload to Cloudinary if it's a base64 string
    if (imagePayload.startsWith("data:image/")) {
      try {
        const uploadResult = await cloudinary.uploader.upload(imagePayload, {
          folder: "hospital-gallery",
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
        });
        finalUrl = uploadResult.secure_url;
        finalPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error("[Cloudinary Upload Error]", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image to Cloudinary", details: String(uploadError) },
          { status: 500 }
        );
      }
    } else if (!imagePayload.startsWith("http")) {
      return NextResponse.json({ error: "Invalid image format. Must be a URL or Base64 data URI." }, { status: 400 });
    }

    // 5. Hard stop: Never save base64 data directly to the database
    if (finalUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "System attempted to save base64 data to database. Aborting." }, { status: 500 });
    }

    // 6. Save ONLY the Cloudinary URL to database
    const [newImage] = await db
      .insert(gallery)
      .values({
        id: createId(),
        imageUrl: finalUrl,         // ✅ Cloudinary URL
        cloudinaryPublicId: finalPublicId,
        altText: altText,
        caption: caption || null,
        category: category || "General",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
      })
      .returning();

    // 7. Refresh the public page
    try {
      revalidateTag("gallery");
      revalidatePath("/gallery");
      revalidatePath("/");
    } catch (revalidateError) {
      console.warn("[Gallery POST] Revalidation failed:", revalidateError);
    }

    return NextResponse.json(newImage);

  } catch (error) {
    console.error("[Gallery POST Error]", error);
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
}
