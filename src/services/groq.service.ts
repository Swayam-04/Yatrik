import Groq from 'groq-sdk';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqHealthStatus {
  isOnline: boolean;
  model: string;
  error?: string;
}

export interface ItineraryGenerationRequest {
  destination: string;
  daysCount: number;
  budgetTotal: number;
  travelType: string;
  preferences: string[];
}

export const SYSTEM_PROMPT = `You are YATRIK AI Assistant, an intelligent travel planner helping users create itineraries, discover destinations, recommend hotels and restaurants, optimize budgets, and provide local travel tips.`;

export function categorizeGroqError(error: unknown): string {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.trim() === '') {
    return 'Invalid API Key';
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    const status = (error as { status?: number }).status;

    if (
      status === 401 ||
      msg.includes('invalid api key') ||
      msg.includes('invalid_api_key') ||
      msg.includes('unauthorized') ||
      msg.includes('api key')
    ) {
      return 'Invalid API Key';
    }
    if (
      status === 429 ||
      msg.includes('rate limit') ||
      msg.includes('rate_limit_exceeded') ||
      msg.includes('too many requests')
    ) {
      return 'Rate Limit Reached';
    }
    if (
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      msg.includes('service unavailable') ||
      msg.includes('internal error')
    ) {
      return 'Groq Service Unavailable';
    }
    if (
      msg.includes('fetch failed') ||
      msg.includes('econnrefused') ||
      msg.includes('network') ||
      msg.includes('etimedout')
    ) {
      return 'Network Error';
    }
    return error.message;
  }

  return 'Groq Service Unavailable';
}

export class GroqService {
  private getClient(): Groq {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Invalid API Key');
    }
    return new Groq({ apiKey });
  }

  public getModel(): string {
    return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  /**
   * Check health of Groq API connection
   */
  async checkHealth(): Promise<GroqHealthStatus> {
    const model = this.getModel();
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.trim() === '') {
      return {
        isOnline: false,
        model,
        error: 'Invalid API Key',
      };
    }

    try {
      const client = this.getClient();
      await client.models.list();
      return {
        isOnline: true,
        model,
      };
    } catch (err) {
      return {
        isOnline: false,
        model,
        error: categorizeGroqError(err),
      };
    }
  }

  /**
   * Return a streaming completion from Groq API
   */
  async chatStream(messages: ChatMessage[], customSystemPrompt?: string) {
    const client = this.getClient();
    const model = this.getModel();

    const formattedMessages: ChatMessage[] = [
      { role: 'system', content: customSystemPrompt || SYSTEM_PROMPT },
      ...messages,
    ];

    try {
      const stream = await client.chat.completions.create({
        model,
        messages: formattedMessages,
        temperature: 0.4,
        stream: true,
      });

      return stream;
    } catch (err) {
      throw new Error(categorizeGroqError(err));
    }
  }

  /**
   * Generate itinerary using Groq API
   */
  async generateItinerary(req: ItineraryGenerationRequest): Promise<string> {
    const prompt = `Generate a detailed ${req.daysCount}-day travel itinerary for ${req.destination}.
Budget: ₹${req.budgetTotal.toLocaleString()}
Traveler Style: ${req.travelType}
Preferences: ${req.preferences.join(', ')}

Please provide a comprehensive day-by-day guide including:
1. Day Title & Focus Area
2. Morning, Afternoon, Evening, & Night Activities
3. Estimated Expenses for Transport, Food, Activities, and Stay
4. Local Hidden Gem Recommendations
5. Essential Safety Tips (especially for ${req.travelType} travelers)`;

    const stream = await this.chatStream([{ role: 'user', content: prompt }]);
    let result = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      result += content;
    }

    return result;
  }
}

export const groqService = new GroqService();
