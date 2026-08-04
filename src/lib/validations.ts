import { z } from "zod";

export const UserSchema = z.object({
  clerkId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().url().optional().nullable(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const TripSchema = z.object({
  title: z.string().min(1),
  destination: z.string().min(1),
  coverImage: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z.number().nonnegative(),
  spentTotal: z.number().nonnegative().optional(),
  travelers: z.number().int().positive().optional().default(1),
  travelType: z.string().optional().default("Solo"),
  transportMode: z.string().optional().default("Flight"),
  preferences: z.array(z.string()).optional().default([]),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional().default("PLANNED"),
});

export const ItinerarySchema = z.object({
  tripId: z.string().uuid().or(z.string().min(1)),
  day: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const HotelSchema = z.object({
  tripId: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(1),
  address: z.string().min(1),
  rating: z.number().min(0).max(5).optional().default(4.5),
  image: z.string().optional().nullable(),
  price: z.number().nonnegative().optional().default(0),
  bookingUrl: z.string().optional().nullable(),
});

export const RestaurantSchema = z.object({
  tripId: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(1),
  cuisine: z.string().min(1),
  rating: z.number().min(0).max(5).optional().default(4.5),
  address: z.string().min(1),
  image: z.string().optional().nullable(),
});

export const PlaceSchema = z.object({
  tripId: z.string().optional().nullable(),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  image: z.string().optional().nullable(),
});

export const ChatSchema = z.object({
  title: z.string().min(1),
  tripId: z.string().optional().nullable(),
});

export const MessageSchema = z.object({
  chatId: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

export const BookmarkSchema = z.object({
  placeId: z.string().min(1),
});

export const ReviewSchema = z.object({
  placeId: z.string().optional().nullable(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export const RewardSchema = z.object({
  points: z.number().int().optional().default(100),
  badges: z.array(z.string()).optional().default([]),
  badgeName: z.string().optional().nullable(),
  badgeIcon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const NotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  isRead: z.boolean().optional().default(false),
});
