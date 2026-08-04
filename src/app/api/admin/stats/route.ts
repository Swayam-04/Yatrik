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

    const [totalUsers, totalTrips, activeTrips, totalPlaces, totalReviews, totalRewards, totalSpent] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.trip.count({ where: { status: "ACTIVE" } }),
      prisma.place.count(),
      prisma.review.count(),
      prisma.reward.count(),
      prisma.trip.aggregate({ _sum: { spentTotal: true } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTrips,
        activeTrips,
        totalPlaces,
        totalReviews,
        totalRewards,
        totalSpent: totalSpent._sum.spentTotal || 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
