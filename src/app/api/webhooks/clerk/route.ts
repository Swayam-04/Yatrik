import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, first_name, last_name, email_addresses, image_url } = payload.data;
      const email = email_addresses?.[0]?.email_address || "";
      const name = `${first_name || ""} ${last_name || ""}`.trim() || "YATRIK Traveler";
      const avatar = image_url;

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          name,
          email,
          avatar,
        },
        create: {
          clerkId: id,
          email,
          name,
          avatar,
          coins: 250,
          level: 1,
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Clerk Webhook Sync Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
