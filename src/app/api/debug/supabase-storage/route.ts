import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const hasUrl = !!supabaseUrl;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasUrl || !hasServiceKey) {
      return NextResponse.json({
        status: "MISSING ENV VARS",
        NEXT_PUBLIC_SUPABASE_URL: hasUrl,
        SUPABASE_SERVICE_ROLE_KEY: hasServiceKey,
      }, { status: 500 });
    }

    // Test connection by checking the hospital-images bucket
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
       throw error;
    }

    const targetBucket = buckets.find(b => b.name === "hospital-images");

    return NextResponse.json({
      status: targetBucket ? "OK" : "BUCKET_NOT_FOUND",
      message: targetBucket 
          ? "Supabase Storage is fully configured and the hospital-images bucket exists." 
          : "The 'hospital-images' bucket was not found in your Supabase project. Please create it and make it Public.",
      buckets_found: buckets.map(b => b.name),
      supabaseUrl,
    });
  } catch (error) {
    return NextResponse.json({
      status: "ERROR",
      message: String(error),
    }, { status: 500 });
  }
}
