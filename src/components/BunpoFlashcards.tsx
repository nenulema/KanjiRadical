import React, { useState, useEffect } from "react";
import { BunpoItem } from "../data/bunpo";
import { Sparkles, HelpCircle, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

interface BunpoFlashcardsProps {
  items: BunpoItem[];
  displayLanguage: "ID" | "EN";
}

const highlightPattern = (
  text: string | undefined,
  pattern: string | undefined,
  highlightClass: string = "text-[#C2593F] font-extrabold font-serif inline-block"
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

export default function BunpoFlashcards({ items, displayLanguage }: BunpoFlashcardsProps) {
  const [cards, setCards] = useState<BunpoItem[]>(items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Synchronize with external changes to items library
  useEffect(() => {
    setCards(items);
    setCurrentIndex(0);
    setFlipped(false);
  }, [items]);

  const currentCard: BunpoItem | undefined = cards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
    }, 150);
  };

  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
    }, 150);
  };

  const handleShuffle = () => {
    setFlipped(false);
    setTimeout(() => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
    }, 150);
  };

  if (!currentCard) {
    return (
      <div className="text-center py-12 text-natural-text-muted font-sans uppercase tracking-widest text-sm">
        {displayLanguage === "ID" ? "Memuat kartu hafalan..." : "Loading flashcards..."}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6" id="flashcard-panel">
      <div className="text-center">
        <h3 className="font-serif font-semibold text-xl sm:text-2xl text-natural-text-dark">
          {displayLanguage === "ID" ? "Mnemonic Flashcards (Kartu Hafalan)" : "Mnemonic Flashcards"}
        </h3>
        <p className="text-xs text-natural-text-muted font-sans mt-0.5">
          {displayLanguage === "ID"
            ? "Uji hafalan pola kalimat Anda secara cepat. Ketuk kartu untuk membalik."
            : "Review grammar patterns instantly. Tap the card to flip and reveal definitions."}
        </p>
      </div>

      {/* Card container */}
      <div 
        onClick={() => setFlipped(!flipped)}
        id="interactive-flashcard"
        className={`w-full min-h-[260px] sm:min-h-[300px] cursor-pointer relative transition-all duration-300 rounded-2xl sm:rounded-[32px] border ${
          flipped 
            ? "border-[#E6E4D5] bg-[#FDFCF0]/80 shadow-md text-natural-text-dark"
            : "border-natural-border bg-white text-natural-text-dark hover:border-natural-accent hover:shadow-md"
        } p-4 sm:p-8 flex flex-col justify-between select-none`}
      >
        {/* Top clue indicator */}
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest shrink-0">
          <span className={flipped ? "text-natural-accent" : "text-natural-text-muted"}>
            {flipped 
              ? (displayLanguage === "ID" ? "Jawaban & Rumus" : "Answer & Formula") 
              : (displayLanguage === "ID" ? "Sisi Depan - Tebak Arti" : "Front Side - Guess Meaning")}
          </span>
          <span className="text-natural-text-muted">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        {/* Content body */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          {!flipped ? (
            <div className="space-y-3">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-natural-text-dark block tracking-tight leading-relaxed">
                {currentCard.japanese}
              </span>
              <span className="bg-natural-badge text-natural-accent text-[10px] font-bold uppercase rounded-full tracking-wider border border-natural-border px-3 py-1">
                {currentCard.romaji}
              </span>
            </div>
          ) : (
            <div className="space-y-4 w-full max-w-sm">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-natural-text-muted font-sans">
                  {displayLanguage === "ID" ? "Arti / Terjemahan" : "Meaning / Translation"}
                </span>
                <p className="text-lg font-serif font-bold text-natural-text-dark mt-0.5 leading-snug">
                  {displayLanguage === "ID" ? currentCard.meaningId : currentCard.meaningEn}
                </p>
                {displayLanguage === "ID" && currentCard.meaningEn && (
                  <p className="text-xs text-natural-text-muted italic block mt-0.5">
                    English: {currentCard.meaningEn}
                  </p>
                )}
                {displayLanguage === "EN" && currentCard.meaningId && (
                  <p className="text-xs text-natural-text-muted italic block mt-0.5">
                    Indonesian: {currentCard.meaningId}
                  </p>
                )}
              </div>

              {/* Highlighted Example Sentence */}
              {currentCard.exampleJa && (
                <div className="border-t border-natural-border/60 pt-2 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-natural-text-muted font-sans block text-center mb-1">
                    {displayLanguage === "ID" ? "Contoh Kalimat" : "Example Sentence"}
                  </span>
                  <div className="bg-[#FAFAF9]/50 p-2.5 rounded-xl border border-natural-border/40 text-center">
                    <p className="text-sm font-serif text-natural-text-dark leading-snug">
                      {highlightPattern(currentCard.exampleJa, currentCard.japanese)}
                    </p>
                    {currentCard.romajiExample && (
                      <p className="text-[10px] text-[#8A8870] font-mono mt-0.5 leading-tight">
                        {highlightPattern(currentCard.romajiExample, currentCard.romaji)}
                      </p>
                    )}
                    <p className="text-[10px] text-[#6B695A] italic mt-1 font-sans">
                      "{displayLanguage === "ID" ? currentCard.exampleId : currentCard.exampleEn}"
                    </p>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-natural-text-muted font-sans font-medium">
                  {displayLanguage === "ID" ? "Rumus Utama (Formula)" : "Grammar Formula"}
                </span>
                <p className="text-xs font-mono bg-white border border-natural-border p-2.5 rounded-xl text-natural-accent mt-0.5 leading-relaxed whitespace-pre-wrap shadow-xs">
                  {currentCard.formula || "-"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Interactive hints */}
        <div className="text-center text-[10px] text-natural-text-muted uppercase tracking-widest font-bold">
          {displayLanguage === "ID" ? "Klik di mana saja untuk membalik" : "Click anywhere to flip card"}
        </div>
      </div>

      {/* Controller Buttons */}
      <div className="flex items-center justify-between gap-4 max-w-sm mx-auto" id="flashcard-controllers">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="px-4 py-2 bg-white border border-natural-border rounded-full text-natural-text-muted hover:bg-[#F0EEE0] hover:text-natural-text-dark transition-all cursor-pointer shadow-xs"
          title={displayLanguage === "ID" ? "Kartu Sebelumnya" : "Previous Card"}
        >
          <ArrowLeft className="w-4 h-4 inline" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleShuffle(); }}
          className="px-6 py-2 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-md transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" /> 
          {displayLanguage === "ID" ? "Acak Kartu" : "Shuffle Cards"}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="px-4 py-2 bg-white border border-natural-border rounded-full text-natural-text-muted hover:bg-[#F0EEE0] hover:text-natural-text-dark transition-all cursor-pointer shadow-xs"
          title={displayLanguage === "ID" ? "Kartu Berikutnya" : "Next Card"}
        >
          <ArrowRight className="w-4 h-4 inline" />
        </button>
      </div>

    </div>
  );
}
