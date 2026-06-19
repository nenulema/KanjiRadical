import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazily or with check to prevent startup crash
let aiClient: GoogleGenAI | null = null;

function getAiClient(userApiKey?: string) {
  // If the user provided their own key, create a fresh client instance
  if (userApiKey && userApiKey.trim() !== "") {
    return new GoogleGenAI({
      apiKey: userApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Otherwise, fallback to the system key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WAKTU PERINGATAN: GEMINI_API_KEY belum dikonfigurasi di Settings > Secrets.");
    return null;
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API for grading grammar/sentence answers
app.post("/api/gemini/grade", async (req, res) => {
  try {
    const { 
      grammarItem, 
      expectedPattern, 
      formula, 
      promptContext, 
      userAnswer, 
      userApiKey, 
      userLanguage 
    } = req.body;

    if (!userAnswer || userAnswer.trim() === "") {
      return res.status(400).json({ error: "Kolom jawaban kosong." });
    }

    const isEn = userLanguage === "EN";
    const ai = getAiClient(userApiKey);

    if (!ai) {
      // Return a simulated, friendly evaluation if the key is not set
      // to keep the app highly functional even without API Keys
      const isPartlyCorrect = userAnswer.includes(expectedPattern) || userAnswer.includes(grammarItem);
      
      if (isEn) {
        return res.json({
          score: isPartlyCorrect ? 85 : 40,
          isCorrect: isPartlyCorrect,
          corrections: isPartlyCorrect 
            ? "Very good! You have successfully included the expected grammar pattern in your sentence. (Note: Gemini API key is not connected, this outcome is simulated offline)."
            : "The sentence structure might need checking. Please verify you wrote the expected pattern. (Note: Gemini API key is not connected, this outcome is simulated offline).",
          suggestions: [
            `Make sure to conjugate '${expectedPattern || grammarItem}' as: ${formula}`,
            "Apply particles that align with the grammar requirements."
          ],
          explanation: "Since no API Key is active, we performed a local keyphrase check. Provide a Gemini API Key in the Settings panel for authentic conversational evaluations!"
        });
      } else {
        return res.json({
          score: isPartlyCorrect ? 85 : 40,
          isCorrect: isPartlyCorrect,
          corrections: isPartlyCorrect 
            ? "Sangat baik! Anda telah memasukkan pola kalimat yang tepat. (Catatan: Kunci API Gemini belum dipasang, penilaian ini disimulasikan secara lokal)."
            : "Jawaban Anda kurang tepat. Pastikan Anda menyertakan pola kalimat yang diminta. (Catatan: Kunci API Gemini belum dipasang, penilaian ini disimulasikan secara lokal).",
          suggestions: [
            `Pastikan pola '${expectedPattern || grammarItem}' terstruktur sebagai: ${formula}`,
            "Gunakan penanda partikel yang sesuai dengan rumus pola kalimat N3 tersebut."
          ],
          explanation: "Karena Kunci API belum tersambung, kami memeriksa keberadaan kata kunci pola kalimat secara lokal. Ketika Anda memasukkan kredensial kustom atau server, AI akan menilai tata bahasa Anda secara mendalam."
        });
      }
    }

    const systemInstruction = isEn
      ? "You are an expert Japanese Language Teacher named 'Sensei AI'. " +
        "Your task is to evaluate and grade Japanese sentences written by students for a JLPT N3 grammar pattern. " +
        "Analyze the grammar, check if it aligns with the expected formula and pattern, " +
        "and provide construction corrections and suggestions/alternatives in English."
      : "Anda adalah seorang Sensei bahasa Jepang yang ahli dan ramah bernama 'Sensei AI'. " +
        "Tugas Anda adalah menilai kalimat atau jawaban bahasa Jepang yang ditulis oleh siswa Indonesia untuk pola tata bahasa JLPT N3. " +
        "Analisis tata bahasanya, periksa keselarasan dengan rumus, periksa keberadaan pola kalimat yang diharapkan, " +
        "dan berikan rekomendasi perbaikan dalam bahasa Indonesia yang membangkitkan semangat.";

    const promptMessage = isEn
      ? `Student is studying the following N3 grammar structure:\n` +
        `- Pattern: ${grammarItem} (${expectedPattern})\n` +
        `- Formula: ${formula}\n` +
        `- Context/Meaning: ${promptContext}\n\n` +
        `Student Answer: "${userAnswer}"\n\n` +
        `Give structured feedback as JSON with:\n` +
        `1. score (integer 0-100)\n` +
        `2. isCorrect (boolean, whether the answer grammatically correct and uses the pattern appropriately)\n` +
        `3. corrections (corrections/review of particles, kanji, verb conjugations in English)\n` +
        `4. suggestions (array of string, max 3 constructive tips/alternatives in English)\n` +
        `5. explanation (detailed, deep explanation of the grammar usage and context in English)`
      : `Siswa sedang mempelajari tata bahasa N3 berikut:\n` +
        `- Pola: ${grammarItem} (${expectedPattern})\n` +
        `- Rumus/Formula: ${formula}\n` +
        `- Deskripsi pola: ${promptContext}\n\n` +
        `Jawaban Siswa: "${userAnswer}"\n\n` +
        `Lakukan penilaian dalam format JSON terstruktur yang berisi:\n` +
        `1. score (skor integer dari 0 sampai 100)\n` +
        `2. isCorrect (boolean, apakah jawaban secara mendasar benar dan menggunakan pola tersebut dengan tepat)\n` +
        `3. corrections (teks ulasan jika ada kesalahan ejaan, salah partikel, atau bentuk kata kerja yang keliru dalam bahasa Indonesia)\n` +
        `4. suggestions (array of string berisi maksimal 3 rekomendasi perbaikan atau contoh alternatif yang benar dalam bahasa Indonesia)\n` +
        `5. explanation (penjelasan mendalam dalam bahasa Indonesia tentang mengapa jawaban tersebut benar atau di mana letak kekeliruannya)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Numeric score 0 to 100" },
            isCorrect: { type: Type.BOOLEAN, description: "True if sentence matches the N3 grammar correctly" },
            corrections: { type: Type.STRING, description: "Grammatical correction and particle checks" },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Suggestions and alternatives"
            },
            explanation: { type: Type.STRING, description: "Detailed explanation of the sentence mechanics" }
          },
          required: ["score", "isCorrect", "corrections", "suggestions", "explanation"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const parsedData = JSON.parse(resultText);
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Kesalahan saat memanggil Gemini API:", error);
    return res.status(500).json({
      error: "Gagal memproses penilaian kalimat dengan AI.",
      details: error.message
    });
  }
});

// Setup dev server with Vite middleware OR serve static files in production
async function main() {
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
    console.log(`Server N3 Bunpo Learner berjalan di http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Gagal memulai server:", err);
});
