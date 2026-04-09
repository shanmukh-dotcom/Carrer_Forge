import { GoogleGenAI } from '@google/genai';
import { analyzePrompt, roadmapPrompt, recommendPrompt, testPrompt } from '../utils/prompts.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize dynamically per request to ensure fresh .env keys are used

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
  dotenv.config({ override: true }); // Force read latest .env immediately
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('AI not configured. Add GEMINI_API_KEY to .env');
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Forcing gemini-2.5-flash for ALL tasks because free-tier limits on Pro are causing exact 429 Quota Exceeded errors
  const model = 'gemini-2.5-flash';

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

export const processTranscript = async (transcript, pastConcepts, topic, goal) => {
  console.log(`[AI] Transcript length: ${transcript.length} chars`);

  const CHUNK_LIMIT = 18000; // ~4500 words — safe for a single deep analysis call

  if (transcript.length <= CHUNK_LIMIT) {
    // Short video — send full transcript in one shot with Pro model
    return await callGemini(analyzePrompt(transcript, pastConcepts, topic, goal), true);
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
    const result = await callGemini(analyzePrompt(chunk, [], topic, goal), false);
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

  return await callGemini(analyzePrompt(mergedTranscript, mergedPastConcepts, topic, goal), true);
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
