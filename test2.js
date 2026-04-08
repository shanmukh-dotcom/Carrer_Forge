import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const callGemini = async (modelName) => {
  try {
     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
     const response = await ai.models.generateContent({
        model: modelName,
        contents: "Say hello",
     });
     console.log(`Model ${modelName} SUCCESS:`, response.text);
  } catch (e) {
     console.log(`Model ${modelName} FAILED:`, e.message);
  }
};

const runAll = async () => {
    console.log("Testing API Key...");
    await callGemini('gemini-2.0-flash');
    await callGemini('gemini-1.5-flash');
    await callGemini('gemini-1.5-pro');
};

runAll();
