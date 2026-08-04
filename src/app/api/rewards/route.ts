import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { RewardSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rewards = await prisma.reward.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.id },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json({
      userStats: {
        coins: user.coins,
        level: user.level,
      },
      rewards,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch rewards";
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
    const validated = RewardSchema.parse(body);

    const reward = await prisma.reward.create({
      data: {
        ...validated,
        userId: user.id,
      },
    });

    // Increment user level / coins
    await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: validated.points },
      },
    });

    return NextResponse.json({ reward }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add reward";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
