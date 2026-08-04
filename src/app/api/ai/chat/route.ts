import { NextRequest, NextResponse } from 'next/server';
import { groqService, ChatMessage, categorizeGroqError } from '@/services/groq.service';
import { getAuthUser } from "@/lib/user-sync";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { messages, systemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const groqStream = await groqService.chatStream(messages as ChatMessage[], systemPrompt);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of groqStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (err) {
          const formattedError = categorizeGroqError(err);
          controller.enqueue(encoder.encode(`\n⚠️ ${formattedError}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    const errMessage = categorizeGroqError(error);
    let status = 500;
    if (errMessage === 'Invalid API Key') status = 401;
    if (errMessage === 'Rate Limit Reached') status = 429;
    if (errMessage === 'Groq Service Unavailable') status = 503;

    return NextResponse.json({ error: errMessage }, { status });
  }
}
