import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getAuthUser() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const clerkId = clerkUser.id;
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "YATRIK Traveler";
    const avatar = clerkUser.imageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80";

    const isAdmin = email.toLowerCase().includes("admin") || clerkUser.publicMetadata?.role === "admin";

    // Upsert user record in Prisma PostgreSQL database
    const dbUser = await prisma.user.upsert({
      where: { clerkId },
      update: {
        name,
        avatar,
        email,
        role: isAdmin ? "ADMIN" : undefined,
      },
      create: {
        clerkId,
        email,
        name,
        avatar,
        role: isAdmin ? "ADMIN" : "USER",
        coins: 250,
        level: 1,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error in getAuthUser database sync:", error);
    return null;
  }
}

export async function getOrCreateDbUser() {
  return getAuthUser();
}
