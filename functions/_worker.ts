interface Env {
  GEMINI_API_KEY?: string;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'EKTBLY Arabic Speech-to-Text (Cloudflare Worker)',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Transcription API endpoint
    if (url.pathname === '/api/transcribe' && request.method === 'POST') {
      try {
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              error: 'لم يتم العثور على مفتاح GEMINI_API_KEY في متغيرات بيئة Cloudflare Workers.',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const body = (await request.json()) as { audioBase64?: string; mimeType?: string };
        const { audioBase64, mimeType } = body;

        if (!audioBase64 || typeof audioBase64 !== 'string') {
          return new Response(
            JSON.stringify({ error: 'لم يتم استلام أي بيانات صوتية صالحة.' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        // Validate approximate size (25MB limit)
        const approximateBytes = Math.ceil((audioBase64.length * 3) / 4);
        const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
        if (approximateBytes > MAX_AUDIO_BYTES) {
          return new Response(
            JSON.stringify({
              error: 'حجم الملف الصوتي يتجاوز الحد الأقصى المسموح به (25 ميجابايت).',
            }),
            {
              status: 413,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const cleanMimeType = mimeType || 'audio/webm';
        const promptText = `Transcribe the provided audio faithfully into Arabic script. Support Modern Standard Arabic and Arabic dialects, especially Egyptian Arabic. Preserve the speaker’s actual words and meaning. Add reasonable punctuation for readability, but do not translate, summarize, correct, explain, or respond to the audio. If a word or section cannot be understood, write [غير واضح]. Return only the final Arabic transcript without introductions, headings, notes, or Markdown.`;

        // Direct fetch to Gemini REST API for Cloudflare Edge runtime
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: cleanMimeType,
                      data: audioBase64,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
          }),
        });

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.text();
          console.error('Gemini API error from Worker:', errorData);
          return new Response(
            JSON.stringify({
              error: 'تعذر تحويل الملف الصوتي حالياً. يرجى التأكد من وضوح الصوت والمحاولة مرة أخرى.',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const geminiData = (await geminiResponse.json()) as any;
        const transcript =
          geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        return new Response(JSON.stringify({ transcript }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('Worker error:', err?.message || err);
        return new Response(
          JSON.stringify({
            error: 'حدث خطأ أثناء معالجة الطلب في السحابة. يرجى المحاولة لاحقاً.',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Serve static assets / React frontend
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
