import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { ReviewSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");
    const userId = searchParams.get("userId");

    const reviews = await prisma.review.findMany({
      where: {
        placeId: placeId || undefined,
        userId: userId || undefined,
      },
      include: {
        user: {
          select: { name: true, avatar: true },
        },
        place: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = ReviewSchema.parse(body);

    const review = await prisma.review.create({
      data: {
        ...validated,
        userId: user.id,
      },
      include: {
        user: {
          select: { name: true, avatar: true },
        },
      },
    });

    // Award 50 bonus coins for leaving a review
    await prisma.user.update({
      where: { id: user.id },
      data: { coins: { increment: 50 } },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing || (user.role !== "ADMIN" && existing.userId !== user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
