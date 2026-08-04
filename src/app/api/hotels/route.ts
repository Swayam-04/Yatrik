import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { HotelSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    const hotels = await prisma.hotel.findMany({
      where: tripId ? { tripId } : undefined,
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ hotels });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch hotels";
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
    const validated = HotelSchema.parse(body);

    const hotel = await prisma.hotel.create({
      data: validated,
    });

    return NextResponse.json({ hotel }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create hotel";
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
      return NextResponse.json({ error: "Hotel ID required" }, { status: 400 });
    }

    const updated = await prisma.hotel.update({
      where: { id: body.id },
      data: {
        name: body.name || undefined,
        address: body.address || undefined,
        rating: body.rating ? parseFloat(body.rating) : undefined,
        price: body.price ? parseFloat(body.price) : undefined,
        image: body.image || undefined,
        bookingUrl: body.bookingUrl || undefined,
      },
    });

    return NextResponse.json({ hotel: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update hotel";
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
      return NextResponse.json({ error: "Hotel ID required" }, { status: 400 });
    }

    await prisma.hotel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete hotel";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
