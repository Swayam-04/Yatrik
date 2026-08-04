import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        itineraries: true,
        days: {
          include: { items: true },
        },
        hotels: true,
        restaurants: true,
        places: true,
        expenses: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && trip.createdBy !== user.id) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    return NextResponse.json({ trip });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch trip details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && existing.createdBy !== user.id) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        title: body.title || undefined,
        destination: body.destination || undefined,
        budget: body.budget ? parseFloat(body.budget) : undefined,
        spentTotal: body.spentTotal ? parseFloat(body.spentTotal) : undefined,
        status: body.status || undefined,
        startDate: body.startDate || undefined,
        endDate: body.endDate || undefined,
        travelers: body.travelers ? parseInt(body.travelers) : undefined,
      },
    });

    return NextResponse.json({ trip: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update trip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && existing.createdBy !== user.id) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    await prisma.trip.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Trip deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete trip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
