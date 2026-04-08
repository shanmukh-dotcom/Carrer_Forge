import { GoogleGenAI } from '@google/genai';
import { analyzePrompt, roadmapPrompt, recommendPrompt, testPrompt } from '../utils/prompts.js';
import dotenv from 'dotenv';
dotenv.config();

let ai;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (error) {
  console.warn("Failed to initialize Google Gen AI.", error);
}

const parseJsonResponse = (text) => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse JSON response:", text.slice(0, 300));
    return null;
  }
};

const callGemini = async (prompt, useProModel = false) => {
  if (!ai) {
    throw new Error('AI not configured. Add GEMINI_API_KEY to .env');
  }
  
  // Use gemini-2.5-pro for deep transcript analysis, flash for lighter tasks
  const model = useProModel ? 'gemini-2.5-pro-exp-03-25' : 'gemini-2.0-flash';

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        maxOutputTokens: useProModel ? 8192 : 4096,
    }
  });

  return parseJsonResponse(response.text);
};

export const processTranscript = async (transcript, pastConcepts) => {
  console.log(`[AI] Transcript length: ${transcript.length} chars`);

  const CHUNK_LIMIT = 18000; // ~4500 words — safe for a single deep analysis call

  if (transcript.length <= CHUNK_LIMIT) {
    // Short video — send full transcript in one shot with Pro model
    return await callGemini(analyzePrompt(transcript, pastConcepts), true);
  }

  // Long video — split into chunks, analyze each, then merge into final output
  console.log(`[AI] Long transcript detected. Using chunked analysis.`);
  const chunks = [];
  for (let i = 0; i < transcript.length; i += CHUNK_LIMIT) {
    chunks.push(transcript.slice(i, i + CHUNK_LIMIT));
  }

  // Analyze each chunk with flash (fast + cheap for partial segments)
  const chunkSummaries = [];
  for (const chunk of chunks) {
    const result = await callGemini(analyzePrompt(chunk, []), false);
    if (result) chunkSummaries.push(result);
  }

  if (chunkSummaries.length === 0) return null;

  // Merge: combine all chunks then do a final Pro-model synthesis pass
  const mergedTranscript = chunkSummaries
    .map(c => (c.summary || []).join(' '))
    .join(' | ');

  const mergedPastConcepts = [
    ...(pastConcepts || []),
    ...chunkSummaries.flatMap(c => c.keywords || [])
  ];

  return await callGemini(analyzePrompt(mergedTranscript, mergedPastConcepts), true);
};

export const generateRoadmap = async (goal, skillLevel, time) => {
  return await callGemini(roadmapPrompt(goal, skillLevel, time));
};

export const generateRecommendations = async (goal, completedConcepts, weakAreas) => {
  return await callGemini(recommendPrompt(goal, completedConcepts, weakAreas));
};

export const generateTest = async (currentConcept, previousConcepts) => {
  return await callGemini(testPrompt(currentConcept, previousConcepts));
};
