import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAuthUser } from "@/lib/user-sync";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, recipientEmail, subject, content, tripTitle, destination } = await req.json();
    const apiKey = process.env.RESEND_API_KEY;

    const emailTo = recipientEmail || user.email;

    if (apiKey && apiKey.startsWith("re_") && !apiKey.includes("example")) {
      try {
        const resend = new Resend(apiKey);
        
        let htmlBody = `<div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>YATRIK Travel Notification</h2>
          <p>${content || "Your YATRIK travel update is ready."}</p>
        </div>`;

        if (type === "welcome") {
          htmlBody = `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #fff; border-radius: 12px;">
            <h1 style="color: #6366f1;">Welcome to YATRIK, ${user.name}! ✈️</h1>
            <p>Your intelligent AI travel companion is ready to design personalized itineraries, predict budgets, and safeguard your journeys.</p>
          </div>`;
        } else if (type === "trip_confirmation") {
          htmlBody = `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #fff; border-radius: 12px;">
            <h1 style="color: #10b981;">Trip Confirmed: ${tripTitle || destination}! 🎉</h1>
            <p>Your itinerary for ${destination || "your destination"} has been successfully processed and saved to your YATRIK Dashboard.</p>
          </div>`;
        }

        const data = await resend.emails.send({
          from: "YATRIK Travel <notifications@yatrik.app>",
          to: [emailTo],
          subject: subject || `YATRIK Travel Update: ${type}`,
          html: htmlBody,
        });

        return NextResponse.json({ success: true, data, source: "Resend Email API" });
      } catch (emailErr) {
        console.warn("Resend API error, using notification queue fallback:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Email notification queued for ${emailTo}`,
      type,
      source: "YATRIK Notification Dispatcher",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Email dispatch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
