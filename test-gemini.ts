import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: "Hello, are you working?" }] }],
    });
    console.log("Success with 3.6:", response.text);
  } catch (e: any) {
    console.error("Error with gemini-3.6-flash:", e.message);
  }
}

run();
