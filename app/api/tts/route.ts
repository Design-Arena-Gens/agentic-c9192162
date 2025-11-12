export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'alloy', format = 'mp3' } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Cloud TTS not configured (missing OPENAI_API_KEY).' }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text,
        voice,
        format,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ error: 'Upstream TTS failed', details: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contentType = resp.headers.get('Content-Type') || 'audio/mpeg';
    // Stream the audio through to the client
    return new Response(resp.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error', message: err?.message ?? 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
