import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const hasCloudName = !!cloudName;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudName || !hasApiKey || !hasApiSecret) {
      return NextResponse.json({
        status: "MISSING ENV VARS",
        CLOUDINARY_CLOUD_NAME: hasCloudName,
        CLOUDINARY_API_KEY: hasApiKey,
        CLOUDINARY_API_SECRET: hasApiSecret,
      }, { status: 500 });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test connection by pinging Cloudinary
    const result = await cloudinary.api.ping();

    return NextResponse.json({
      status: "OK",
      cloudinary: result,
      cloud_name: cloudName,
    });
  } catch (error) {
    return NextResponse.json({
      status: "ERROR",
      message: String(error),
    }, { status: 500 });
  }
}
