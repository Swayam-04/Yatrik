import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const rewards = await prisma.reward.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json({ rewards });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin rewards";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.targetUserId || !body.points) {
      return NextResponse.json({ error: "targetUserId and points are required" }, { status: 400 });
    }

    const reward = await prisma.reward.create({
      data: {
        userId: body.targetUserId,
        points: parseInt(body.points),
        badgeName: body.badgeName || "Admin Bonus Badge",
        badgeIcon: body.badgeIcon || "🌟",
        description: body.description || "Reward granted by administrator",
      },
    });

    await prisma.user.update({
      where: { id: body.targetUserId },
      data: { coins: { increment: parseInt(body.points) } },
    });

    return NextResponse.json({ reward }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to grant reward";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
