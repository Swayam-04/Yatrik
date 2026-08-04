import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { PlaceSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const tripId = searchParams.get("tripId");

    const whereClause: Record<string, unknown> = {};
    if (category) whereClause.category = category;
    if (tripId) whereClause.tripId = tripId;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const places = await prisma.place.findMany({
      where: whereClause,
      include: {
        reviews: true,
        bookmarks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ places });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch places";
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
    const validated = PlaceSchema.parse(body);

    const place = await prisma.place.create({
      data: validated,
    });

    return NextResponse.json({ place }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create place";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Place ID required" }, { status: 400 });
    }

    const updated = await prisma.place.update({
      where: { id: body.id },
      data: {
        name: body.name || undefined,
        category: body.category || undefined,
        description: body.description || undefined,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        image: body.image || undefined,
      },
    });

    return NextResponse.json({ place: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update place";
    return NextResponse.json({ error: message }, { status: 500 });
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
      return NextResponse.json({ error: "Place ID required" }, { status: 400 });
    }

    await prisma.place.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
