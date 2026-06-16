import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Volume2,
  Trash2,
  Bookmark,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { KanjiDetail, RadicalInfo, UserProgress } from "../types";

interface KanjiDetailsModalProps {
  kanji: string;
  radical: RadicalInfo;
  onClose: () => void;
  progress: UserProgress;
  onToggleLearned: (kanji: string) => void;
  onToggleBookmark: (kanji: string) => void;
  onNavigate?: (kanji: string) => void;
}

export default function KanjiDetailsModal({
  kanji,
  radical,
  onClose,
  progress,
  onToggleLearned,
  onToggleBookmark,
  onNavigate,
}: KanjiDetailsModalProps) {
  const [detail, setDetail] = useState<KanjiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"card" | "canvas">("card");
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState(0);

  // Handwriting Canvas references & state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const isLearned = progress.learnedKanji.includes(kanji);
  const isBookmarked = progress.bookmarkedKanji.includes(kanji);

  const currentIndex = radical.kanjiList.indexOf(kanji);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < radical.kanjiList.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigate) onNavigate(radical.kanjiList[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext && onNavigate) onNavigate(radical.kanjiList[currentIndex + 1]);
  };

  // Fetch detailed kanji explanation from full-stack server backend
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setDetail(null);

    fetch("/api/kanji/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kanji,
        radicalName: radical.name,
        radicalSymbol: radical.symbol,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load details");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading kanji data:", err);
        if (active) {
          setError("Network connection issue. Displaying offline overview.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [kanji, radical]);

  // Text to speech playback using standard browser Web Speech API
  const handleSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("TTS audio is not supported in this browser environment.");
      return;
    }
    window.speechSynthesis.cancel(); // cancel any active speaking

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85; // slower speed for comfortable learner comprehension

    // Retrieve native Japanese speaking voice from browser roster if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith("ja") || v.lang === "ja-JP");
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Canvas drawing handlers
  useEffect(() => {
    if (activeTab === "canvas" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#a5b4fc"; // soft indigo
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 10;
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Modal Toolbar Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
              Study Deck
            </span>
            <span className="text-slate-700 text-xs">•</span>
            <span className="text-xs bg-sky-950 text-sky-400 font-semibold px-2 py-0.5 rounded-full">
              Radical: {radical.symbol}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Navigation buttons */}
            <div className="flex items-center bg-slate-800/50 border border-slate-750 rounded-xl mr-2">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`p-2 rounded-l-xl transition-all ${
                  hasPrev ? "text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer" : "text-slate-600 cursor-not-allowed opacity-50"
                }`}
                title="Previous Kanji"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700"></div>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`p-2 rounded-r-xl transition-all ${
                  hasNext ? "text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer" : "text-slate-600 cursor-not-allowed opacity-50"
                }`}
                title="Next Kanji"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick bookmark toggle */}
            <button
              onClick={() => onToggleBookmark(kanji)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isBookmarked
                  ? "bg-amber-950/30 border-amber-500/50 text-amber-400"
                  : "bg-slate-800/50 border-slate-750 text-slate-400 hover:text-slate-100"
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>

            {/* Quick learned status toggle */}
            <button
              onClick={() => onToggleLearned(kanji)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLearned
                  ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-800/50 border-slate-750 text-slate-400 hover:text-slate-100"
              }`}
              title={isLearned ? "Mark as Unlearned" : "Mark as Learned"}
            >
              <CheckCircle className={`w-4 h-4 ${isLearned ? "fill-current" : ""}`} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/50 border border-slate-750 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading / Error Overlays */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
            <p className="text-sm font-medium text-slate-250">Generating AI Context Sentence and Mnemonic...</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              Gemini is building customized contextual sentences, readings, and word breakdowns for &ldquo;{kanji}&rdquo;...
            </p>
          </div>
        ) : error && !detail ? (
          <div className="p-12 text-center text-slate-400">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-red-400 font-semibold">{error}</p>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-slate-800 text-xs font-semibold rounded-lg text-white"
            >
              Back to Radical Grid
            </button>
          </div>
        ) : (
          /* Actual Interactive Content Panel */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Split layout: Large Display block & basic specifications */}
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
              {/* Display card container */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center w-full sm:w-44 shrink-0 shadow-inner relative group">
                <span className="text-7xl font-extrabold text-white text-center select-all font-sans">
                  {kanji}
                </span>

                <button
                  onClick={() => handleSpeak(kanji)}
                  className="mt-4 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-medium cursor-pointer transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  Pronounce
                </button>
              </div>

              {/* Meanings & Readings summary */}
              <div className="flex-1 space-y-4">
                {/* Meanings list */}
                <div>
                  <h4 className="text-slate-500 text-[10px] uppercase tracking-wider font-mono font-bold mb-1">
                    Meanings
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detail?.meanings.map((meaning, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-lg"
                      >
                        {meaning}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Readings Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Onyomi */}
                  <div className="bg-slate-850 border border-slate-800 p-3 rounded-xl">
                    <span className="text-slate-500 text-[10px] uppercase font-mono block mb-1">
                      Onyomi (Chinese)
                    </span>
                    <span className="text-sm font-semibold text-white tracking-wide">
                      {detail?.readingsOn && detail.readingsOn.length > 0
                        ? detail.readingsOn.join(", ")
                        : "None"}
                    </span>
                  </div>

                  {/* Kunyomi */}
                  <div className="bg-slate-850 border border-slate-800 p-3 rounded-xl">
                    <span className="text-slate-500 text-[10px] uppercase font-mono block mb-1">
                      Kunyomi (Japanese)
                    </span>
                    <span className="text-sm font-semibold text-sky-305 tracking-wide">
                      {detail?.readingsKun && detail.readingsKun.length > 0
                        ? detail.readingsKun.join(", ")
                        : "None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector: Tabs between Information Deck & Handwriting Slate */}
            <div className="border-b border-slate-800 flex space-x-4">
              <button
                onClick={() => setActiveTab("card")}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "card"
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-550 hover:text-slate-300"
                }`}
              >
                Study Card
              </button>
              <button
                onClick={() => setActiveTab("canvas")}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "canvas"
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-550 hover:text-slate-300"
                }`}
              >
                Handwriting Practice Pad
              </button>
            </div>

            {/* TAB CONTENT: STUDY CARD (Mnemonics, Sentence, breakdown) */}
            {activeTab === "card" && (
              <div className="space-y-6">
                {/* Visual Mnemonic Story */}
                <div className="bg-slate-850/60 p-4 border border-slate-805 rounded-2xl relative">
                  <div className="absolute top-4 right-4 bg-amber-400/10 p-1.5 rounded-lg border border-amber-450/20">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-slate-450 text-[10px] uppercase font-mono font-bold mb-2">
                    Mnemonic Link (Radical visual hook)
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed pr-6">
                    {detail?.mnemonic}
                  </p>
                </div>

                {/* Example sentences list with selector */}
                <div className="bg-indigo-950/20 border border-indigo-900/40 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-3">
                    <div className="space-y-1">
                      <h4 className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                        Context Memorization Sentences (Sentence Variation)
                      </h4>
                      <div className="flex items-center space-x-1">
                        {(detail?.examples || []).map((_, eIdx) => (
                          <button
                            key={eIdx}
                            onClick={() => setSelectedSentenceIdx(eIdx)}
                            className={`px-3 py-1 text-[10px] rounded-lg border font-medium cursor-pointer transition-all ${
                              selectedSentenceIdx === eIdx
                                ? "bg-indigo-600 border-indigo-500 text-white font-bold"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Sentence {eIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Furigana recall toggle */}
                      <button
                        onClick={() => setShowFurigana(!showFurigana)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-850 border border-slate-750 px-2.5 py-1 rounded-lg cursor-pointer"
                        title={showFurigana ? "Hide Furigana labels" : "Show Furigana labels"}
                      >
                        {showFurigana ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showFurigana ? "Hide Furigana" : "Reveal Furigana"}
                      </button>

                      {detail?.examples?.[selectedSentenceIdx] && (
                        <button
                          onClick={() => handleSpeak(detail.examples[selectedSentenceIdx].sentence)}
                          className="text-indigo-400 hover:text-indigo-305 p-1 rounded hover:bg-slate-850 cursor-pointer"
                          title="Vocal pronunciation support"
                        >
                          <Volume2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {detail?.examples?.[selectedSentenceIdx] ? (
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        {/* The Japanese text block */}
                        {showFurigana ? (
                          <p className="text-lg font-semibold text-slate-300 font-mono leading-relaxed tracking-wider">
                            {detail.examples[selectedSentenceIdx].furigana}
                          </p>
                        ) : (
                          <p className="text-xl font-bold text-white font-sans leading-relaxed tracking-wider">
                            {detail.examples[selectedSentenceIdx].sentence}
                          </p>
                        )}

                        {/* Translation */}
                        <p className="text-xs text-slate-405 italic mt-3 pr-4 border-l-2 border-indigo-500/30 pl-4 py-0.5 text-left">
                          &ldquo;{detail.examples[selectedSentenceIdx].english}&rdquo;
                        </p>
                      </div>

                      {/* Vocabulary Word Breakdown list for active sentence */}
                      {detail.examples[selectedSentenceIdx].breakdown && detail.examples[selectedSentenceIdx].breakdown.length > 0 && (
                        <div className="border-t border-indigo-900/30 pt-3">
                          <span className="block text-[9px] text-slate-500 uppercase font-mono mb-2">
                            Sentence {selectedSentenceIdx + 1} word-by-word breakdown
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {detail.examples[selectedSentenceIdx].breakdown.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-900/60 p-2 rounded-lg border border-slate-805 flex items-baseline justify-between"
                              >
                                <span className="font-semibold text-white select-all">
                                  {item.word} <span className="text-[10px] text-slate-500">({item.reading})</span>
                                </span>
                                <span className="text-slate-400 text-[10px] text-right truncate max-w-40">
                                  {item.meaning}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No sentences generated.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HANDWRITING DRAWING SLATE */}
            {activeTab === "canvas" && (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-xs text-slate-400 text-center w-full max-w-md leading-relaxed">
                  Engage tactile muscle memory. Use your mouse, touch, or trackpad to trace strokes for{" "}
                  <span className="text-white font-bold text-sm bg-slate-800 px-1.5 py-0.5 rounded font-sans">{kanji}</span>{" "}
                  on the tablet below:
                </p>

                <div className="relative border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center w-80 h-80">
                  {/* Canvas Grid Guidelines */}
                  <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-800/60 pointer-events-none"></div>
                  <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-800/60 pointer-events-none"></div>

                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="absolute cursor-crosshair cursor-pen z-10"
                  />

                  {/* Semi-transparent phantom backdrop of the character to help users trace! */}
                  <span className="absolute text-[210px] font-extrabold text-slate-800/15 pointer-events-none select-none font-sans">
                    {kanji}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    Reset canvas
                  </button>

                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all uppercase tracking-wider"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Finish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
