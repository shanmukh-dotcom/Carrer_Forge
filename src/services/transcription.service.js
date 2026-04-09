import { createRequire } from 'module';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
dotenv.config();

const require = createRequire(import.meta.url);
const { DeepgramClient } = require('@deepgram/sdk');
const execAsync = promisify(exec);
const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

/**
 * Downloads YouTube audio using the system yt-dlp binary,
 * then transcribes it with Deepgram nova-2 for high-accuracy output.
 * Falls back gracefully if anything fails.
 */
export const transcribeYouTubeUrl = async (youtubeUrl) => {
    const tmpDir = os.tmpdir();
    const outputTemplate = path.join(tmpDir, `yt_audio_${Date.now()}`);
    const outputFile = `${outputTemplate}.m4a`;

    try {
        console.log(`[Deepgram] Downloading audio: ${youtubeUrl}`);

        // Use python -m yt_dlp (works on Windows where PATH may not include yt-dlp binary)
        const cmd = `python -m yt_dlp -f "bestaudio[ext=m4a]" --no-playlist --quiet -o "${outputFile}" "${youtubeUrl}"`;
        await execAsync(cmd, { timeout: 180000 }); // 3 min timeout for long videos

        // Verify the file was created
        await fs.access(outputFile);
        const audioBuffer = await fs.readFile(outputFile);
        console.log(`[Deepgram] Audio ready (${(audioBuffer.length / 1024 / 1024).toFixed(1)} MB). Transcribing...`);

        const deepgramUrl = 'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&detect_language=true&paragraphs=true';
        const response = await fetch(deepgramUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
                'Content-Type': 'audio/m4a'
            },
            body: audioBuffer
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Deepgram API error: ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();

        // Extract transcript — prefer paragraph-formatted version
        const transcript =
            data.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ||
            data.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
            '';

        console.log(`[Deepgram] ✅ Transcription done. ${transcript.length} characters`);
        return transcript || null;

    } catch (err) {
        console.error('[Deepgram] ❌ Failed:', err.message);
        return null;
    } finally {
        // Clean up temp file
        try { await fs.unlink(outputFile); } catch (_) {}
    }
};
