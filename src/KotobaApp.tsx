/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  X,
  Settings,
  LogOut,
  Download,
  Globe,
  FileDown,
  RotateCcw,
  ArrowLeft,
  GraduationCap
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
  KotobaSettings,
  getKotobaSettings,
  saveKotobaSettings,
  DEFAULT_SETTINGS
} from "./data/kotobaDb";
import Dashboard from "./components/Dashboard";
import PracticeMode from "./components/PracticeMode";
import QuizMode from "./components/QuizMode";
import KotobaSettingsModal from "./components/KotobaSettingsModal";

interface KotobaAppProps {
  user?: User | null;
  onNavigate?: (mode: "kanji" | "kotoba" | "bunpo") => void;
  kotobaFavorites: number[];
  kotobaProgressMap: ProgressMap;
  onUpdateKotobaFavorites: (favs: number[]) => void;
  onUpdateKotobaProgressMap: (map: ProgressMap) => void;
}

export default function KotobaApp({ 
  user,
  onNavigate,
  kotobaFavorites,
  kotobaProgressMap,
  onUpdateKotobaFavorites,
  onUpdateKotobaProgressMap
}: KotobaAppProps) {
  const isAdmin = user?.email === "nenuhokka@gmail.com";
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"dashboard" | "practice" | "quiz">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core synchronized memory States
  const [kotobaList, setKotobaList] = useState<KotobaItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>(kotobaFavorites || []);
  const [progressMap, setProgressMap] = useState<ProgressMap>(kotobaProgressMap || {});
  const [settings, setSettings] = useState<KotobaSettings>(DEFAULT_SETTINGS);
  const [selectedWord, setSelectedWord] = useState<KotobaItem | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  // Load and refresh stats once on initial run
  useEffect(() => {
    // Local initialize first for speed
    setKotobaList(getKotobaData());
    setSettings(getKotobaSettings());
    incrementStreak(); // Log active day consistencies

    // Fetch Global Database overlay
    const fetchGlobalData = async () => {
      if (!db) return;
      try {
        const docRef = doc(db, "global_data", "kotoba_db");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const globalData = docSnap.data().items;
          if (globalData && Array.isArray(globalData)) {
            // Update local storage and memory
            localStorage.setItem("kotoba_list_custom", JSON.stringify(globalData));
            setKotobaList(globalData);
          }
        }
      } catch (err) {
        console.error("Failed to sync global Kotoba DB:", err);
      }
    };
    fetchGlobalData();
  }, []);

  const handleSyncToCloud = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Admin: Yakin ingin mem-publish kosa kata CSV yang sedang aktif ini ke Cloud (Firebase)? Semua pengguna akan otomatis mendownload ini.")) return;
    
    setIsSyncing(true);
    try {
      await setDoc(doc(db, "global_data", "kotoba_db"), {
        items: kotobaList,
        updatedAt: new Date().toISOString()
      });
      alert("Berhasil! Database Kotoba Global kini sudah diperbarui di Firebase.");
    } catch (err: any) {
      alert("Gagal mempublish ke Cloud: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSettings = (newSettings: KotobaSettings) => {
    setSettings(newSettings);
    saveKotobaSettings(newSettings);
    setIsSettingsOpen(false);
  };

  // Sync internal state when external props change
  useEffect(() => {
    if (kotobaFavorites) setFavorites(kotobaFavorites);
    if (kotobaProgressMap) setProgressMap(kotobaProgressMap);
  }, [kotobaFavorites, kotobaProgressMap]);

  const handleToggleFavorite = (id: number) => {
    let updated: number[];
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    
    // Save to Firebase via parent, or fallback to local storage
    if (onUpdateKotobaFavorites) {
      onUpdateKotobaFavorites(updated);
    } else {
      saveFavorites(updated);
    }
  };

  const handleUpdateProgress = (id: number, status: "unlearned" | "learning" | "mastered") => {
    const updatedMap = { ...progressMap, [id]: status };
    setProgressMap(updatedMap);
    
    // Save to Firebase via parent, or fallback to local storage
    if (onUpdateKotobaProgressMap) {
      onUpdateKotobaProgressMap(updatedMap);
    } else {
      saveProgressMap(updatedMap);
    }
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
          
          {onNavigate && (
            <div className="ml-2 pl-3 border-l border-white/10 flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-white/60 hover:text-brand-gold hover:bg-white/5 border border-transparent hover:border-white/10"
                title="Pengaturan"
              >
                <Settings size={14} />
              </button>
              <button
                onClick={() => onNavigate("kanji")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md cursor-pointer"
                title="Kanji Explorer"
              >
                <Compass size={14} />
                <span className="hidden sm:inline">Kanji Explorer</span>
              </button>
              <button
                onClick={() => onNavigate("bunpo")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border border-[#5A5A40]/30 bg-gradient-to-r from-[#5A5A40] to-[#737352] text-white hover:from-[#454531] hover:to-[#5A5A40] shadow-md cursor-pointer"
                title="Bunpo N3 Study"
              >
                <GraduationCap size={14} />
                <span className="hidden sm:inline">Bunpo N3 Study</span>
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu block hamburger */}
        <div className="md:hidden flex items-center gap-3">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate("kanji")}
                className="p-2 rounded-xl transition-all flex items-center justify-center border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md"
                title="Kanji Explorer"
              >
                <Compass size={16} />
              </button>
              <button
                onClick={() => onNavigate("bunpo")}
                className="p-2 rounded-xl transition-all flex items-center justify-center border border-[#5A5A40]/30 bg-gradient-to-r from-[#5A5A40] to-[#737352] text-white hover:from-[#454531] hover:to-[#5A5A40] shadow-md"
                title="Bunpo N3 Study"
              >
                <GraduationCap size={16} />
              </button>
            </>
          )}
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
            settings={settings}
            onToggleFavorite={handleToggleFavorite}
            onUpdateProgress={handleUpdateProgress}
            onSelectWord={handleSelectWord}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Practice Mode Flashcard & Canvas View */}
        {activeTab === "practice" && (
          <PracticeMode
            filteredList={kotobaList}
            progressMap={progressMap}
            favorites={favorites}
            settings={settings}
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

      </main>

      {/* 3. FOOTER GRID */}
      <footer className="mt-8 pt-4 pb-6 border-t border-white/5 text-center px-4">
        <p className="text-xs text-white/30 font-mono">
          N3 Kotoba Master &copy; {new Date().getFullYear()} - 
          <span className="text-brand-gold/60 ml-1">JLPT Preparation System</span>
        </p>
      </footer>

      {isSettingsOpen && (
        <KotobaSettingsModal 
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          isAdmin={isAdmin}
          onSyncToCloud={handleSyncToCloud}
          isSyncing={isSyncing}
        />
      )}

    </div>
  );
}
