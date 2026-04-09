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

import YTDlpWrapImport from 'yt-dlp-wrap';
const YTDlpWrap = YTDlpWrapImport.default || YTDlpWrapImport;
const ytDlpBinaryPath = path.join(os.tmpdir(), os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

const ensureYtDlp = async () => {
    try {
        await fs.access(ytDlpBinaryPath);
    } catch {
        console.log("[yt-dlp] Native binary not found. Downloading cross-platform standalone executable...");
        await YTDlpWrap.downloadFromGithub(ytDlpBinaryPath);
        if (os.platform() !== 'win32') {
            await execAsync(`chmod +x "${ytDlpBinaryPath}"`);
        }
        console.log("[yt-dlp] Core engine successfully initialized.");
    }
    return new YTDlpWrap(ytDlpBinaryPath);
};

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

        const ytDlpWrap = await ensureYtDlp();
        await ytDlpWrap.execPromise([
            youtubeUrl,
            '-f', 'bestaudio[ext=m4a]',
            '--no-playlist',
            '--quiet',
            '--extractor-args', 'youtube:player_client=android,ios',
            '-o', outputFile
        ]);

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
        return transcript;

    } catch (err) {
        console.error(`[Deepgram/yt-dlp] Error:`, err);
        throw err; // DO NOT swallow the error, throw it so the API route can return it!
    } finally {
        // Clean up temp file
        try { await fs.unlink(outputFile); } catch (_) {}
    }
};
