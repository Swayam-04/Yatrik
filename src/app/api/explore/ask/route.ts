import { NextRequest, NextResponse } from "next/server";
import { explainPlaceWithGemma4 } from "@/services/ollama.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const place = body.place;
    const question = body.question;

    if (!place || !place.name) {
      return NextResponse.json({ error: "Place details required" }, { status: 400 });
    }

    const result = await explainPlaceWithGemma4(place, question);
    return NextResponse.json({
      success: true,
      answer: result.explanation,
      explanation: result.explanation,
      tips: result.tips,
      source: result.source,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate place insights";
    return NextResponse.json(
      { error: "Live data unavailable", details: message },
      { status: 500 }
    );
  }
}
