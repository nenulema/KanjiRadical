/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables (.env)
dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON limit to handle base64 canvas snapshots safely
app.use(express.json({ limit: "10mb" }));

// -----------------------------------------------------------------------------
//  API ENDPOINTS
// -----------------------------------------------------------------------------

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Lazy-initialized Gemini Calligraphy Evaluation Tutor
app.post("/api/evaluate", async (req, res) => {
  const { kanji, hiragana, arti, imageBase64 } = req.body;

  if (!kanji || !imageBase64) {
    return res.status(400).json({ error: "Missing required params: 'kanji' or 'imageBase64'" });
  }

  // Gracefully verify the presence of the Gemini key to prevent boot-up crashes
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(500).json({
      error: "Kunci API GEMINI_API_KEY belum dikonfigurasi di Google AI Studio. Silakan konfigurasi rahasia Anda pada submenu 'Secrets' di pojok kiri bawah."
    });
  }

  try {
    // Strip metadata preamble (e.g. "data:image/png;base64,") if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Lazy instantiate GoogleGenAI client according to best-practice guidelines
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    // Prepare message payload
    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: base64Data,
      }
    };

    const promptText = `Anda adalah 'Kanji Calligraphy Tutor' virtual yang ramah dan ahli. 
Mengevaluasi hasil tulisan tangan pengguna (terbaca pada gambar) yang menulis aksara Kanji Jepang berikut: "${kanji}" (${hiragana}) yang bermakna "${arti}" dalam bahasa Indonesia.

Analisis tulisan tangan pengguna pada gambar berdasarkan aspek:
1. Kemiripan bentuk dengan Kanji asli "${kanji}".
2. Keseimbangan (balance) posisi stroke pada grid genkouyoushi.
3. Proporsi dan keanggunan goresan kuas.

Berikan skor kuantitatif (0-100) serta respon penilaian dalam bahasa Indonesia yang membina, ramah, dan mendidik.

Kembalikan respon dalam format JSON terstruktur persis dengan schema berikut:
{
  "grade": "S" | "A" | "B" | "C" | "D" | "F",   // S = sempurna, A = sangat baik, B = cukup baik, C = butuh perbaikan, D/F = ulangi
  "score": number,                             // Skor total dari 0 - 100
  "balanceScore": number,                      // Skor keseimbangan dari 0 - 100
  "proportionScore": number,                   // Skor proporsi ukuran dari 0 - 100
  "feedback": "string",                        // Ulasan umpan balik dalam Bahasa Indonesia (maksimal 3 kalimat)
  "suggestions": ["string"]                    // Minimal 2 saran konkret bahasa Indonesia untuk perbaikan goresan
}`;

    // Prompt content generation
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.STRING, description: "Grade kelayakan penulisan (S, A, B, C, D, F)" },
            score: { type: Type.INTEGER, description: "Skor akurasi visual (0-100)" },
            balanceScore: { type: Type.INTEGER, description: "Skor keseimbangan spasial (0-100)" },
            proportionScore: { type: Type.INTEGER, description: "Skor proporsi kuas menulis (0-100)" },
            feedback: { type: Type.STRING, description: "Ulasan tutor membina dalam Bahasa Indonesia (max 3 kalimat)" },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar masukan / saran koreksi konkrit dalam bahasa Indonesia"
            }
          },
          required: ["grade", "score", "balanceScore", "proportionScore", "feedback", "suggestions"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Tutor AI Gemini memberikan respon kosong.");
    }

    const evaluationResult = JSON.parse(outputText.trim());
    return res.json(evaluationResult);

  } catch (error: any) {
    console.error("Gemini model appraisal failed:", error);
    return res.status(500).json({
      error: `Gagal memproses evaluasi tulisan Kanji: ${error.message || error}`
    });
  }
});

// -----------------------------------------------------------------------------
//  VITE DEVELOPMENT / PRODUCTION MIDDLEWARE
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware at runtime for rapid hot bundle previews
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite developer middleware mode.");
  } else {
    // Production serving from compiler build outputs
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving statically compiled files in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`full-stack server booted and running at http://localhost:${PORT}`);
  });
}

startServer();
