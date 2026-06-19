import React, { useState, useEffect } from "react";
import { BunpoItem } from "../data/bunpo";
import { Search, ExternalLink, BookOpen, Sparkles, Languages, CheckCircle2, ArrowRight, Star } from "lucide-react";

interface BunpoListProps {
  onSelectPractice: (item: BunpoItem) => void;
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

export default function BunpoList({ onSelectPractice, items, displayLanguage, masteredIds, onToggleMastery }: BunpoListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<BunpoItem | null>(null);

  // Automatically select the first element or synchronize with item changes
  useEffect(() => {
    if (items && items.length > 0) {
      setSelectedItem(items[0]);
    } else {
      setSelectedItem(null);
    }
  }, [items]);

  const filteredData = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    return (
      (item.japanese && item.japanese.toLowerCase().includes(query)) ||
      (item.romaji && item.romaji.toLowerCase().includes(query)) ||
      (item.meaningId && item.meaningId.toLowerCase().includes(query)) ||
      (item.meaningEn && item.meaningEn.toLowerCase().includes(query)) ||
      (item.formula && item.formula.toLowerCase().includes(query))
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6" id="bunpo-list-container">
      {/* Sidebar List */}
      <div className="lg:col-span-5 bg-natural-sidebar border border-natural-border rounded-2xl shadow-xs p-3 sm:p-5 flex flex-col h-[350px] lg:h-[650px]" id="sidebar-panel">
        <h3 className="text-[10px] font-bold text-natural-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-natural-accent" />
          {displayLanguage === "ID" ? "Katalog Pola Kalimat N3" : "N3 Grammar Catalog"} ({filteredData.length})
        </h3>

        {/* Search input field */}
        <div className="relative mb-3" id="search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={displayLanguage === "ID" ? "Cari pola, arti, romaji..." : "Search patterns, meanings, romaji..."}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-natural-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-natural-accent text-natural-text-dark font-sans placeholder-natural-text-muted"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-natural-text-muted" />
        </div>

        {/* Compact Mastery Progress stats */}
        <div className="flex items-center justify-between text-[10px] font-mono text-natural-text-muted mb-3 bg-[#FDFCF0] border border-natural-border/60 px-3 py-2 rounded-xl">
          <span>{displayLanguage === "ID" ? "TOTAL POLA:" : "TOTAL LESSONS:"} <strong className="text-natural-text-dark font-bold font-sans">{items.length}</strong></span>
          <span className="flex items-center gap-0.5">{displayLanguage === "ID" ? "DIKUASAI:" : "MASTERED:"} <strong className="text-amber-600 font-bold font-sans">★ {masteredIds.filter(id => items.some(item => item.id === id)).length}</strong></span>
        </div>

        {/* List items scrollbar */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1" id="list-scroll-view">
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
              const isMastered = masteredIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  id={`bunpo-item-${item.id}`}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedItem?.id === item.id
                      ? "bg-white border-natural-accent shadow-xs"
                      : "bg-white/40 border-natural-border/70 hover:bg-white hover:border-natural-accent/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isMastered && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />}
                      <span className="text-base font-serif font-bold text-natural-text-dark tracking-tight">
                        {item.japanese}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#8A8870] uppercase bg-natural-badge px-2 py-0.5 rounded-full">
                      {item.romaji}
                    </span>
                  </div>
                  
                  <p className="text-xs text-natural-text-muted font-sans mt-1 line-clamp-2">
                    {displayLanguage === "ID" ? item.meaningId : item.meaningEn}
                  </p>

                  {selectedItem?.id === item.id && (
                    <div className="mt-2.5 flex items-center gap-1 text-[8px] font-sans font-bold uppercase tracking-widest text-[#8A8870]">
                      <CheckCircle2 className="w-3 h-3 text-[#8A8870]" />
                      {displayLanguage === "ID" ? "Terpilih" : "Selected"}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-natural-text-muted font-sans uppercase tracking-widest text-xs p-4 border border-dashed border-[#E6E4D5] rounded-xl bg-white/40">
              {displayLanguage === "ID" ? "Tidak ada pola kalimat yang cocok." : "No matching grammar patterns."}
            </div>
          )}
        </div>
      </div>

      {/* Detail Pane */}
      <div className="lg:col-span-7 h-auto lg:h-[650px] flex flex-col" id="detail-panel">
        {selectedItem ? (
          <div className="bg-white border border-natural-border rounded-2xl shadow-xs p-4 sm:p-6 lg:p-8 flex flex-col justify-between h-full overflow-y-auto" id="bunpo-sheet">
            
            <div>
              {/* Header inside pane */}
              <div className="flex flex-wrap items-center justify-between border-b border-natural-border pb-3 sm:pb-4 gap-2 sm:gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-natural-text-dark tracking-tight flex items-center gap-2">
                    {masteredIds.includes(selectedItem.id) && (
                      <Star className="w-6 h-6 fill-amber-400 text-amber-500 shrink-0 inline-block animate-pulse" />
                    )}
                    {selectedItem.japanese}
                  </h2>
                  <p className="text-xs font-mono text-natural-accent mt-1 tracking-wider uppercase">
                    {selectedItem.romaji} &bull; JLPT N3 Grammar Pattern
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mastery toggle button */}
                  <button
                    onClick={() => onToggleMastery(selectedItem.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      masteredIds.includes(selectedItem.id)
                        ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                        : "bg-white border-natural-border text-natural-text-muted hover:text-natural-text-dark hover:border-[#A8A690]"
                    }`}
                    title={masteredIds.includes(selectedItem.id) ? "Tandai Belum Dikuasai" : "Tandai Sudah Dikuasai"}
                  >
                    <Star className={`w-3.5 h-3.5 ${masteredIds.includes(selectedItem.id) ? "fill-amber-400 text-amber-500 font-bold" : "text-natural-text-muted"}`} />
                    {masteredIds.includes(selectedItem.id)
                      ? (displayLanguage === "ID" ? "Dikuasai ★" : "Mastered ★")
                      : (displayLanguage === "ID" ? "Kuasai Pola" : "Mark Mastered")}
                  </button>

                  {/* Web explanation link */}
                  <a
                    href={selectedItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-natural-badge hover:bg-[#F3F1E1] border border-natural-border text-natural-text-dark rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {displayLanguage === "ID" ? "Info Web" : "Web Info"} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Meanings */}
              <div className="mt-5 space-y-4">
                <div>
                  <span className="text-[10px] text-natural-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-natural-accent" />
                    {displayLanguage === "ID" ? "Makna & Terjemahan" : "Meaning & Translation"}
                  </span>
                  <div className="mt-1 space-y-1 bg-[#FDFCF0] p-4 rounded-xl border border-natural-border">
                    <p className="text-base font-semibold text-natural-text-dark">
                      {displayLanguage === "ID" ? selectedItem.meaningId : selectedItem.meaningEn}
                    </p>
                    {selectedItem.meaningId && selectedItem.meaningEn && (
                      <p className="text-xs font-medium text-[#6B695A] italic">
                        {displayLanguage === "ID" ? selectedItem.meaningEn : selectedItem.meaningId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Formula / Rumus */}
                <div className="pt-2">
                  <span className="text-[10px] text-natural-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-natural-accent" />
                    {displayLanguage === "ID" ? "Rumus / Formasi" : "Formula / Formation"}
                  </span>
                  <div className="mt-1.5 bg-natural-sidebar text-natural-text-dark border border-natural-border font-mono text-xs p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                    {selectedItem.formula}
                  </div>
                </div>
              </div>

              {/* Sample Sentences */}
              <div className="mt-6 border-t border-natural-border pt-5">
                <span className="text-[10px] text-natural-text-muted uppercase font-bold tracking-wider">
                  {displayLanguage === "ID" ? "Contoh Kalimat" : "Example Sentences"}
                </span>
                <div className="mt-2.5 space-y-4 bg-white/50 p-4.5 rounded-xl border border-[#FAFAF9]" style={{ contentVisibility: "auto" }}>
                  <div className="border-l-2 border-natural-accent pl-4">
                    <p className="text-lg font-serif text-natural-text-dark leading-normal">
                      {highlightPattern(selectedItem.exampleJa, selectedItem.japanese)}
                    </p>
                    <p className="text-xs text-natural-text-muted italic mt-0.5">
                      {displayLanguage === "ID" ? selectedItem.exampleId : selectedItem.exampleEn}
                    </p>
                  </div>
                  
                  {selectedItem.romajiExample && (
                    <div className="border-l-2 border-natural-accent/30 pl-4 py-0.5">
                      <p className="text-xs text-[#8A8870] font-mono leading-relaxed">
                        {highlightPattern(selectedItem.romajiExample, selectedItem.romaji)}
                      </p>
                      <p className="text-[10px] text-[#8A8870] italic leading-relaxed">
                        {displayLanguage === "ID" ? selectedItem.exampleEn : selectedItem.exampleId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

             {/* CTA Practice */}
            <div className="pt-3 border-t border-natural-border mt-4">
              <button
                id={`practice-trigger-${selectedItem.id}`}
                onClick={() => onSelectPractice(selectedItem)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 sm:px-10 py-2 sm:py-2.5 bg-natural-accent hover:bg-natural-accent-hover text-white font-bold uppercase text-[11px] sm:text-xs tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {displayLanguage === "ID" ? `Latih Menulis Pola "${selectedItem.japanese}"` : `Practice Pattern "${selectedItem.japanese}"`} <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-natural-border rounded-[32px] p-12 text-center text-natural-text-muted flex flex-col items-center justify-center h-full shadow-xs">
            <BookOpen className="w-12 h-12 text-[#E6E4D5] mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">
              {displayLanguage === "ID" ? "Pilih pola kalimat N3 di sebelah kiri untuk melihat rincian." : "Select an N3 grammar pattern on the left to view details."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
