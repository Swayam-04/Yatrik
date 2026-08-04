import { Trip, ItineraryDay, BudgetBreakdown, TravelerType, TransportMode, PreferenceType } from "@/types";

interface GenerateParams {
  destination: string;
  budget: number;
  days: number;
  travelers: number;
  travelerType: TravelerType;
  transportMode: TransportMode;
  preferences: PreferenceType[];
}

export function generateAiTrip(params: GenerateParams): Trip {
  const { destination, budget, days, travelers, travelerType, transportMode, preferences } = params;

  // Calculate smart budget breakdown
  const transportCost = Math.round(budget * 0.25);
  const stayCost = Math.round(budget * 0.35);
  const foodCost = Math.round(budget * 0.20);
  const activitiesCost = Math.round(budget * 0.12);
  const shoppingCost = Math.round(budget * 0.05);
  const emergencyCost = Math.round(budget * 0.03);
  const taxesCost = Math.round(budget * 0.05);

  const budgetBreakdown: BudgetBreakdown = {
    transport: transportCost,
    accommodation: stayCost,
    food: foodCost,
    activities: activitiesCost,
    shopping: shoppingCost,
    emergency: emergencyCost,
    taxes: taxesCost,
    total: budget,
  };

  const isWomenSolo = travelerType === 'Women Solo';
  const hasHiddenGems = preferences.includes('Hidden Gems');
  const isLuxury = preferences.includes('Luxury');

  const generatedDays: ItineraryDay[] = [];

  for (let i = 1; i <= days; i++) {
    const dayExpense = Math.round((foodCost + activitiesCost) / days);
    
    generatedDays.push({
      dayNumber: i,
      title: i === 1 ? `Arrival & Local Exploration` : i === days ? `Final Souvenirs & Farewell` : `Cultural Gems & Key Attractions`,
      date: `Day ${i}`,
      dayExpense,
      alternativePlan: `If rain occurs: Indoor Museum Tour & Specialty Cafe hopping in central ${destination}.`,
      items: [
        {
          id: `item-${i}-1`,
          timeOfDay: 'Breakfast',
          title: isLuxury ? `Artisan Gourmet Breakfast at Grand ${destination}` : `Authentic Local Breakfast Corner`,
          description: `Enjoy fresh regional delicacies, artisanal coffee, and authentic local flavors.`,
          category: 'Food',
          cost: Math.round(foodCost / (days * 3)),
          duration: '1 hr',
          location: `${destination} City Center`,
          safetyScore: 96,
          isWomenFriendly: true,
        },
        {
          id: `item-${i}-2`,
          timeOfDay: 'Morning',
          title: i === 1 ? `Iconic Landmarks & Historic Walking Route` : hasHiddenGems ? `Secret Hidden Viewpoint & Heritage Alley` : `Primary City Sightseeing Tour`,
          description: `Explore breathtaking scenic spots with verified high lighting and community recommendations.`,
          category: hasHiddenGems ? 'Hidden Gem' : 'Attraction',
          cost: Math.round(activitiesCost / (days * 2)),
          duration: '2.5 hrs',
          location: `${destination} Historic Zone`,
          safetyScore: isWomenSolo ? 98 : 92,
          isWomenFriendly: true,
        },
        {
          id: `item-${i}-3`,
          timeOfDay: 'Lunch',
          title: `Traditional Lunch at Recommended Organic Eatery`,
          description: `Sample top-rated local dishes curated by YATRIK community intelligence.`,
          category: 'Food',
          cost: Math.round(foodCost / (days * 3)),
          duration: '1.5 hrs',
          location: `${destination} Old Town`,
          safetyScore: 94,
          isWomenFriendly: true,
        },
        {
          id: `item-${i}-4`,
          timeOfDay: 'Afternoon',
          title: `Artisanal Craft Market & Souvenir Promenade`,
          description: `Browse authentic hand-crafted products, local spices, and rare collectibles.`,
          category: 'Shopping',
          cost: Math.round(shoppingCost / days),
          duration: '2 hrs',
          location: `${destination} Bazaar District`,
          safetyScore: 91,
          isWomenFriendly: true,
        },
        {
          id: `item-${i}-5`,
          timeOfDay: 'Dinner',
          title: `Rooftop Sunset Dinner with Panoramic Skyline View`,
          description: `Unwind with premium cuisine, pleasant ambient music, and sunset photography spots.`,
          category: 'Food',
          cost: Math.round(foodCost / (days * 3)),
          duration: '2 hrs',
          location: `${destination} Promenade`,
          safetyScore: 97,
          isWomenFriendly: true,
        },
      ]
    });
  }

  // Cover images based on destination
  const destLower = destination.toLowerCase();
  let coverImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

  if (destLower.includes("goa")) {
    coverImage = "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80";
  } else if (destLower.includes("tokyo") || destLower.includes("japan")) {
    coverImage = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80";
  } else if (destLower.includes("paris") || destLower.includes("france")) {
    coverImage = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80";
  } else if (destLower.includes("manali") || destLower.includes("himachal") || destLower.includes("mountain")) {
    coverImage = "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80";
  } else if (destLower.includes("bali") || destLower.includes("indonesia")) {
    coverImage = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
  } else if (destLower.includes("kerala")) {
    coverImage = "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80";
  }

  const baseSafetyScore = isWomenSolo ? 97 : 94;

  return {
    id: `trip-${Date.now()}`,
    title: `${days}-Day AI Curated ${destination} Trip`,
    destination,
    country: "Featured Destination",
    coverImage,
    budgetTotal: budget,
    spentTotal: Math.round(budget * 0.15),
    startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * (7 + days)).toISOString().split('T')[0],
    daysCount: days,
    travelersCount: travelers,
    travelType: travelerType,
    transportMode,
    preferences,
    status: 'PLANNED',
    days: generatedDays,
    budgetBreakdown,
    safetyScore: baseSafetyScore,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Async generator calling Groq AI API with structural fallback
 */
export async function generateGroqTrip(params: GenerateParams): Promise<{ trip: Trip; rawAiResponse?: string }> {
  try {
    const res = await fetch('/api/ai/generate-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: params.destination,
        daysCount: params.days,
        budgetTotal: params.budget,
        travelType: params.travelerType,
        preferences: params.preferences
      })
    });

    if (res.ok) {
      const data = await res.json();
      const trip = generateAiTrip(params);
      return { trip, rawAiResponse: data.itinerary };
    }
  } catch {
    // Graceful fallback to structural generator
  }

  return { trip: generateAiTrip(params) };
}

export const generateGemma4Trip = generateGroqTrip;
