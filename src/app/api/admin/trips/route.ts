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

    const trips = await prisma.trip.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { itineraries: true, hotels: true, restaurants: true, places: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ trips });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin trips";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
