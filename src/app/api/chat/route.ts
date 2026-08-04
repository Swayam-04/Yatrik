import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/user-sync";
import { ChatSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chat.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ chats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chats";
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
    const validated = ChatSchema.parse(body);

    const chat = await prisma.chat.create({
      data: {
        title: validated.title,
        tripId: validated.tripId || undefined,
        userId: user.id,
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create chat";
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

    if (!id) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    const existing = await prisma.chat.findUnique({ where: { id } });
    if (!existing || (user.role !== "ADMIN" && existing.userId !== user.id)) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 403 });
    }

    await prisma.chat.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete chat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
