/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Volume2, 
  BookOpen,
  ArrowLeft,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { KotobaItem, ProgressMap } from "../data/kotobaDb";
import KanjiDrawingCanvas from "./KanjiDrawingCanvas";
import { renderHighlightedText } from "../utils/textHighlight";

interface PracticeModeProps {
  filteredList: KotobaItem[];
  progressMap: ProgressMap;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onUpdateProgress: (id: number, status: "unlearned" | "learning" | "mastered") => void;
  initialWord?: KotobaItem | null;
  onBackToDashboard: () => void;
}

export default function PracticeMode({
  filteredList,
  progressMap,
  favorites,
  onToggleFavorite,
  onUpdateProgress,
  initialWord,
  onBackToDashboard
}: PracticeModeProps) {
  // Extract all unique sections/parts (Bagian)
  const allParts = React.useMemo(() => {
    const sections = new Set<string>();
    filteredList.forEach(item => {
      if (item.bagian) sections.add(item.bagian.trim());
    });
    return Array.from(sections).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [filteredList]);

  // Selected filter state (defaults to "all")
  const [selectedPart, setSelectedPart] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all"); // "all" | "unlearned" | "learning" | "mastered"

  // Filtered sub-list according to selectedPart AND selectedStatus
  const practiceSubset = React.useMemo(() => {
    let list = filteredList;
    if (selectedPart !== "all") {
      list = list.filter(item => item.bagian === selectedPart);
    }
    if (selectedStatus !== "all") {
      list = list.filter(item => {
        const status = progressMap[item.id] || "unlearned";
        return status === selectedStatus;
      });
    }
    return list;
  }, [filteredList, selectedPart, selectedStatus, progressMap]);

  // State to track the active slide index relative to practiceSubset
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // State to toggle between Kanji-sentence and Hiragana-sentence modes
  const [revealSentenceHiragana, setRevealSentenceHiragana] = useState<boolean>(false);

  // Handle synchronization of initialWord
  useEffect(() => {
    if (initialWord && filteredList.length > 0) {
      const targetPart = initialWord.bagian || "all";
      setSelectedPart(targetPart);
      setSelectedStatus("all"); // Reset progress filter so target word is guaranteed to be showing

      // Immediately filter subset inside this effect block to find exact index
      const subset = targetPart === "all" ? filteredList : filteredList.filter(item => item.bagian === targetPart);
      const idx = subset.findIndex(item => item.id === initialWord.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        setCurrentIndex(0);
      }
      setRevealSentenceHiragana(false);
    }
  }, [initialWord, filteredList]);

  // Reset index when manual user changes selected part dropdown
  const handlePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPart(e.target.value);
    setCurrentIndex(0);
    setRevealSentenceHiragana(false);
  };

  // Handle previous slide navigation
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setRevealSentenceHiragana(false); // reset toggle on slide change for fresh retrieval
    }
  };

  // Handle next slide navigation
  const handleNext = () => {
    if (currentIndex < practiceSubset.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRevealSentenceHiragana(false); // reset toggle on slide change for fresh retrieval
    }
  };

  // Active word based on slider index within practiceSubset
  const activeItem = practiceSubset.length > 0 ? (practiceSubset[currentIndex] || practiceSubset[0]) : null;
  const isFav = activeItem ? favorites.includes(activeItem.id) : false;
  const status = activeItem ? (progressMap[activeItem.id] || "unlearned") : "unlearned";

  const speakSound = (text: string, lang = "ja-JP", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div id="kotoba-practice-section" className="space-y-6">
      
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-dark-panel p-4 rounded-xl border border-white/10 shadow-md animate-fadeIn">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white cursor-pointer font-bold py-1.5 px-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
          >
            <ArrowLeft size={14} />
            <span>Dasbor</span>
          </button>

          {/* Part Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-dark-bg/40 px-2.5 py-1 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-white/40 font-mono uppercase">Bagian:</span>
            <select
              value={selectedPart}
              onChange={handlePartChange}
              className="bg-transparent text-brand-gold font-bold text-xs py-1 px-1 outline-none cursor-pointer"
            >
              <option value="all" className="bg-dark-panel text-white">Semua Bagian</option>
              {allParts.map(part => (
                <option key={part} value={part} className="bg-dark-panel text-white">{part}</option>
              ))}
            </select>
          </div>

          {/* New Status Filter Dropdown as requested */}
          <div className="flex items-center gap-1.5 bg-dark-bg/40 px-2.5 py-1 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-white/40 font-mono uppercase">Filter Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentIndex(0);
                setRevealSentenceHiragana(false);
              }}
              className="bg-transparent text-[#DFC15D] font-bold text-xs py-1 px-1 outline-none cursor-pointer"
            >
              <option value="all" className="bg-dark-panel text-white">Semua Status</option>
              <option value="unlearned" className="bg-dark-panel text-white">Belum Hafal</option>
              <option value="learning" className="bg-dark-panel text-white">Sedang Dipelajari</option>
              <option value="mastered" className="bg-dark-panel text-white">Sudah Hafal (★)</option>
            </select>
          </div>
        </div>

        {/* Progress Tracker Title */}
        <div className="text-xs font-mono font-medium text-white/50 bg-dark-bg/40 px-3 py-1.5 rounded-lg border border-white/5">
          {practiceSubset.length > 0 ? (
            <>
              Kotoba <span className="text-brand-gold font-bold">{currentIndex + 1}</span> dari <span className="text-brand-gold font-bold">{practiceSubset.length}</span> Kata
            </>
          ) : (
            <span className="text-red-400 font-bold">Data Kosong</span>
          )}
        </div>
      </div>

      {/* 2. Slide Navigation Info / Status */}
      <div className="text-center">
        <span className="text-[10px] font-mono font-semibold text-white/40 uppercase tracking-widest block">Latihan Menulis & Membaca Mandiri</span>
        <p className="text-[11px] text-white/30 mt-0.5 max-w-lg mx-auto">
          Klik bintang ★ untuk menandai hafal langsung secara interaktif. Gunakan daftar di kiri untuk melompat antar kanji dengan cepat.
        </p>
      </div>

      {/* 3. Combined Side-by-Side Responsive Grid Workspace with 3 columns (Sidebar, Card, Canvas) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Kanban/Sidebar Quick Navigation (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-dark-panel rounded-3xl border border-white/15 p-4 flex flex-col h-[520px] shadow-lg">
          <div className="mb-3">
            <h3 className="text-[11px] font-mono font-bold tracking-wider text-white/45 uppercase">Daftar Kanji ({practiceSubset.length})</h3>
            <p className="text-[9px] text-white/30 mt-0.5">Kelompok: {selectedPart === "all" ? "Semua" : selectedPart}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar scroll-smooth">
            {practiceSubset.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-white/35 font-medium">Kosong</p>
                <button
                  onClick={() => {
                    setSelectedPart("all");
                    setSelectedStatus("all");
                    setCurrentIndex(0);
                  }}
                  className="mt-3 text-[9px] font-bold text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 px-2 py-1 rounded-lg border border-brand-gold/20 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              practiceSubset.map((item, index) => {
                const itemStatus = progressMap[item.id] || "unlearned";
                const isSelected = index === currentIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      setRevealSentenceHiragana(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-1 cursor-pointer ${
                      isSelected 
                        ? "bg-brand-gold/15 border-brand-gold text-brand-gold shadow-md font-black" 
                        : "bg-white/[0.01] border-white/5 text-white/70 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-sm font-extrabold font-sans leading-tight truncate">{item.kanji}</span>
                      <span className="text-[9px] font-mono leading-none text-white/40 truncate">{item.hiragana}</span>
                    </div>
                    
                    {/* Status badge representation */}
                    <div className="flex items-center shrink-0">
                      {itemStatus === "mastered" ? (
                        <div className="bg-brand-gold/15 text-brand-gold p-1 rounded-full border border-brand-gold/25" title="Sudah Hafal">
                          <Star size={10} className="fill-brand-gold text-brand-gold" />
                        </div>
                      ) : itemStatus === "learning" ? (
                        <div className="w-2 h-2 rounded-full bg-amber-500 border border-amber-400/40" title="Masih Dipelajari" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/10 border border-white/20" title="Belum Hafal" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Column: Interactive Explanation Card (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {activeItem ? (
            <>
              {/* Active Card Body */}
              <div className="bg-dark-panel rounded-3xl border border-brand-gold/20 p-5 shadow-xl relative animate-fadeIn flex flex-col justify-between select-none h-[450px]">
                
                {/* Header row metadata */}
                <div className="flex justify-between items-center mb-2 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold text-white/60 bg-white/5 border border-white/10 font-mono">
                    Bagian: {activeItem.bagian}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(activeItem.id)}
                      className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${isFav ? "text-brand-gold" : "text-white/20"}`}
                      title={isFav ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                    >
                      <Star size={15} className={isFav ? "fill-brand-gold text-brand-gold" : ""} />
                    </button>
                    <button
                      onClick={() => speakSound(activeItem.kanji, "ja-JP")}
                      className="p-1.5 text-[#DFC15D] hover:text-brand-gold bg-white/5 hover:bg-[#DFC15D]/10 rounded-full border border-white/10 transition-colors cursor-pointer"
                      title="Putar Lafal Kanji"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Kanji and Hiragana main focus */}
                <div className="text-center py-2.5 border-b border-light-divider/5 space-y-1 shrink-0">
                  <h2 className="text-5xl font-sans font-black text-[#E2E8F0] tracking-wider select-text">
                    {activeItem.kanji}
                  </h2>
                  <p className="text-sm font-mono font-bold text-brand-gold tracking-widest select-text">
                    {activeItem.hiragana}
                  </p>
                  
                  <div className="pt-0.5">
                    <span className="text-[8px] font-mono tracking-widest text-[#DFC15D]/60 uppercase block">Arti Indonesia</span>
                    <p className="text-sm font-black text-[#E2E8F0] select-text max-w-full truncate">
                      {activeItem.arti}
                    </p>
                  </div>
                </div>

                {/* Example sentence with customized Toggle between Kanji/Hiragana version */}
                <div className="py-2.5 border-b border-light-divider/5 font-sans overflow-y-auto flex-1 h-36">
                  <div className="flex items-center justify-between gap-1.5 bg-white/[0.01] p-1.5 rounded-lg border border-white/5 mb-2">
                    <span className="text-[8px] font-mono font-bold tracking-widest text-white/40 uppercase flex items-center gap-1">
                      🧠 Contoh:
                      <button 
                        onClick={() => speakSound(revealSentenceHiragana ? activeItem.contohKalimatHiragana : activeItem.contohKalimat, "ja-JP")}
                        className="p-1 text-brand-gold bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors cursor-pointer"
                        title="Dengarkan Pengucapan Kalimat"
                      >
                        <Volume2 size={8} />
                      </button>
                    </span>

                    {/* Switches sentence mode from kanji to raw phonetic hiragana */}
                    <button
                      onClick={() => setRevealSentenceHiragana(!revealSentenceHiragana)}
                      className={`px-1 rounded text-[8px] flex items-center gap-1 font-mono font-black transition-all cursor-pointer border ${
                        revealSentenceHiragana 
                          ? "bg-brand-gold text-dark-bg border-brand-gold" 
                          : "bg-white/5 text-[#E2E8F0] border-white/10 hover:bg-white/10"
                      }`}
                      title={revealSentenceHiragana ? "Kembali ke Kanji" : "Ubah ke Hiragana-only"}
                    >
                      {revealSentenceHiragana ? <EyeOff size={8} /> : <Eye size={8} />}
                      <span>{revealSentenceHiragana ? "Kanji" : "Hiragana"}</span>
                    </button>
                  </div>

                  {/* Display either Kanji script or pure phonetic Hiragana translation based on state */}
                  <div className="space-y-1">
                    {revealSentenceHiragana ? (
                      <p className="text-[10px] font-sans font-extrabold text-[#DFC15D] leading-relaxed select-text tracking-wide bg-brand-gold/[0.02] p-1.5 rounded-lg border border-brand-gold/5">
                        {renderHighlightedText(activeItem.contohKalimatHiragana, activeItem.hiragana, "gold")}
                      </p>
                    ) : (
                      <p className="text-[10px] font-sans font-bold text-[#E2E8F0] leading-relaxed select-text tracking-normal">
                        {renderHighlightedText(activeItem.contohKalimat, activeItem.kanji, "gold")}
                      </p>
                    )}
                    
                    <div className="pt-1">
                      <span className="text-[8px] font-semibold text-[#DFC15D]/60 block font-mono">Arti Kalimat:</span>
                      <p className="text-[9px] text-white/70 italic leading-snug font-serif select-text">
                        {activeItem.artiKalimat || "Tidak ada terjemahan kalimat."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Progress Status: Starring/Studying click buttons! NO MORE DROPDOWN */}
                <div className="pt-2 flex items-center justify-between gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {/* Star Click Toggle Button for "Sudah Hafal" as requested */}
                    <button
                      onClick={() => onUpdateProgress(activeItem.id, status === "mastered" ? "unlearned" : "mastered")}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        status === "mastered"
                          ? "bg-brand-gold/25 text-brand-gold border-brand-gold/50 shadow-[0_0_10px_rgba(223,193,93,0.12)] font-black"
                          : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                      }`}
                      title={status === "mastered" ? "Tandai Belum Hafal" : "Tandai Sudah Hafal (★)"}
                    >
                      <Star size={11} className={status === "mastered" ? "fill-brand-gold text-brand-gold" : ""} />
                      <span>{status === "mastered" ? "Hafal! ★" : "Hafal?"}</span>
                    </button>

                    {/* Studying Toggle Button for "Sedang Dipelajari" */}
                    <button
                      onClick={() => onUpdateProgress(activeItem.id, status === "learning" ? "unlearned" : "learning")}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        status === "learning"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-black font-semibold"
                          : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
                      }`}
                      title={status === "learning" ? "Hapus penandaan" : "Tandai Sedang Dipelajari"}
                    >
                      <span>Mempelajari</span>
                    </button>
                  </div>

                  <div className="bg-brand-gold/10 px-1 py-0.5 rounded text-[8px] font-bold text-brand-gold uppercase tracking-wider font-mono border border-brand-gold/15">
                    Tulis
                  </div>
                </div>

              </div>

              {/* Slide Navigation Left/Right Buttons */}
              <div className="flex items-center justify-between bg-[#1e1e1e]/40 p-2 rounded-2xl border border-white/5 shadow-md shrink-0">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currentIndex === 0
                      ? "opacity-30 border-white/5 text-white/20 cursor-not-allowed"
                      : "bg-white/5 border-white/10 text-[#E2E8F0] hover:bg-white/10"
                  }`}
                >
                  <ChevronLeft size={13} />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-medium text-white/40">
                    {currentIndex + 1} / {practiceSubset.length}
                  </span>
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === practiceSubset.length - 1}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currentIndex === practiceSubset.length - 1
                      ? "opacity-30 border-white/5 text-white/20 cursor-not-allowed"
                      : "bg-brand-gold border-brand-gold text-dark-bg font-black shadow"
                  }`}
                >
                  <span>Berikutnya</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-dark-panel rounded-3xl border border-white/10 p-5 text-center animate-fadeIn flex flex-col justify-center items-center h-[520px]">
              <p className="text-white/40 text-xs font-medium">Kosong</p>
              <p className="text-[10px] text-white/25 mt-1 max-w-[150px]">Atur filter di atas agar kanji muncul.</p>
              <button
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedPart("all");
                  setCurrentIndex(0);
                }}
                className="mt-3 px-3 py-1.5 bg-brand-gold hover:opacity-90 text-dark-bg text-[10px] font-bold rounded-lg transition-all cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Canvas Drawing calligraphy Workspace (lg:col-span-5) */}
        <div className="lg:col-span-5 w-full">
          {activeItem ? (
            <div id="drawing-notebook-sidebar-container" className="animate-fadeIn">
              <KanjiDrawingCanvas
                kanji={activeItem.kanji}
                hiragana={activeItem.hiragana}
                arti={activeItem.arti}
                onSuccess={(score) => {
                  const currentStatus = progressMap[activeItem.id] || "unlearned";
                  if (score >= 60 && currentStatus !== "mastered") {
                    onUpdateProgress(activeItem.id, "mastered");
                  }
                }}
              />
            </div>
          ) : (
            <div className="bg-[#121212]/40 rounded-3xl border border-white/5 h-[520px] flex items-center justify-center text-center p-6">
              <div className="space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/20">
                  ✏️
                </div>
                <p className="text-white/35 text-xs font-semibold">Kanvas Kosong</p>
                <p className="text-[10px] text-white/20 max-w-[200px]">Atur filter status atau kelompok kanji untuk menampilkan buku coretan di sini.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
