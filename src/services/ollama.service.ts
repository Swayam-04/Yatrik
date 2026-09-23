import axios from "axios";
import { RealPlace } from "./places.service";
import { RealWeatherData } from "./weather.service";
import { Trip, ItineraryDay, TravelerType, TransportMode, PreferenceType, BudgetBreakdown } from "@/types";
import { groqService } from "./groq.service";

export interface PlanGenerationInput {
  destination: string;
  latitude: number;
  longitude: number;
  budgetTotal: number;
  daysCount: number;
  travelersCount: number;
  travelType: TravelerType;
  transportMode: TransportMode;
  preferences: PreferenceType[];
  realPlaces: RealPlace[];
  realWeather?: RealWeatherData | null;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4";

/**
 * Checks whether the Ollama local daemon is online and whether the model is available.
 */
export async function checkOllamaHealth(): Promise<{ isOnline: boolean; model: string; error?: string }> {
  try {
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
    const models = res.data?.models || [];
    const hasModel = models.some((m: any) =>
      (m.name || "").toLowerCase().includes(OLLAMA_MODEL.toLowerCase())
    );

    return {
      isOnline: true,
      model: hasModel ? OLLAMA_MODEL : models[0]?.name || OLLAMA_MODEL,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Ollama connection failed";
    return {
      isOnline: false,
      model: OLLAMA_MODEL,
      error: `Ollama unavailable at ${OLLAMA_BASE_URL} (${msg})`,
    };
  }
}

/**
 * Constructs the strict grounding prompt ensuring Gemma 4 NEVER invents places,
 * ratings, prices, or operating hours.
 */
function buildGroundedPrompt(input: PlanGenerationInput): string {
  const placesFormatted = input.realPlaces.map((p, idx) => ({
    index: idx + 1,
    id: p.placeId,
    name: p.name,
    category: p.category,
    address: p.address,
    rating: p.rating ?? "N/A",
    userRatingCount: p.userRatingCount ?? 0,
    priceLevel: p.priceLevel ?? "Standard",
    latitude: p.latitude,
    longitude: p.longitude,
    types: p.types?.slice(0, 3) || [],
  }));

  const weatherSnippet = input.realWeather
    ? `Current: ${input.realWeather.temperature}°C, ${input.realWeather.condition}. Description: ${input.realWeather.description}. 7-day forecast high/low: ${input.realWeather.forecast.slice(0, input.daysCount).map(f => `${f.day}: ${f.tempMax}°C/${f.tempMin}°C (${f.condition})`).join(", ")}`
    : "Live weather data currently unavailable.";

  return `
You are Gemma 4, the core AI intelligence behind YATRIK Travel Platform.
You have been provided with VERIFIED, AUTHENTIC REAL-WORLD PLACES retrieved directly from the Google Places API (New) for destination: "${input.destination}".

CRITICAL INSTRUCTIONS & STRICT GROUNDING CONSTRAINTS:
1. You MUST ONLY schedule and organize activities from the provided "AUTHENTIC_PLACES_LIST" below.
2. DO NOT invent, hallucinate, or synthesize ANY fictional attractions, fake hotels, imaginary cafes, or fabricated restaurants.
3. Every single activity item in your itinerary MUST map directly to a place from the provided list, using its real name, real address, and real coordinates.
4. Your responsibility is:
   - Logical geographical ordering (minimizing travel time between stops)
   - Scheduling activities across ${input.daysCount} days based on morning, lunch, afternoon, dinner, night
   - Pacing the itinerary according to travel style: "${input.travelType}" and preferences: [${input.preferences.join(", ")}]
   - Budget reasoning and allocation under the total budget ₹${input.budgetTotal}
   - Explaining why each real place is recommended for this traveler
5. Return ONLY a valid JSON object matching the schema below. No markdown fences around the JSON, no intro text.

AUTHENTIC_PLACES_LIST:
${JSON.stringify(placesFormatted, null, 2)}

DESTINATION WEATHER INTELLIGENCE:
${weatherSnippet}

USER TRIP PROFILE:
- Destination: ${input.destination}
- Duration: ${input.daysCount} days
- Total Budget: ₹${input.budgetTotal}
- Group: ${input.travelersCount} traveler(s) (${input.travelType})
- Transport: ${input.transportMode}
- Interests: ${input.preferences.join(", ")}

EXPECTED JSON OUTPUT STRUCTURE:
{
  "summary": "1-2 sentence trip overview explaining the personalization strategy",
  "days": [
    {
      "dayNumber": 1,
      "title": "Descriptive day theme",
      "date": "Day 1",
      "dayExpense": 3500,
      "alternativePlan": "Weather-adapted backup activity using another real place from the list",
      "items": [
        {
          "id": "item-1-1",
          "timeOfDay": "Morning",
          "title": "Exact name of real place from list",
          "description": "Personalized reason and guidance for visiting this authentic spot",
          "category": "Attraction",
          "cost": 500,
          "duration": "2 hrs",
          "location": "Real address from list",
          "lat": 0.000,
          "lng": 0.000,
          "safetyScore": 95,
          "isWomenFriendly": true
        }
      ]
    }
  ]
}
`.trim();
}

/**
 * Generates a strictly grounded personalized itinerary using Gemma 4 via Ollama.
 * If Ollama is offline, falls back to Groq with the identical strict prompt.
 */
export async function generateGroundedItinerary(
  input: PlanGenerationInput
): Promise<{ trip: Trip; source: string; rawAiResponse?: string }> {
  // If no real places were retrieved, we DO NOT invent fake places.
  if (!input.realPlaces || input.realPlaces.length === 0) {
    throw new Error(
      "Live data unavailable: No authentic places were found for this location. Cannot generate an authentic itinerary without real place data."
    );
  }

  const prompt = buildGroundedPrompt(input);
  let responseText = "";
  let sourceModel = `Ollama (${OLLAMA_MODEL})`;

  // 1. Primary: Gemma 4 through Ollama
  try {
    const ollamaResponse = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.3, // Lower temperature to prevent hallucination
          top_p: 0.8,
        },
      },
      { timeout: 45000 }
    );

    if (ollamaResponse.data?.response) {
      responseText = ollamaResponse.data.response;
    }
  } catch (ollamaErr) {
    console.warn("Ollama Gemma 4 call failed, trying backup AI provider:", ollamaErr);

    // 2. Backup: Groq with identical strict grounding prompt
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("example")) {
      try {
        const stream = await groqService.chatStream(
          [{ role: "user", content: prompt }],
          "You are Gemma 4 on YATRIK. You strictly output JSON and NEVER invent fictional places. Every activity must come from the provided AUTHENTIC_PLACES_LIST."
        );
        let groqText = "";
        for await (const chunk of stream) {
          groqText += chunk.choices[0]?.delta?.content || "";
        }
        responseText = groqText;
        sourceModel = `Groq Grounded Backup (${groqService.getModel()})`;
      } catch (groqErr) {
        console.error("Groq fallback also failed:", groqErr);
      }
    }
  }

  // Parse JSON response
  let parsedData: { summary?: string; days?: ItineraryDay[] } | null = null;
  if (responseText) {
    try {
      const cleanJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn("Failed to parse AI JSON response:", parseErr);
    }
  }

  // If AI generation failed completely, build a deterministic itinerary using the real places directly
  let finalDays: ItineraryDay[] = [];
  if (parsedData?.days && Array.isArray(parsedData.days) && parsedData.days.length > 0) {
    finalDays = parsedData.days;
  } else {
    sourceModel = "YATRIK Real-Data Spatial Arranger (AI Offline)";
    finalDays = assembleDeterministicItinerary(input);
  }

  // Calculate budget breakdown based on requested total
  const budget = input.budgetTotal;
  const budgetBreakdown: BudgetBreakdown = {
    transport: Math.round(budget * 0.25),
    accommodation: Math.round(budget * 0.35),
    food: Math.round(budget * 0.20),
    activities: Math.round(budget * 0.12),
    shopping: Math.round(budget * 0.05),
    emergency: Math.round(budget * 0.03),
    taxes: Math.round(budget * 0.05),
    total: budget,
  };

  const trip: Trip = {
    id: `trip-${Date.now()}`,
    title: `${input.daysCount}-Day ${input.travelType} Journey in ${input.destination}`,
    destination: input.destination,
    country: input.destination.split(",").pop()?.trim() || "Global",
    coverImage:
      input.realPlaces.find((p) => p.photos && p.photos.length > 0)?.photos?.[0] ||
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    budgetTotal: budget,
    spentTotal: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + input.daysCount * 86400000).toISOString().split("T")[0],
    daysCount: input.daysCount,
    travelersCount: input.travelersCount,
    travelType: input.travelType,
    transportMode: input.transportMode,
    preferences: input.preferences,
    status: "PLANNED",
    days: finalDays,
    budgetBreakdown,
    safetyScore: input.travelType === "Women Solo" ? 97 : 94,
    createdAt: new Date().toISOString(),
  };

  return { trip, source: sourceModel, rawAiResponse: responseText };
}

/**
 * Deterministically distributes authentic real places into day schedules when AI is offline.
 * Zero fabricated places.
 */
function assembleDeterministicItinerary(input: PlanGenerationInput): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const places = [...input.realPlaces];
  const itemsPerDay = Math.min(4, Math.max(2, Math.floor(places.length / input.daysCount) || 2));

  let placeIdx = 0;
  for (let d = 1; d <= input.daysCount; d++) {
    const dayItems: any[] = [];
    const timesOfDay = ["Morning", "Lunch", "Afternoon", "Dinner"];

    for (let slot = 0; slot < itemsPerDay; slot++) {
      if (placeIdx < places.length) {
        const p = places[placeIdx];
        dayItems.push({
          id: `item-${d}-${slot + 1}`,
          timeOfDay: timesOfDay[slot] || "Daytime",
          title: p.name,
          description: p.summary || `Authentic verified ${p.category} located at ${p.address}.`,
          category: p.category.includes("restaurant") || p.category.includes("cafe") ? "Food" : "Attraction",
          cost: Math.round(input.budgetTotal / (input.daysCount * itemsPerDay)),
          duration: slot === 1 || slot === 3 ? "1.5 hrs" : "2 hrs",
          location: p.address,
          lat: p.latitude,
          lng: p.longitude,
          safetyScore: 95,
          isWomenFriendly: true,
        });
        placeIdx++;
      }
    }

    days.push({
      dayNumber: d,
      title: d === 1 ? "Arrival & Signature Landmarks" : d === input.daysCount ? "Local Highlights & Farewell" : `Exploration & Culinary Gems Day ${d}`,
      date: `Day ${d}`,
      dayExpense: Math.round(input.budgetTotal / input.daysCount),
      items: dayItems,
    });
  }

  return days;
}

/**
 * Explains a real place and answers user questions using Gemma 4 via Ollama.
 * Grounded strictly in authentic place facts.
 */
export async function explainPlaceWithGemma4(
  place: RealPlace,
  userQuestion?: string
): Promise<{ explanation: string; tips: string[]; source: string }> {
  const prompt = `
You are Gemma 4 on YATRIK Travel Platform.
You are providing insights about this real, verified place:
- Name: "${place.name}"
- Category: "${place.category}"
- Address: "${place.address}"
- Rating: ${place.rating ?? "N/A"} (${place.userRatingCount ?? 0} reviews)
- Price Level: ${place.priceLevel ?? "Standard"}
- Types: ${(place.types || []).join(", ")}
${place.summary ? `- Summary: "${place.summary}"` : ""}

USER QUESTION: "${userQuestion || "Explain what makes this place special, why a traveler should visit, and tips for visiting."}"

CRITICAL INSTRUCTIONS:
1. Ground your reasoning ONLY in the real place facts provided.
2. DO NOT invent fictional opening hours, false prices, or fake attractions inside the venue.
3. Provide an insightful, engaging summary and 3 practical traveler tips.
4. Return ONLY a valid JSON object matching:
{
  "explanation": "2-3 sentences explaining the vibe, architectural/culinary character, and why it is worth visiting",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}
`.trim();

  let responseText = "";
  let source = `Ollama (${OLLAMA_MODEL})`;

  try {
    const res = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json",
      },
      { timeout: 30000 }
    );
    responseText = res.data?.response || "";
  } catch (err) {
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("example")) {
      try {
        const stream = await groqService.chatStream(
          [{ role: "user", content: prompt }],
          "You are Gemma 4 on YATRIK. Output only valid JSON based strictly on provided place data."
        );
        for await (const chunk of stream) {
          responseText += chunk.choices[0]?.delta?.content || "";
        }
        source = `Groq Backup (${groqService.getModel()})`;
      } catch (e) {
        console.warn("Groq backup failed for place explanation:", e);
      }
    }
  }

  if (responseText) {
    try {
      const clean = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        explanation: parsed.explanation || `Verified ${place.category} located at ${place.address}.`,
        tips: Array.isArray(parsed.tips) ? parsed.tips : [
          "Check local operating hours",
          "Respect photography guidelines",
          "Recommended by YATRIK verified local radar",
        ],
        source,
      };
    } catch {}
  }

  return {
    explanation: `${place.name} is a verified ${place.category} located at ${place.address} with a ${
      place.rating ? place.rating + "★" : "good"
    } community satisfaction rating.`,
    tips: [
      "Check current opening status before heading out",
      "Easily accessible via local transit or walking routes",
      "Verified on YATRIK through authentic community and Google Places signals",
    ],
    source: "YATRIK Verified Local Intelligence",
  };
}
