import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { RestaurantSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    const restaurants = await prisma.restaurant.findMany({
      where: tripId ? { tripId } : undefined,
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ restaurants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch restaurants";
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
    const validated = RestaurantSchema.parse(body);

    const restaurant = await prisma.restaurant.create({
      data: validated,
    });

    return NextResponse.json({ restaurant }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create restaurant";
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
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id: body.id },
      data: {
        name: body.name || undefined,
        cuisine: body.cuisine || undefined,
        rating: body.rating ? parseFloat(body.rating) : undefined,
        address: body.address || undefined,
        image: body.image || undefined,
      },
    });

    return NextResponse.json({ restaurant: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update restaurant";
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
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    await prisma.restaurant.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete restaurant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
