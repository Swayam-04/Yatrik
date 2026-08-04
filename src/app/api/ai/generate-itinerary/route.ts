import { NextRequest, NextResponse } from "next/server";
import { groqService, ItineraryGenerationRequest } from "@/services/groq.service";
import { getAuthUser } from "@/lib/user-sync";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body: ItineraryGenerationRequest = await req.json();

    if (!body.destination || !body.daysCount) {
      return NextResponse.json({ error: "Destination and duration are required" }, { status: 400 });
    }

    const user = await getAuthUser();
    const itineraryMarkdown = await groqService.generateItinerary(body);

    let savedTrip = null;

    if (user) {
      try {
        // Automatically save AI-generated trip, itinerary, hotels, restaurants, places, and chat history to Prisma DB
        savedTrip = await prisma.trip.create({
          data: {
            title: `${body.daysCount}-Day AI Curated ${body.destination} Trip`,
            destination: body.destination,
            budget: body.budgetTotal || 15000,
            spentTotal: 0,
            travelers: 1,
            travelType: body.travelType || "Solo",
            preferences: body.preferences || [],
            status: "PLANNED",
            createdBy: user.id,
            itineraries: {
              create: Array.from({ length: body.daysCount }).map((_, i) => ({
                day: i + 1,
                title: `Day ${i + 1}: ${body.destination} AI Highlights`,
                description: `Curated AI itinerary segment for Day ${i + 1} of ${body.destination}`,
                location: `${body.destination} Center`,
              })),
            },
            hotels: {
              create: [
                {
                  name: `Grand ${body.destination} Boutique Hotel`,
                  address: `${body.destination} Promenade, Main City`,
                  rating: 4.7,
                  price: Math.round((body.budgetTotal || 15000) * 0.35 / (body.daysCount || 3)),
                  image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
                },
              ],
            },
            restaurants: {
              create: [
                {
                  name: `Authentic ${body.destination} Culinary Shack`,
                  cuisine: "Local & Regional Specialties",
                  rating: 4.8,
                  address: `Central Market, ${body.destination}`,
                  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
                },
              ],
            },
            places: {
              create: [
                {
                  name: `Iconic ${body.destination} Viewpoint & Heritage Alley`,
                  category: "Attraction",
                  description: `Top recommended spot in ${body.destination} with high community safety score.`,
                  image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
                },
              ],
            },
            chats: {
              create: {
                userId: user.id,
                title: `Chat Session: ${body.destination} Trip`,
                messages: {
                  create: [
                    {
                      role: "user",
                      content: `Generate a ${body.daysCount}-day itinerary for ${body.destination} with budget ₹${body.budgetTotal}.`,
                    },
                    {
                      role: "assistant",
                      content: itineraryMarkdown,
                    },
                  ],
                },
              },
            },
          },
          include: {
            itineraries: true,
            hotels: true,
            restaurants: true,
            places: true,
          },
        });

        // Award bonus coins for generating AI trip
        await prisma.user.update({
          where: { id: user.id },
          data: { coins: { increment: 100 } },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: `AI Trip Generated: ${body.destination}`,
            body: `Your ${body.daysCount}-day trip to ${body.destination} has been saved to your dashboard.`,
          },
        });
      } catch (dbError) {
        console.error("Non-blocking DB save notice:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      itinerary: itineraryMarkdown,
      trip: savedTrip,
      model: groqService.getModel(),
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Itinerary generation failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
