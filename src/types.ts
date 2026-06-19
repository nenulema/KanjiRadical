export interface RadicalInfo {
  id: string; // unique slug like "water"
  name: string; // name in English
  symbol: string; // e.g. "水"
  variants: string[]; // e.g. ["氵", "氺"]
  kanjiList: string[]; // list of characters
  meaning: string;
  description: string;
}

export interface ExampleSentence {
  sentence: string;
  furigana: string;
  english: string;
  breakdown: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
}

export interface KanjiDetail {
  kanji: string;
  radicalSymbol: string;
  radicalName: string;
  meanings: string[];
  readingsOn: string[];
  readingsKun: string[];
  mnemonic: string;
  examples: ExampleSentence[];
  strokeCount?: number;
  grade?: string;
  frequency?: string;
}

export interface UserProgress {
  learnedKanji: string[]; // List of learned kanji characters
  bookmarkedKanji: string[]; // List of bookmarked kanji characters
  quizStats: {
    totalTaken: number;
    correctAnswers: number;
    streak: number;
  };
  accessStatus?: "pending_payment" | "pending_approval" | "approved";
  email?: string | null;
  displayName?: string | null;
  requestDate?: string;
  kotobaFavorites?: number[];
  kotobaProgressMap?: Record<number, "unlearned" | "learning" | "mastered">;
}

export interface QuizQuestion {
  id: string;
  kanji: string;
  type: "meaning" | "reading" | "radical" | "context";
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
