import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production' || !process.env.DISABLE_HMR;

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB

// Allow JSON body up to 35MB (to comfortably hold 25MB raw file encoded in base64)
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Health Check Endpoints returning HTTP 200
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'EKTBLY Arabic Speech-to-Text' });
});

// Server-side transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'لم يتم العثور على مفتاح GEMINI_API_KEY في متغيرات البيئة.',
      });
    }

    const { audioBase64, mimeType } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'لم يتم استلام أي بيانات صوتية صالحة.' });
    }

    // Validate size (base64 length * 0.75 gives approximate raw byte size)
    const approximateBytes = Math.ceil((audioBase64.length * 3) / 4);
    if (approximateBytes > MAX_AUDIO_BYTES) {
      return res.status(413).json({
        error: 'حجم الملف الصوتي يتجاوز الحد الأقصى المسموح به (25 ميجابايت).',
      });
    }

    const cleanMimeType = mimeType || 'audio/webm';

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ektbly-app',
        },
      },
    });

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: cleanMimeType,
      },
    };

    const promptText = `Transcribe the provided audio faithfully into Arabic script. Support Modern Standard Arabic and Arabic dialects, especially Egyptian Arabic. Preserve the speaker’s actual words and meaning. Add reasonable punctuation for readability, but do not translate, summarize, correct, explain, or respond to the audio. If a word or section cannot be understood, write [غير واضح]. Return only the final Arabic transcript without introductions, headings, notes, or Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [audioPart, { text: promptText }],
      },
    });

    const transcript = response.text || '';
    return res.json({ transcript: transcript.trim() });
  } catch (error: any) {
    console.error('Transcription server error:', error?.message || error);
    return res.status(500).json({
      error: 'تعذر تحويل الملف الصوتي حالياً. يرجى التأكد من وضوح الصوت والمحاولة مرة أخرى.',
    });
  }
});

async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distExists = fs.existsSync(distPath);

  if (isProd && distExists) {
    // Serve static files from compiled dist directory in production
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In dev / preview mode, use Vite middleware
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      if (distExists) {
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
          res.sendFile(path.resolve(distPath, 'index.html'));
        });
      }
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`EKTBLY server running on http://${HOST}:${PORT} (production: ${isProd})`);
  });
}

startServer();
