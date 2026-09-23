import { NextResponse } from 'next/server';
import { groqService } from '@/services/groq.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await groqService.checkHealth();
    return NextResponse.json({
      isOnline: status.isOnline,
      online: status.isOnline,
      model: status.model,
      error: status.error,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Groq API connection check failed';
    return NextResponse.json(
      {
        isOnline: false,
        online: false,
        model: groqService.getModel(),
        error: errMessage,
      },
      { status: 500 }
    );
  }
}

