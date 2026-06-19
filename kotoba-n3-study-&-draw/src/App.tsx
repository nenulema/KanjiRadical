/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Book, 
  BookOpen, 
  HelpCircle, 
  Compass, 
  Cpu, 
  Award, 
  Star, 
  CheckCircle,
  Menu,
  X
} from "lucide-react";
import { 
  KotobaItem, 
  getKotobaData, 
  getFavorites, 
  saveFavorites, 
  ProgressMap, 
  getProgressMap, 
  saveProgressMap, 
  incrementStreak,
  getStreakData
} from "./data/kotobaDb";
import Dashboard from "./components/Dashboard";
import PracticeMode from "./components/PracticeMode";
import QuizMode from "./components/QuizMode";
import ReadmeIntegration from "./components/ReadmeIntegration";

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"dashboard" | "practice" | "quiz" | "devguide">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core synchronized memory States
  const [kotobaList, setKotobaList] = useState<KotobaItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [selectedWord, setSelectedWord] = useState<KotobaItem | null>(null);

  // Load and refresh stats once on initial run
  useEffect(() => {
    loadDatabase();
    incrementStreak(); // Log active day consistencies
  }, []);

  const loadDatabase = () => {
    setKotobaList(getKotobaData());
    setFavorites(getFavorites());
    setProgressMap(getProgressMap());
  };

  const handleToggleFavorite = (id: number) => {
    let updated: number[];
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    saveFavorites(updated);
  };

  const handleUpdateProgress = (id: number, status: "unlearned" | "learning" | "mastered") => {
    const updatedMap = { ...progressMap, [id]: status };
    setProgressMap(updatedMap);
    saveProgressMap(updatedMap);
  };

  // High-fidelity flow: when user clicks a word on the dashboard, 
  // immediately load it into the notebook focus and open Latihan card canvas!
  const handleSelectWord = (word: KotobaItem) => {
    setSelectedWord(word);
    setActiveTab("practice");
  };

  return (
    <div id="kotoba-application-stage" className="min-h-screen bg-dark-bg text-[#E2E8F0] flex flex-col font-sans select-none">
      
      {/* 1. NAV BAR HEADER (Polished traditional torii gold-accent sophisticated dark design) */}
      <header className="bg-dark-panel border-b border-white/10 sticky top-0 z-50 shadow-md px-6 py-4 flex items-center justify-between">
        
        {/* Logo Pairings */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab("dashboard"); setSelectedWord(null); }}>
          <span className="w-10 h-10 bg-brand-gold text-dark-bg rounded-lg flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-brand-gold/10">
            N3
          </span>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-[#E2E8F0] tracking-tight font-sans">
              ことば Kotoba Master Pro
            </h1>
            <p className="text-[10px] text-white/40 font-mono tracking-wider uppercase font-semibold">
              JLPT Preparation Suite
            </p>
          </div>
        </div>

        {/* Desktop Tabs Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => { setActiveTab("dashboard"); setSelectedWord(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === "dashboard" 
                ? "bg-brand-gold-muted text-brand-gold border-brand-gold/40 shadow-inner" 
                : "text-white/60 border-transparent hover:text-[#E2E8F0] hover:bg-white/5"
            }`}
          >
            <Book size={14} />
            <span>Katalog N3</span>
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === "practice" 
                ? "bg-brand-gold-muted text-brand-gold border-brand-gold/40 shadow-inner" 
                : "text-white/60 border-transparent hover:text-[#E2E8F0] hover:bg-white/5"
            }`}
          >
            <Compass size={14} />
            <span>Latihan & Tulis</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === "quiz" 
                ? "bg-brand-gold-muted text-brand-gold border-brand-gold/40 shadow-inner" 
                : "text-white/60 border-transparent hover:text-[#E2E8F0] hover:bg-white/5"
            }`}
          >
            <Award size={14} />
            <span>Game & Kuis</span>
          </button>
          <button
            onClick={() => setActiveTab("devguide")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === "devguide"
                ? "bg-brand-gold text-dark-bg border-brand-gold shadow-md"
                : "text-white/60 border-white/10 hover:text-brand-gold hover:bg-white/5"
            }`}
          >
            <Cpu size={14} />
            <span>Integrasi IDE</span>
          </button>
        </nav>

        {/* Mobile menu block hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white/60 hover:text-[#E2E8F0] focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-dark-panel border-b border-white/10 py-3 px-6 space-y-2 animate-fadeIn flex flex-col">
          <button
            onClick={() => { setActiveTab("dashboard"); setSelectedWord(null); setIsMobileMenuOpen(false); }}
            className={`py-2 px-3 text-sm font-semibold rounded-lg text-left ${activeTab === "dashboard" ? "bg-brand-gold-muted text-brand-gold" : "text-white/60"}`}
          >
            Katalog N3
          </button>
          <button
            onClick={() => { setActiveTab("practice"); setIsMobileMenuOpen(false); }}
            className={`py-2 px-3 text-sm font-semibold rounded-lg text-left ${activeTab === "practice" ? "bg-brand-gold-muted text-brand-gold" : "text-white/60"}`}
          >
            Latihan & Tulis
          </button>
          <button
            onClick={() => { setActiveTab("quiz"); setIsMobileMenuOpen(false); }}
            className={`py-2 px-3 text-sm font-semibold rounded-lg text-left ${activeTab === "quiz" ? "bg-brand-gold-muted text-brand-gold" : "text-white/60"}`}
          >
            Game & Kuis
          </button>
          <button
            onClick={() => { setActiveTab("devguide"); setIsMobileMenuOpen(false); }}
            className={`py-2 px-3 text-sm font-semibold rounded-lg text-left ${activeTab === "devguide" ? "bg-brand-gold text-dark-bg font-bold" : "text-white/60"}`}
          >
            Integrasi IDE
          </button>
        </div>
      )}

      {/* 2. BODY CONTENT (Modular Screen Routing Layout with responsive bounds) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Dashboard Catalog View */}
        {activeTab === "dashboard" && (
          <Dashboard
            kotobaList={kotobaList}
            progressMap={progressMap}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onUpdateProgress={handleUpdateProgress}
            onSelectWord={handleSelectWord}
            onRefreshData={loadDatabase}
          />
        )}

        {/* Practice Mode Flashcard & Canvas View */}
        {activeTab === "practice" && (
          <PracticeMode
            filteredList={kotobaList}
            progressMap={progressMap}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onUpdateProgress={handleUpdateProgress}
            initialWord={selectedWord}
            onBackToDashboard={() => { setActiveTab("dashboard"); setSelectedWord(null); }}
          />
        )}

        {/* Game Arena multiple question View */}
        {activeTab === "quiz" && (
          <QuizMode
            kotobaList={kotobaList}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onBackToDashboard={() => setActiveTab("dashboard")}
          />
        )}

        {/* Integration guides instruction View */}
        {activeTab === "devguide" && (
          <ReadmeIntegration />
        )}

      </main>

      {/* 3. FOOTER GRID */}
      <footer className="bg-dark-panel border-t border-white/10 py-6 text-center text-xs text-white/40 select-text">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono">
            &copy; 1888-2026. Kotoba Master Pro &bull; Ditata dengan visual grid modern Jepang.
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-[#E2E8F0] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse block" />
              Sistem Siap Ekspor ZIP ke Antigravity IDE
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
