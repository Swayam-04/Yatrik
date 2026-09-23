import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photoName = searchParams.get("name");

    if (!photoName) {
      return NextResponse.json({ error: "Photo resource name required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey.includes("EXAMPLE")) {
      // Return a safe fallback unauthenticated placeholder from Unsplash
      return NextResponse.redirect(
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
      );
    }

    // Google Places (New) photo URL format
    const googlePhotoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${apiKey}`;

    const imageRes = await axios.get(googlePhotoUrl, {
      responseType: "arraybuffer",
      timeout: 8000,
    });

    const contentType = String(imageRes.headers["content-type"] || "image/jpeg");

    return new NextResponse(imageRes.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: unknown) {
    // Graceful fallback to neutral travel scenery if photo fetch fails
    return NextResponse.redirect(
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
    );
  }
}
