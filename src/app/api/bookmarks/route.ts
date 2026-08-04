import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { BookmarkSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.id },
      include: {
        place: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch bookmarks";
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
    const validated = BookmarkSchema.parse(body);

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_placeId: {
          userId: user.id,
          placeId: validated.placeId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        placeId: validated.placeId,
      },
      include: {
        place: true,
      },
    });

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create bookmark";
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
    const placeId = searchParams.get("placeId");

    if (id) {
      await prisma.bookmark.delete({ where: { id } });
    } else if (placeId) {
      await prisma.bookmark.deleteMany({
        where: {
          userId: user.id,
          placeId,
        },
      });
    } else {
      return NextResponse.json({ error: "id or placeId is required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete bookmark";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
