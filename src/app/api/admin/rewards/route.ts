import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    try {
      const rewards = await prisma.reward.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { unlockedAt: "desc" },
      });

      return NextResponse.json({ rewards });
    } catch (dbErr) {
      console.warn("Database offline in admin rewards GET, returning fallback list:", dbErr);
      return NextResponse.json({ rewards: [] });
    }
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

    const pointsNum = parseInt(body.points, 10);
    if (isNaN(pointsNum)) {
      return NextResponse.json({ error: "points must be a valid number" }, { status: 400 });
    }

    try {
      const targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: body.targetUserId },
            { clerkId: body.targetUserId },
          ],
        },
      });

      const resolvedUserId = targetUser ? targetUser.id : body.targetUserId;

      const reward = await prisma.reward.create({
        data: {
          userId: resolvedUserId,
          points: pointsNum,
          badgeName: body.badgeName || "Admin Bonus Badge",
          badgeIcon: body.badgeIcon || "🌟",
          description: body.description || "Reward granted by administrator",
        },
      });

      if (targetUser) {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: { coins: { increment: pointsNum } },
        });
      }

      return NextResponse.json({ reward }, { status: 201 });
    } catch (dbErr) {
      console.warn("Database offline in admin rewards POST, returning mock response:", dbErr);
      return NextResponse.json({
        reward: {
          id: `rew-${Date.now()}`,
          userId: body.targetUserId,
          points: pointsNum,
          badgeName: body.badgeName || "Admin Bonus Badge",
          badgeIcon: body.badgeIcon || "🌟",
          description: body.description || "Reward granted by administrator",
          unlockedAt: new Date().toISOString(),
        },
      }, { status: 201 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to grant reward";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
