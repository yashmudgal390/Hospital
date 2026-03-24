import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { createId } from "@paralleldrive/cuid2";

// Must use Node runtime to safely handle Buffer and FormData
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "clinic";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Generate unique filename
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${Date.now()}-${createId()}.${fileExt}`;

    // 4. Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin
      .storage
      .from("hospital-images")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("[Supabase Upload Error]", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to Supabase Storage", details: String(uploadError) },
        { status: 500 }
      );
    }

    // 5. Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from("hospital-images")
      .getPublicUrl(fileName);

    // 6. Return the secure URL and public ID
    return NextResponse.json({
      success: true,
      url: publicUrl,
      publicId: fileName,
    });
  } catch (error: any) {
    console.error("[Upload API Error Details]:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Upload failed: ${error.message || "Internal server error"}` },
      { status: 500 }
    );
  }
}
