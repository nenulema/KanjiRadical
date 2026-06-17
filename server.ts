import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import { FALLBACK_DICTIONARY } from "./src/data/fallbackDictionary";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Gemini client successfully initialized.");
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. Applications will use local heuristic breakdown.");
}

// Host health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!apiKey });
});

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Notify admin about new payment
app.post("/api/notify-admin", async (req, res) => {
  const { userId, userEmail, userName } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "nenuhokka@gmail.com",
    subject: "New Access Request - Kanji Explorer",
    html: `
      <h2>New Access Request</h2>
      <p><strong>Name:</strong> ${userName || "Unknown"}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p>The user has confirmed their payment. Please verify their transfer.</p>
      <br/>
      <a href="http://localhost:3000/?approve=${userId}" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Approve User</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Notify user about approval
app.post("/api/notify-user", async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) return res.status(400).json({ error: "Missing userEmail" });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: "Access Approved - Kanji Explorer",
    html: `
      <h2>Access Approved!</h2>
      <p>Your payment has been verified and your access to Kanji Explorer is now approved.</p>
      <br/>
      <a href="http://localhost:3000" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Go to App</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Kanji analysis API route incorporating the official @google/genai Type parameters
app.post("/api/kanji/explain", async (req, res) => {
  const { kanji, radicalName, radicalSymbol } = req.body;

  if (!kanji) {
    return res.status(400).json({ error: "Kanji character represents a required property." });
  }

  // Fallback offline dictionary for immediate responsiveness and offline resilience with double sentences
  const getOfflineFallback = (char: string) => {
    // If character is predefined in our high-quality dictionary, use it
    if (FALLBACK_DICTIONARY[char]) {
      const entry = FALLBACK_DICTIONARY[char];
      return {
        kanji: char,
        radicalSymbol: radicalSymbol || "",
        radicalName: radicalName || "Unknown",
        meanings: entry.meanings,
        readingsOn: entry.readingsOn,
        readingsKun: entry.readingsKun,
        mnemonic: entry.mnemonic,
        examples: entry.examples
      };
    }

    // Dynamic heuristic fallback with deterministic selection of 3 templates out of 6
    const templates = [
      {
        sentence: `「${char}」という漢字の書き方を教えてください。`,
        furigana: `「${char}」というかんじのかきかたをおしえてください。`,
        english: `Please teach me how to write the kanji "${char}".`,
        breakdown: [
          { word: "漢字", reading: "かんじ", meaning: "Kanji" },
          { word: "書き方", reading: "かきかた", meaning: "how to write" },
          { word: "教えて", reading: "おしえて", meaning: "teach/tell (te-form)" },
          { word: "ください", reading: "ください", meaning: "please" }
        ]
      },
      {
        sentence: `毎日、辞書で「${char}」の正しい意味を調べます。`,
        furigana: `まいにち、じしょで「${char}」のただしいいみをしらべます。`,
        english: `Every day, I look up the correct meaning of "${char}" in the dictionary.`,
        breakdown: [
          { word: "毎日", reading: "まいにち", meaning: "every day" },
          { word: "辞書", reading: "じしょ", meaning: "dictionary" },
          { word: "正しい", reading: "ただしい", meaning: "correct" },
          { word: "意味", reading: "いみ", meaning: "meaning" },
          { word: "調べます", reading: "しらべます", meaning: "to look up/investigate" }
        ]
      },
      {
        sentence: `この「${char}」という漢字は、日常会話でよく見かけます。`,
        furigana: `この「${char}」というかんじは、にちじょうかいわでよくみかけます。`,
        english: `I often come across the kanji "${char}" in daily conversations.`,
        breakdown: [
          { word: "漢字", reading: "かんじ", meaning: "Kanji" },
          { word: "日常会話", reading: "にちじょうかいわ", meaning: "daily conversation" },
          { word: "よく", reading: "よく", meaning: "often" },
          { word: "見かけます", reading: "みかけます", meaning: "to come across/spot" }
        ]
      },
      {
        sentence: `ついに「${char}」の読み書きができるようになりました！`,
        furigana: `ついに「${char}」のよみかきができるようになりました！`,
        english: `I have finally become able to read and write "${char}"!`,
        breakdown: [
          { word: "ついに", reading: "ついに", meaning: "finally" },
          { word: "読み書き", reading: "よみかき", meaning: "reading and writing" },
          { word: "できるよう", reading: "できるよう", meaning: "able to (do)" },
          { word: "なりました", reading: "なりました", meaning: "became" }
        ]
      },
      {
        sentence: `日本の街を歩くと、「${char}」の文字をよく目にします。`,
        furigana: `にほんのまちをあるくと、「${char}」のもじをよくめにします。`,
        english: `When walking through streets in Japan, you often catch sight of the character "${char}".`,
        breakdown: [
          { word: "日本", reading: "にほん", meaning: "Japan" },
          { word: "街", reading: "まち", meaning: "streets/town" },
          { word: "歩くと", reading: "あるくと", meaning: "when walking" },
          { word: "文字", reading: "もじ", meaning: "character/letter" },
          { word: "目にします", reading: "めにします", meaning: "to catch sight of/see" }
        ]
      },
      {
        sentence: `この新しいカードで「${char}」を勉強しましょう。`,
        furigana: `このあたらしいかーどで「${char}」をべんきょうしましょう。`,
        english: `Let's study "${char}" with this new card.`,
        breakdown: [
          { word: "新しい", reading: "あたらしい", meaning: "new" },
          { word: "カード", reading: "かーど", meaning: "card" },
          { word: "勉強", reading: "べんきょう", meaning: "study" },
          { word: "しましょう", reading: "しましょう", meaning: "let's do" }
        ]
      }
    ];

    // Select 3 distinct templates deterministically based on character code
    const charCode = char.charCodeAt(0);
    const selectedIndices = [
      charCode % 6,
      (charCode + 2) % 6,
      (charCode + 4) % 6
    ];

    const selectedExamples = selectedIndices.map(idx => templates[idx]);

    return {
      kanji: char,
      radicalSymbol: radicalSymbol || "",
      radicalName: radicalName || "Unknown",
      meanings: ["Learner Kanji", "Study Target"],
      readingsOn: ["-"],
      readingsKun: ["-"],
      mnemonic: `This character combines components associated with the radical ${radicalSymbol || ""} to form its shape and visual structure.`,
      examples: selectedExamples
    };
  };

  if (!aiClient) {
    console.log(`Using fallback dictionary for ${kanji} due to missing Gemini key.`);
    return res.json(getOfflineFallback(kanji));
  }

  try {
    const prompt = `Analyze the Japanese Kanji character "${kanji}" in relation to the radical "${radicalName || "its radical"}" (${radicalSymbol || ""}).
Generate comprehensive Japanese learner details, including common English meanings, Onyomi, Kunyomi readings (use standard katakana for on-yomi and hiragana for kun-yomi with periods to mark okurigana, e.g., み.る), and a highly helpful mnemonic story.

CRITICAL: Provide exactly 3 (three) distinct, highly educational example sentences. Ensure high variation in sentence structure and context:
- Sentence 1: A formal or professional declarative statement (using polite forms like ~ます or ~です).
- Sentence 2: A casual daily life question or suggestion (e.g. asking a friend, using forms like ~か, ~ませんか, or short/casual forms).
- Sentence 3: A descriptive sentence containing a compound word using the target kanji, describing a specific situation (e.g. travel, weather, emotions, or daily routines).

Avoid repetitive structures like 'I am studying X' or 'This is X'. Make sentences realistic, natural, and helpful for learners.

For each of the example sentences, provide:
1. The Japanese sentence using the kanji.
2. A complete furigana reading of that sentence in pure hiragana/katakana.
3. The English translation of the sentence.
4. A word-by-word vocabulary breakdown list for major vocabulary words in that sentence.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Japanese linguist and friendly kanji tutor. Always return clean, accurate, educational structured definitions strictly following the requested JSON schema. Do not output markdown decorators or extra wrapper text.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "kanji",
            "radicalSymbol",
            "radicalName",
            "meanings",
            "readingsOn",
            "readingsKun",
            "mnemonic",
            "examples"
          ],
          properties: {
            kanji: { type: Type.STRING, description: "The single kanji character." },
            radicalSymbol: { type: Type.STRING, description: "The radical symbol." },
            radicalName: { type: Type.STRING, description: "The English name of the radical." },
            meanings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of common English meanings."
            },
            readingsOn: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Onyomi readings in katakana."
            },
            readingsKun: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Kunyomi readings in hiragana."
            },
            mnemonic: {
              type: Type.STRING,
              description: "A friendly story linking the visual components or radical to its meaning."
            },
            examples: {
              type: Type.ARRAY,
              description: "List of exactly 3 distinct example sentences for layout variation.",
              items: {
                type: Type.OBJECT,
                required: ["sentence", "furigana", "english", "breakdown"],
                properties: {
                  sentence: { type: Type.STRING, description: "Japanese sentence using the kanji." },
                  furigana: { type: Type.STRING, description: "Hiragana/Katatana pronunciation." },
                  english: { type: Type.STRING, description: "English translation." },
                  breakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["word", "reading", "meaning"],
                      properties: {
                        word: { type: Type.STRING },
                        reading: { type: Type.STRING },
                        meaning: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const textResponse = (response.text ?? "").trim();
    const parsedData = JSON.parse(textResponse);
    return res.json(parsedData);
  } catch (error) {
    console.error("Gemini context generation error:", error);
    // Graceful fallback to maintain offline readiness
    return res.json(getOfflineFallback(kanji));
  }
});

// Configure Vite integration for unified dev/production workflows
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite middleware in Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving pre-built assets in Production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack Kanji Radical server running at http://localhost:${PORT}`);
  });
}

startServer();
