import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { chromium } from "playwright";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/generate-reel", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const primaryKey = process.env.GEMINI_API_KEY;
  const backupKey = process.env.GEMINI_API_KEY_BACKUP;

  if (!primaryKey && !backupKey) {
    return res.status(500).json({ error: "API key is missing" });
  }

  const keys = [primaryKey, backupKey].filter(Boolean) as string[];
  let result = null;
  let lastError = null;

  for (const key of keys) {
    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Step 1: Perform the search
      const searchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Search for real, accurate, and up-to-date facts about the topic: "${query}". Summarize the most important facts, events, and key findings clearly.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const searchFacts = searchResponse.text;

      if (!searchFacts) {
        throw new Error("Failed to retrieve search facts");
      }

      // Step 2: Generate JSON based on the search facts
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate an engaging script for a short video reel about: "${query}". 
        Use the following real facts and up-to-date information:
        
        ${searchFacts}

        Rewrite this into a punchy, engaging script suitable for a TikTok, Reels, or YouTube Shorts format.
        Break it down into segments. For each segment, provide the exact text to speak (narration), and a description for the B-roll (stock footage) visual.
        Keep it factual based on the provided search results.
        Include a list of the key facts you used.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A catchy title for the video reel",
              },
              facts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of real facts retrieved from the search",
              },
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    narration: {
                      type: Type.STRING,
                      description: "The text that will be spoken in the video",
                    },
                    b_roll_visual: {
                      type: Type.STRING,
                      description: "A visual description of the stock footage or image to display during this segment (e.g. 'Close up of a bustling stock exchange floor', 'A person running in a park')",
                    },
                    b_roll_keyword: {
                      type: Type.STRING,
                      description: "A short 1-3 word keyword for the visual to use as an image search query",
                    }
                  },
                  required: ["narration", "b_roll_visual", "b_roll_keyword"],
                },
              },
            },
            required: ["title", "facts", "segments"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text returned from Gemini");
      }

      result = JSON.parse(text);
      break; // Successfully generated, break the retry loop
    } catch (error: any) {
      console.warn(`API call failed with one of the keys. Error: ${error.message}`);
      lastError = error;
    }
  }

  if (!result) {
    console.error("Error generating reel after trying all keys:", lastError);
    return res.status(500).json({ error: lastError?.message || "Failed to generate reel" });
  }

  res.json(result);
});

app.get("/api/search-image", async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    // DuckDuckGo Image Search implementation (fast, no headless browser needed)
    const ddgRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const text = await ddgRes.text();
    const vqdMatch = text.match(/vqd="([^"]+)"/) || text.match(/vqd=([\w-]+)/);
    const vqd = vqdMatch ? vqdMatch[1] : null;

    if (vqd) {
      const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const imgData = await imgRes.json();
      
      if (imgData && imgData.results && imgData.results.length > 0) {
        // Return the first valid image URL
        const foundUrl = imgData.results[0].image;
        return res.json({ url: foundUrl });
      }
    }
    
    return res.status(404).json({ error: "No image found" });
  } catch (error) {
    console.error("Error searching image:", error);
    res.status(500).json({ error: "Error searching image" });
  }
});

app.get("/api/download-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  const filename = (req.query.filename as string) || "download.jpg";

  if (!imageUrl) {
    return res.status(400).send("URL is required");
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading image:", error);
    res.status(500).send("Error downloading image");
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
