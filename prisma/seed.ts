import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Sample Users
  const user1 = await prisma.user.upsert({
    where: { email: "swayam@yatrik.com" },
    update: {},
    create: {
      clerkId: "user_2test_swayam_123",
      email: "swayam@yatrik.com",
      name: "Swayam Traveler",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      role: "USER",
      coins: 500,
      level: 2,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@yatrik.com" },
    update: {},
    create: {
      clerkId: "user_2test_admin_999",
      email: "admin@yatrik.com",
      name: "YATRIK Administrator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
      role: "ADMIN",
      coins: 1000,
      level: 5,
    },
  });

  console.log(`Created Users: ${user1.name}, ${adminUser.name}`);

  // 2. Create Sample Trips
  const trip1 = await prisma.trip.create({
    data: {
      title: "3-Day North Goa Coastal Experience",
      destination: "Goa",
      coverImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      startDate: "2026-08-10",
      endDate: "2026-08-13",
      budget: 18000,
      spentTotal: 4500,
      travelers: 2,
      travelType: "Friends",
      transportMode: "Flight",
      preferences: ["Beach", "Hidden Gems", "Food"],
      status: "PLANNED",
      createdBy: user1.id,
      itineraries: {
        create: [
          {
            day: 1,
            title: "Arrival & Anjuna Beach Promenade",
            description: "Check into resort, explore Anjuna flea market, and enjoy sunset cafe dining.",
            location: "Anjuna, North Goa",
            latitude: 15.5869,
            longitude: 73.7439,
          },
          {
            day: 2,
            title: "Secret Waterfalls & Fontainhas Heritage Walk",
            description: "Morning trek to Harvalem waterfall followed by Latin Quarter photography.",
            location: "Fontainhas, Panaji",
            latitude: 15.4989,
            longitude: 73.8278,
          },
        ],
      },
      hotels: {
        create: [
          {
            name: "Heritage Anjuna Villa Resort",
            address: "Near Anjuna Beach Rd, North Goa",
            rating: 4.8,
            price: 4200,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
            bookingUrl: "https://booking.com",
          },
        ],
      },
      restaurants: {
        create: [
          {
            name: "Curlies Beach Shack & Cafe",
            cuisine: "Goan Seafood & Continental",
            rating: 4.6,
            address: "South Anjuna Beach, Goa",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      title: "5-Day Kerala Backwater & Tea Estate Retreat",
      destination: "Kerala",
      coverImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
      startDate: "2026-09-01",
      endDate: "2026-09-06",
      budget: 28000,
      spentTotal: 8200,
      travelers: 1,
      travelType: "Women Solo",
      transportMode: "Train",
      preferences: ["Nature", "Safety", "Ayurveda"],
      status: "ACTIVE",
      createdBy: user1.id,
    },
  });

  console.log(`Created Trips: ${trip1.title}, ${trip2.title}`);

  // 3. Create Sample Places
  const place1 = await prisma.place.create({
    data: {
      name: "Fontainhas Latin Quarter",
      category: "Heritage Sightseeing",
      description: "Picturesque Portuguese colonial neighborhood with pastel painted houses and art cafes.",
      latitude: 15.4989,
      longitude: 73.8278,
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
      tripId: trip1.id,
    },
  });

  const place2 = await prisma.place.create({
    data: {
      name: "Alleppey Houseboat Pier",
      category: "Backwater Cruises",
      description: "Serene coconut lagoon cruises with traditional Keralite lunch served on board.",
      latitude: 9.4981,
      longitude: 76.3388,
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
      tripId: trip2.id,
    },
  });

  // 4. Create Sample Chat & Messages
  const chat1 = await prisma.chat.create({
    data: {
      userId: user1.id,
      tripId: trip1.id,
      title: "Goa Itinerary Planning Session",
      messages: {
        create: [
          {
            role: "user",
            content: "What are the best hidden cafes in North Goa near Anjuna?",
          },
          {
            role: "assistant",
            content: "I recommend **Eva Cafe** perched on the cliffs of Anjuna and **Artjuna Cafe** for artisanal coffee and organic bakery items!",
          },
        ],
      },
    },
  });

  // 5. Create Sample Review & Bookmark
  await prisma.review.create({
    data: {
      userId: user1.id,
      placeId: place1.id,
      rating: 4.9,
      comment: "Absolutely gorgeous heritage stroll! Safe for female travelers during daytime.",
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: user1.id,
      placeId: place1.id,
    },
  });

  // 6. Create Rewards & Notifications
  await prisma.reward.create({
    data: {
      userId: user1.id,
      points: 250,
      badges: ["First Yatri", "Goa Explorer"],
      badgeName: "Goa Coastal Specialist",
      badgeIcon: "🏖️",
      description: "Completed 3 oceanfront itinerary plans",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user1.id,
      title: "Trip Confirmed! 🎉",
      body: "Your 3-Day North Goa Coastal Experience has been saved to your dashboard.",
      isRead: false,
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
