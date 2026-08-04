import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { ItinerarySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    const itineraries = await prisma.itinerary.findMany({
      where: { tripId },
      orderBy: { day: "asc" },
    });

    return NextResponse.json({ itineraries });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch itinerary";
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
    const validated = ItinerarySchema.parse(body);

    const trip = await prisma.trip.findUnique({ where: { id: validated.tripId } });
    if (!trip || (user.role !== "ADMIN" && trip.createdBy !== user.id)) {
      return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 403 });
    }

    const itinerary = await prisma.itinerary.create({
      data: validated,
    });

    return NextResponse.json({ itinerary }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create itinerary item";
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
      return NextResponse.json({ error: "Itinerary ID required" }, { status: 400 });
    }

    const updated = await prisma.itinerary.update({
      where: { id: body.id },
      data: {
        title: body.title || undefined,
        description: body.description || undefined,
        location: body.location || undefined,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
      },
    });

    return NextResponse.json({ itinerary: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update itinerary";
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
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.itinerary.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete itinerary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
