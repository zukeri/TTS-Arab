import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { Mp3Encoder } from '@breezystack/lamejs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

/**
 * Parses a standard WAV file buffer and extracts PCM samples.
 */
function parseWav(wavBuffer: Buffer) {
  if (wavBuffer.length < 44) {
    throw new Error('Audio data is too short to be a valid WAV file');
  }
  if (
    wavBuffer.toString('ascii', 0, 4) !== 'RIFF' ||
    wavBuffer.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    throw new Error('Invalid WAV RIFF header');
  }

  let offset = 12;
  let channels = 1;
  let sampleRate = 24000;
  let bitsPerSample = 16;
  let dataOffset = 44;
  let dataLength = wavBuffer.length - 44;

  while (offset + 8 <= wavBuffer.length) {
    const chunkId = wavBuffer.toString('ascii', offset, offset + 4);
    const chunkSize = wavBuffer.readUInt32LE(offset + 4);

    if (chunkId === 'fmt ' && offset + 8 + chunkSize <= wavBuffer.length) {
      channels = wavBuffer.readUInt16LE(offset + 10);
      sampleRate = wavBuffer.readUInt32LE(offset + 12);
      bitsPerSample = wavBuffer.readUInt16LE(offset + 22);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataLength = Math.min(chunkSize, wavBuffer.length - dataOffset);
      break;
    }

    offset += 8 + chunkSize;
  }

  const pcmBuffer = wavBuffer.subarray(dataOffset, dataOffset + dataLength);
  const sampleCount = Math.floor(pcmBuffer.length / 2);
  const samples = new Int16Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    samples[i] = pcmBuffer.readInt16LE(i * 2);
  }

  const duration = sampleCount / (sampleRate * channels);
  return { channels, sampleRate, bitsPerSample, samples, duration };
}

/**
 * Encodes PCM samples from a WAV buffer into an MP3 buffer.
 */
function wavToMp3(wavBuffer: Buffer, bitrate = 128): Buffer {
  const { channels, sampleRate, samples } = parseWav(wavBuffer);
  const encoder = new Mp3Encoder(channels, sampleRate, bitrate);
  const mp3Chunks: Buffer[] = [];
  const blockSize = 1152;

  for (let i = 0; i < samples.length; i += blockSize) {
    const chunk = samples.subarray(i, i + blockSize);
    const mp3Buf = encoder.encodeBuffer(chunk);
    if (mp3Buf.length > 0) {
      mp3Chunks.push(Buffer.from(mp3Buf));
    }
  }

  const flushBuf = encoder.flush();
  if (flushBuf.length > 0) {
    mp3Chunks.push(Buffer.from(flushBuf));
  }

  return Buffer.concat(mp3Chunks);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Initialize shared Gemini client with required User-Agent
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Text-To-Speech generation endpoint
  app.post('/api/tts/generate', async (req, res) => {
    try {
      const {
        text,
        voice = 'Kore',
        style,
        model = 'gemini-3.8-flash-lite-tts',
      } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({
          error: 'Please provide text to convert to speech.',
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.',
        });
      }

      const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
      const selectedVoice = validVoices.includes(voice) ? voice : 'Kore';

      const validModels = [
        'gemini-3.8-flash-lite-tts',
        'gemini-3.8-flash-tts',
      ];
      const selectedModel = validModels.includes(model)
        ? model
        : 'gemini-3.8-flash-lite-tts';

      const speechMetadata =
        style && typeof style === 'string' && style.trim().length > 0
          ? { style: style.trim() }
          : undefined;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return res.status(502).json({
          error:
            'Gemini TTS did not return audio data. Please try adjusting your text or style settings.',
        });
      }

      const wavBuffer = Buffer.from(base64Audio, 'base64');
      const { channels, sampleRate, duration } = parseWav(wavBuffer);
      const mp3Buffer = wavToMp3(wavBuffer, 128);

      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

      return res.json({
        success: true,
        mp3Base64: mp3Buffer.toString('base64'),
        wavBase64: wavBuffer.toString('base64'),
        mimeTypeMp3: 'audio/mp3',
        mimeTypeWav: 'audio/wav',
        metadata: {
          voice: selectedVoice,
          style: style && style.trim() ? style.trim() : 'Natural / Default',
          model: selectedModel,
          sampleRate,
          channels,
          duration: Number(duration.toFixed(2)),
          mp3SizeBytes: mp3Buffer.length,
          wavSizeBytes: wavBuffer.length,
          wordCount,
          charCount: text.length,
        },
      });
    } catch (err: any) {
      console.error('Error generating TTS:', err);
      return res.status(500).json({
        error:
          err.message || 'An error occurred while generating speech with Gemini TTS.',
      });
    }
  });

  // Direct download endpoint as attachment
  app.post('/api/tts/export-mp3', async (req, res) => {
    try {
      const { mp3Base64, filename = 'gemini-voice.mp3' } = req.body;
      if (!mp3Base64) {
        return res.status(400).json({ error: 'mp3Base64 is required' });
      }
      const buffer = Buffer.from(mp3Base64, 'base64');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(filename)}"`
      );
      return res.send(buffer);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite Dev / Static Production handling
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Gemini VoiceStudio server running on http://0.0.0.0:${PORT} (${
        isProd ? 'production' : 'development'
      })`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
