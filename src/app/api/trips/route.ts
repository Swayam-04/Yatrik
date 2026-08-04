import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { TripSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = user.role === "ADMIN" ? {} : { createdBy: user.id };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where: whereClause,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.trip.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      trips,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch trips";
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
    const validatedData = TripSchema.parse(body);

    const trip = await prisma.trip.create({
      data: {
        ...validatedData,
        createdBy: user.id,
      },
      include: {
        itineraries: true,
        hotels: true,
        restaurants: true,
        places: true,
      },
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create trip";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
