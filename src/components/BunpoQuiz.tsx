import React, { useState, useEffect } from "react";
import { BunpoItem } from "../data/bunpo";
import { 
  Sparkles, RefreshCw, MessageSquare, BookOpenCheck, Languages, Star 
} from "lucide-react";

interface BunpoQuizProps {
  initialItem: BunpoItem | null;
  items: BunpoItem[];
  displayLanguage: "ID" | "EN";
  masteredIds: string[];
  onToggleMastery: (id: string) => void;
}

const highlightPattern = (
  text: string | undefined,
  pattern: string | undefined,
  highlightClass: string = "text-[#C2593F] font-extrabold font-serif"
) => {
  if (!text) return "";
  if (!pattern) return text;

  // Split pattern by common placeholder marks (both halfwidth and fullwidth tildes/waves, ellipses, dots, spaces, slashes)
  const partsOfPattern = pattern
    .split(/[〜～~…\s.\-、，,。\/（）()]+/g)
    .map(p => {
      if (!p) return "";
      return p
        .replace(/\(.*?\)/g, "")   // remove (latin parenthesis)
        .replace(/（.*?）/g, "")  // remove （Japanese parenthesis）
        .trim();
    })
    .filter(p => p.length > 0);

  if (partsOfPattern.length === 0) return text;

  // Sort parts by descending length so that longer ones match first
  const sortedParts = [...partsOfPattern].sort((a, b) => b.length - a.length);
  
  // Escape regex characters
  const escapedParts = sortedParts.map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
  
  // Create regex containing all parts
  const regex = new RegExp(`(${escapedParts.join("|")})`, "g");
  const segments = text.split(regex);

  if (segments.length <= 1) {
    return text;
  }

  return (
    <>
      {segments.map((segment, i) =>
        regex.test(segment) ? (
          <span key={i} className={highlightClass}>
            {segment}
          </span>
        ) : (
          segment
        )
      )}
    </>
  );
};

interface AIReportType {
  score: number;
  isCorrect: boolean;
  corrections: string;
  suggestions: string[];
  explanation: string;
}

export default function BunpoQuiz({ initialItem, items, displayLanguage, masteredIds, onToggleMastery }: BunpoQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Creative Sentence Writing state
  const [customSentence, setCustomSentence] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiReport, setAiReport] = useState<AIReportType | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync index from initialItem prop
  useEffect(() => {
    if (items && items.length > 0) {
      if (initialItem) {
        const idx = items.findIndex((t) => t.id === initialItem.id);
        if (idx !== -1) {
          setCurrentIndex(idx);
          resetStates();
        }
      }
    }
  }, [initialItem, items]);

  const currentItem = items[currentIndex];

  const resetStates = () => {
    setCustomSentence("");
    setAiReport(null);
    setAiError(null);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
    resetStates();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(items.length - 1); // loop
    }
    resetStates();
  };

  // Remote grading call
  const handleAISubmit = async () => {
    if (!currentItem || customSentence.trim() === "") return;
    setIsLoadingAI(true);
    setAiError(null);
    setAiReport(null);

    try {
      const customKey = localStorage.getItem("user_gemini_api_key") || "";
      
      const response = await fetch("/api/gemini/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grammarItem: currentItem.japanese,
          expectedPattern: currentItem.romaji,
          formula: currentItem.formula,
          promptContext: displayLanguage === "ID" ? currentItem.meaningId : currentItem.meaningEn,
          userAnswer: customSentence.trim(),
          userApiKey: customKey,
          userLanguage: displayLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(
          displayLanguage === "ID" 
            ? "Server gagal merespon grade evaluasi." 
            : "Server failed to output grading evaluation response."
        );
      }

      const report = await response.json();
      if (report && report.error) {
        throw new Error(report.error);
      }
      setAiReport(report);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong during grading.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (!currentItem) {
    return (
      <div className="text-center py-12 text-natural-text-muted font-sans uppercase tracking-widest text-sm bg-white border border-natural-border rounded-2xl">
        {displayLanguage === "ID" 
          ? "Tidak ada bank soal yang tersedia. Hubungkan file CSV Anda terlebih dahulu!" 
          : "No quiz items available. Please upload a CSV database first!"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 animate-fade-in" id="quiz-workspace">
      
      {/* Left side: Guide sheet */}
      <div className="lg:col-span-5 space-y-4 sm:space-y-6" id="practice-guide-column">
        <div className="bg-white border border-natural-border p-4 sm:p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-natural-accent font-bold mb-2 sm:mb-3">
            <BookOpenCheck className="w-5 h-5" />
            <h3 className="text-xs sm:text-sm uppercase tracking-widest">
              {displayLanguage === "ID" ? "Glosarium Panduan Soal" : "Item Study Sheet"}
            </h3>
          </div>
          
          <div id="quiz-cheat-sheet" className="divide-y divide-natural-border/60">
            
            {/* Header Specs */}
            <div className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold text-natural-text-muted font-sans tracking-wide">
                  {displayLanguage === "ID" ? "Target Pola Kalimat" : "Target Pattern"} ({currentIndex + 1} of {items.length})
                </span>
                
                <button
                  type="button"
                  onClick={() => onToggleMastery(currentItem.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${
                    masteredIds.includes(currentItem.id)
                      ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                      : "bg-white border-natural-border text-natural-text-muted hover:text-natural-text-dark hover:border-[#A8A690]"
                  }`}
                  title={masteredIds.includes(currentItem.id) ? "Selesai Dikuasai" : "Tandai Sudah Dikuasai"}
                >
                  <Star className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${masteredIds.includes(currentItem.id) ? "fill-amber-400 text-amber-500" : ""}`} />
                  <span>
                    {masteredIds.includes(currentItem.id)
                      ? (displayLanguage === "ID" ? "Dikuasai ★" : "Mastered ★")
                      : (displayLanguage === "ID" ? "Kuasai" : "Master")}
                  </span>
                </button>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-natural-text-dark mt-1 leading-none flex items-center gap-2">
                {masteredIds.includes(currentItem.id) && (
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-500 shrink-0 inline-block animate-pulse" />
                )}
                {currentItem.japanese}
              </h3>
              <p className="text-xs font-mono text-natural-accent mt-1 uppercase">
                {currentItem.romaji}
              </p>
            </div>

            {/* Meanings */}
            <div className="py-3 sm:py-4 space-y-2 sm:space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-natural-text-muted font-sans tracking-wide flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-natural-accent" />
                  {displayLanguage === "ID" ? "Arti Pola" : "Grammar Meaning"}
                </span>
                <p className="text-sm font-semibold text-natural-text-dark mt-1 font-sans">
                  {displayLanguage === "ID" ? currentItem.meaningId : currentItem.meaningEn}
                </p>
                {displayLanguage === "ID" && currentItem.meaningEn && (
                  <p className="text-xs italic text-natural-text-muted mt-0.5">
                    English: {currentItem.meaningEn}
                  </p>
                )}
                {displayLanguage === "EN" && currentItem.meaningId && (
                  <p className="text-xs italic text-natural-text-muted mt-0.5">
                    Indonesian: {currentItem.meaningId}
                  </p>
                )}
              </div>

              {currentItem.formula && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-natural-text-muted font-sans tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-natural-accent" />
                    {displayLanguage === "ID" ? "Rumus Pola (Formasi)" : "Grammar Formation"}
                  </span>
                  <p className="text-xs bg-natural-sidebar text-natural-text-dark border border-natural-border p-2.5 sm:p-3.5 rounded-xl font-mono mt-1 whitespace-pre-wrap leading-relaxed shadow-xs">
                    {currentItem.formula}
                  </p>
                </div>
              )}
            </div>

            {/* Example translation references */}
            <div className="pt-3 sm:pt-4 space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-natural-text-muted font-sans tracking-wide block">
                  {displayLanguage === "ID" ? "Contoh Kalimat (Jepang)" : "Example Sentence (Japanese)"}
                </span>
                <p className="text-base font-serif text-natural-text-dark mt-1 leading-normal">
                  {highlightPattern(currentItem.exampleJa, currentItem.japanese)}
                </p>
                {currentItem.romajiExample && (
                  <p className="text-xs text-[#8A8870] font-mono mt-0.5 leading-relaxed">
                    {highlightPattern(currentItem.romajiExample, currentItem.romaji)}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-natural-text-muted font-sans tracking-wide block">
                  {displayLanguage === "ID" ? "Terjemahan Contoh" : "Example Translation"}
                </span>
                <p className="text-xs text-[#6B695A] italic mt-0.5 font-sans leading-relaxed">
                  "{displayLanguage === "ID" ? currentItem.exampleId : currentItem.exampleEn}"
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Carousel buttons */}
        <div className="flex items-center justify-between gap-3" id="quiz-carousel-nav">
          <button
            onClick={handlePrev}
            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-natural-border hover:bg-[#F0EEE0] text-natural-text-dark rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
          >
            &larr; {displayLanguage === "ID" ? "Mundur" : "Prev"}
          </button>
          
          <button
            onClick={resetStates}
            className="p-2 sm:p-2.5 bg-white border border-natural-border hover:bg-[#F0EEE0] text-natural-text-muted hover:text-natural-text-dark rounded-xl transition-all cursor-pointer shadow-xs"
            title={displayLanguage === "ID" ? "Setel Ulang" : "Reset Canvas"}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 bg-white border border-natural-border hover:bg-[#F0EEE0] text-natural-text-dark rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
          >
            {displayLanguage === "ID" ? "Maju" : "Next"} &rarr;
          </button>
        </div>
      </div>

      {/* Right side: Practice forms workspace */}
      <div className="lg:col-span-7 space-y-4 sm:space-y-6" id="interactive-workspace-column">
        
        {/* WRITE CREATIVE SENTENCE (AI SENSEI) */}
        <div className="bg-white border border-natural-border p-4 sm:p-6 rounded-2xl shadow-xs space-y-3 sm:space-y-4" id="quiz-shell-mode-2">
          
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-natural-accent flex items-center gap-1.5">
              <span className="bg-natural-badge px-1.5 py-0.5 rounded-md text-[9px] text-natural-accent">{displayLanguage === "ID" ? "LATIHAN" : "PRACTICE"}</span>
              {displayLanguage === "ID" ? "Karang Kalimat Mandiri (Diuji AI Sensei)" : "Custom Writing (AI Sensei Evaluation)"}
            </h3>
            <p className="text-[10px] text-natural-text-muted mt-0.5 leading-relaxed">
              {displayLanguage === "ID"
                ? "Tulis kalimat bahasa Jepang kreasi Anda sendiri yang mengandung pola tata bahasa di atas! Tekan tombol Kirim di bawah untuk mendapatkan skor mendalam dan koreksi tata bahasa dari kecerdasan buatan."
                : "Compose an original Japanese sentence using the active grammar pattern above! Click submit for AI Sensei evaluation of structure, parameters, and spelling errors."}
            </p>
          </div>

          <div className="space-y-2.5 pt-1.5">
            <textarea
              rows={3}
              value={customSentence}
              onChange={(e) => setCustomSentence(e.target.value)}
              placeholder={displayLanguage === "ID" ? "Tulis kalimat kreasi Anda di sini dalam bahasa Jepang..." : "Compose your original sentence in Japanese characters/romaji here..."}
              className="w-full text-xs px-3 py-2 bg-white border border-natural-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-natural-accent text-natural-text-dark font-sans placeholder-natural-text-muted leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                onClick={handleAISubmit}
                disabled={isLoadingAI || customSentence.trim() === ""}
                className="px-5 py-2 bg-natural-accent hover:bg-natural-accent-hover disabled:bg-[#E6E4D5] disabled:text-[#A8A690] disabled:cursor-not-allowed text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                {displayLanguage === "ID" ? "Kirim ke AI Sensei" : "Submit to AI Sensei"}
              </button>
            </div>
          </div>

          {/* AI grading report */}
          <div className="flex-1 flex flex-col justify-center min-h-[220px]" id="ai-report-panel">
            {isLoadingAI ? (
              <div className="text-center py-12 text-natural-text-muted flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-natural-badge rounded-full animate-bounce">
                  <Sparkles className="w-6 h-6 text-natural-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-natural-text-dark">
                    {displayLanguage === "ID" ? "AI Sensei sedang membaca kalimat Anda..." : "AI Sensei is grading your sentence..."}
                  </p>
                  <p className="text-[10px] text-natural-text-muted font-sans mt-0.5">
                    {displayLanguage === "ID" ? "Memeriksa struktur tata bahasa, partikel, dan makna." : "Checking grammatical structures, spelling, and semantic alignment."}
                  </p>
                </div>
              </div>
            ) : aiError ? (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 font-sans">
                <p className="font-bold">{displayLanguage === "ID" ? "Sistem Mengalami Kendala:" : "System Encountered Issue:"}</p>
                <p className="mt-1">{aiError}</p>
                <p className="mt-2 text-natural-text-muted">
                  {displayLanguage === "ID" 
                    ? "Kunci API Gemini mungkin tidak dipasang. Aplikasi akan menyesuaikan dengan modus simulasi lokal." 
                    : "Gemini server credentials might be not set. App will fallback automatically to simulated results."}
                </p>
              </div>
            ) : aiReport ? (
              <div className="bg-white border-2 border-natural-border p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 text-natural-text-dark animate-fade-in" id="ai-grade-sheet">
                
                {/* Score & Status */}
                <div className="flex items-center justify-between border-b border-natural-border pb-3">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-natural-accent tracking-widest font-sans">
                      {displayLanguage === "ID" ? "HASIL EVALUASI SENSEI" : "SENSEI EVALUATION RESULTS"}
                    </h4>
                    <span className="text-[10px] text-natural-text-muted font-sans font-medium">
                      {displayLanguage === "ID" ? "Metode Penilaian: N3 Grammar Analyzer" : "Evaluation Method: N3 Grammatic Analyzer"}
                    </span>
                  </div>
                  
                  {/* Score circle badge */}
                  <div className="text-right flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-natural-text-muted">
                      {displayLanguage === "ID" ? "Skor:" : "Score:"}
                    </span>
                    <div className="w-14 h-14 rounded-full border-2 border-natural-accent bg-natural-bg/50 flex items-center justify-center font-bold text-lg text-natural-text-dark shadow-xs font-mono">
                      {aiReport.score}
                    </div>
                  </div>
                </div>

                {/* Corrections & Suggestions */}
                <div className="space-y-3 text-xs leading-relaxed font-sans text-left">
                  <div>
                    <span className="text-[#6B695A] font-bold block uppercase text-[10px] tracking-wider">
                      {displayLanguage === "ID" ? "Ulasan Koreksi:" : "Corrections and Edits:"}
                    </span>
                    <p className="text-natural-text-dark mt-1 font-serif text-sm">{aiReport.corrections}</p>
                  </div>

                  <div>
                    <span className="text-[#6B695A] font-bold block uppercase text-[10px] tracking-wider">
                      {displayLanguage === "ID" ? "Rekomendasi Perbaikan:" : "Actionable Suggestions:"}
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-natural-text-dark mt-1">
                      {aiReport.suggestions.map((sug, i) => (
                        <li key={i} className="font-serif">{sug}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-natural-border">
                    <span className="text-natural-accent font-bold block uppercase text-[10px] tracking-wider">
                      {displayLanguage === "ID" ? "Penjelasan Tata Bahasa:" : "Grammatical Explanation:"}
                    </span>
                    <p className="text-[#6B695A] mt-1 text-xs leading-relaxed italic">
                      "{aiReport.explanation}"
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#FDFCF0] border-2 border-dashed border-[#E6E4D5] rounded-2xl p-6 flex flex-col items-center justify-center text-center text-natural-text-muted min-h-[220px]">
                <MessageSquare className="w-10 h-10 text-natural-accent mb-2" />
                <p className="text-xs uppercase font-bold tracking-widest text-natural-text-dark">
                  {displayLanguage === "ID" ? "Belum ada penilaian kalimat kreatif." : "No custom sentence graded."}
                </p>
                <p className="text-[10px] max-w-[280px] mt-1 text-natural-text-muted">
                  {displayLanguage === "ID" 
                    ? "Ketik kalimat unik bahasa Jepang Anda di kolom atas untuk dianalisis oleh kecerdasan buatan." 
                    : "Type your custom Japanese sentence above and submit it to receive deep conversational AI teacher grading."}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
