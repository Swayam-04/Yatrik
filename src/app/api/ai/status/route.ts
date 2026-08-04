import { NextResponse } from 'next/server';
import { groqService } from '@/services/groq.service';
import { getAuthUser } from "@/lib/user-sync";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const status = await groqService.checkHealth();
    return NextResponse.json(status);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Groq API connection check failed';
    return NextResponse.json(
      {
        isOnline: false,
        model: groqService.getModel(),
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
