import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/Logger';

export async function POST(req: NextRequest) {
    try {
        const { error, info, state } = await req.json();

        Logger.error('Client-Side Error Reported', {
            error,
            info,
            clientState: state
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to log client error' }, { status: 500 });
    }
}
