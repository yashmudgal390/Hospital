import { NextResponse } from "next/server";
import { db } from "@/db";
import { gallery } from "@/db/schema/gallery";
import { getAdminSession } from "@/lib/session";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // 1. Check admin session
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
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

    // 3. Upload to Supabase Storage if it's a base64 string
    if (imagePayload.startsWith("data:image/")) {
      try {
        const base64Data = imagePayload.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        const mimeMatch = imagePayload.match(/^data:(image\/\w+);base64,/);
        const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const fileExt = contentType.split("/")[1] || "jpg";
        const fileName = `gallery/${Date.now()}-${createId()}.${fileExt}`;

        const { data, error: uploadError } = await supabaseAdmin
          .storage
          .from("hospital-images")
          .upload(fileName, buffer, {
            contentType,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from("hospital-images")
          .getPublicUrl(fileName);

        finalUrl = publicUrl;
        finalPublicId = fileName;
      } catch (uploadError) {
        console.error("[Supabase Upload Error]", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image to Supabase Storage", details: String(uploadError) },
          { status: 500 }
        );
      }
    } else if (!imagePayload.startsWith("http")) {
      return NextResponse.json({ error: "Invalid image format. Must be a URL or Base64 data URI." }, { status: 400 });
    }

    // 4. Hard stop: Never save base64 data directly to the database
    if (finalUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "System attempted to save base64 data to database. Aborting." }, { status: 500 });
    }

    // 5. Save ONLY the URL to database
    const [newImage] = await db
      .insert(gallery)
      .values({
        id: createId(),
        imageUrl: finalUrl,         
        cloudinaryPublicId: finalPublicId,
        altText: altText,
        caption: caption || null,
        category: category || "General",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
      })
      .returning();

    // 6. Refresh the public page
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

