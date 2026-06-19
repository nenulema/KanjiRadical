import React, { useState, useEffect } from "react";
import BunpoList from "./BunpoList";
import BunpoQuiz from "./BunpoQuiz";
import BunpoFlashcards from "./BunpoFlashcards";
import BunpoMCQ from "./BunpoMCQ";
import { BUNPO_DATA, BunpoItem } from "../data/bunpo";
import { csvToBunpoItems } from "../utils/bunpoCsvParser";
import { User } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  GraduationCap, BookOpen, Layers, Edit3, HelpCircle, ChevronRight, 
  BookOpenCheck, Settings, Globe, FileUp, Database, Key, Trash2, 
  CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, LogOut, Compass, CloudUpload, Loader2
} from "lucide-react";

interface BunpoAppProps {
  user?: User | null;
  onNavigate: (mode: "kanji" | "kotoba" | "bunpo") => void;
}

export default function BunpoApp({ user, onNavigate }: BunpoAppProps) {
  const isAdmin = user?.email === "nenuhokka@gmail.com";
  const [activeTab, setActiveTab ] = useState<"catalog" | "practice" | "flashcards" | "quiz-mcq">("catalog");
  const [selectedPracticeItem, setSelectedPracticeItem] = useState<BunpoItem | null>(null);

  // Mastery Tracking State
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bunpo_mastered_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleMastery = (id: string) => {
    setMasteredIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("bunpo_mastered_ids", JSON.stringify(updated));
      return updated;
    });
  };

  // Global Settings and States
  const [bunpoList, setBunpoList] = useState<BunpoItem[]>(() => {
    const saved = localStorage.getItem("bunpo_list_custom");
    return saved ? JSON.parse(saved) : BUNPO_DATA;
  });

  const [displayLanguage, setDisplayLanguage] = useState<"ID" | "EN">(() => {
    const saved = localStorage.getItem("bunpo_display_lang");
    return (saved === "EN" ? "EN" : "ID") as "ID" | "EN";
  });

  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem("user_gemini_api_key") || "";
  });

  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [csvUploadSuccess, setCsvUploadSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem("bunpo_display_lang", displayLanguage);
  }, [displayLanguage]);

  // Fetch Global Database overlay
  useEffect(() => {
    const fetchGlobalData = async () => {
      if (!db) return;
      try {
        const docRef = doc(db, "global_data", "bunpo_db");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const globalData = docSnap.data().items;
          if (globalData && Array.isArray(globalData)) {
            // Update local storage and memory
            localStorage.setItem("bunpo_list_custom", JSON.stringify(globalData));
            setBunpoList(globalData);
          }
        }
      } catch (err) {
        console.error("Failed to sync global Bunpo DB:", err);
      }
    };
    fetchGlobalData();
  }, []);

  const handleSyncToCloud = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Admin: Yakin ingin mem-publish kosa kata CSV yang sedang aktif ini ke Cloud (Firebase)? Semua pengguna akan otomatis mendownload ini.")) return;
    
    setIsSyncing(true);
    try {
      await setDoc(doc(db, "global_data", "bunpo_db"), {
        items: bunpoList,
        updatedAt: new Date().toISOString()
      });
      alert("Berhasil! Database Bunpo Global kini sudah diperbarui di Firebase.");
    } catch (err: any) {
      alert("Gagal mempublish ke Cloud: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectPractice = (item: BunpoItem) => {
    setSelectedPracticeItem(item);
    setActiveTab("practice");
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvUploadError(null);
    setCsvUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") {
          throw new Error("Gagal membaca dokumen.");
        }
        const items = csvToBunpoItems(text);
        if (items.length === 0) {
          throw new Error("Dokumen CSV kosong atau kolom tidak cocok. Pastikan tajuk kolom sudah sesuai.");
        }

        setBunpoList(items);
        localStorage.setItem("bunpo_list_custom", JSON.stringify(items));
        setCsvUploadSuccess(`Berhasil mengimpor ${items.length} pola kalimat. Database Anda kini diperbarui!`);
      } catch (err: any) {
        setCsvUploadError(err.message || "Gagal mengurai file CSV.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = () => {
    if (window.confirm("Apakah Anda yakin ingin memulihkan pola kalimat bawaan (Standard Preset)? Tindakan ini akan menghapus database CSV unggahan kustom Anda.")) {
      setBunpoList(BUNPO_DATA);
      localStorage.removeItem("bunpo_list_custom");
      setCsvUploadSuccess("Berhasil memulihkan pola kalimat standard preset!");
      setCsvUploadError(null);
    }
  };

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    setCustomApiKey(trimmed);
    localStorage.setItem("user_gemini_api_key", trimmed);
    alert(trimmed ? "Kunci API kustom tersimpan dengan aman!" : "Kunci API dinonaktifkan.");
  };

  return (
    <div className="flex flex-col bg-natural-bg text-natural-text-dark font-sans" id="applet-viewport">
      
      {/* Header / Nav Bar */}
      <div className="bg-white border-b border-natural-border px-4 py-3 sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-natural-accent rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
            N3
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-natural-text-dark flex items-center gap-1 leading-none mb-1">
              Bunpou Master <span className="text-base">🌸</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#8A8870] font-bold leading-none">
              {displayLanguage === "ID" ? "Panduan & Latihan Mandiri Pola N3" : "JLPT N3 Independent Study Guide"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none" id="nav-tabs">
          <button
            onClick={() => { setActiveTab("catalog"); setSelectedPracticeItem(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "catalog" ? "bg-natural-accent text-white" : "text-natural-text-muted hover:bg-natural-sidebar"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{displayLanguage === "ID" ? "Daftar" : "List"}</span>
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "practice" ? "bg-natural-accent text-white" : "text-natural-text-muted hover:bg-natural-sidebar"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{displayLanguage === "ID" ? "Latihan" : "Practice"}</span>
          </button>
          <button
            onClick={() => { setActiveTab("flashcards"); setSelectedPracticeItem(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "flashcards" ? "bg-natural-accent text-white" : "text-natural-text-muted hover:bg-natural-sidebar"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => { setActiveTab("quiz-mcq"); setSelectedPracticeItem(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "quiz-mcq" ? "bg-natural-accent text-white" : "text-natural-text-muted hover:bg-natural-sidebar"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Quiz</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border ${
              showSettings ? "bg-natural-accent border-transparent text-white" : "bg-white border-natural-border text-natural-text-dark hover:bg-natural-sidebar"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <div className="ml-1 pl-2 border-l border-natural-border flex items-center gap-2">
            <button
              onClick={() => onNavigate("kanji")}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md cursor-pointer"
              title="Kanji Explorer"
            >
              <Compass size={14} />
              <span className="hidden sm:inline">Kanji Explorer</span>
            </button>
            <button
              onClick={() => onNavigate("kotoba")}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border border-[#C5A358]/40 bg-[#1A1814] text-[#C5A358] hover:bg-[#C5A358]/10 shadow-md cursor-pointer"
              title="Kotoba N3 Study"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Kotoba N3 Study</span>
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white border-b border-natural-border px-4 py-6 shadow-md transition-all divide-y divide-natural-border/60">
          <div className="max-w-7xl mx-auto space-y-6">
            <h3 className="font-serif font-semibold text-lg text-natural-text-dark flex items-center gap-2">
              <Settings className="w-5 h-5 text-natural-accent animate-spin-slow" />
              {displayLanguage === "ID" ? "Pusat Setelan Belajar & Integrasi Data" : "Learning Settings & Data Integration"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              {/* Language Switcher */}
              <div className="space-y-3 bg-natural-sidebar p-4 rounded-2xl border border-natural-border">
                <span className="text-[10px] uppercase font-bold text-natural-accent tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {displayLanguage === "ID" ? "Bahasa Antarmuka" : "Interface Language"}
                </span>
                <p className="text-xs text-natural-text-muted">
                  {displayLanguage === "ID" 
                    ? "Ubah bahasa penjelasan utama, petunjuk menu, serta format terjemahan contoh kalimat."
                    : "Change the primary translation language for example sentences and menus."}
                </p>
                <div className="flex gap-2 pt-1 font-sans">
                  <button
                    onClick={() => setDisplayLanguage("ID")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      displayLanguage === "ID"
                        ? "bg-natural-accent text-white shadow-xs"
                        : "bg-white text-natural-text-muted border border-natural-border hover:text-natural-text-dark"
                    }`}
                  >
                    🇮🇩 ID
                  </button>
                  <button
                    onClick={() => setDisplayLanguage("EN")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      displayLanguage === "EN"
                        ? "bg-natural-accent text-white shadow-xs"
                        : "bg-white text-natural-text-muted border border-natural-border hover:text-natural-text-dark"
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-3 bg-natural-sidebar p-4 rounded-2xl border border-natural-border">
                <span className="text-[10px] uppercase font-bold text-natural-accent tracking-widest flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {displayLanguage === "ID" ? "API Key Gemini AI Anda" : "Personal Gemini API Key"}
                </span>
                <div className="space-y-2 pt-1">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Masukkan Kunci API Gemini..."
                    className="w-full text-xs px-3 py-2 bg-white border border-natural-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-natural-accent text-natural-text-dark"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveApiKey}
                      className="flex-1 py-1.5 bg-natural-accent hover:bg-natural-accent-hover text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Simpan
                    </button>
                    {customApiKey && (
                      <button
                        onClick={() => {
                          setApiKeyInput("");
                          setCustomApiKey("");
                          localStorage.removeItem("user_gemini_api_key");
                          alert("Kunci API kustom dihapus.");
                        }}
                        className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CSV Import */}
              <div className="space-y-3 bg-natural-sidebar p-4 rounded-2xl border border-natural-border">
                <span className="text-[10px] uppercase font-bold text-natural-accent tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {displayLanguage === "ID" ? "Database CSV" : "Database CSV"}
                </span>
                <div className="space-y-2 pt-1">
                  <div className="relative">
                    <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" id="csv-file-uploader" />
                    <label htmlFor="csv-file-uploader" className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-natural-badge text-natural-text-dark border border-natural-border rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors">
                      <FileUp className="w-3.5 h-3.5 text-natural-accent" /> Unggah CSV
                    </label>
                  </div>
                  <button onClick={handleResetDatabase} className="w-full py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                    <RefreshCw className="w-3 h-3 inline mr-1" /> Reset Default
                  </button>
                </div>
              </div>

              {/* Admin Cloud Sync */}
              {isAdmin && (
                <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest flex items-center gap-2">
                    <CloudUpload className="w-4 h-4" />
                    Admin: Sync ke Global Database
                  </span>
                  <p className="text-xs text-emerald-800">
                    Simpan database CSV lokal saat ini ke Firestore sebagai <b>Global Database</b> agar semua user mendapat pembaruan otomatis.
                  </p>
                  <button
                    onClick={handleSyncToCloud}
                    disabled={isSyncing}
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                    {isSyncing ? "Menyinkronkan..." : "Push CSV ke Global Cloud"}
                  </button>
                </div>
              )}
            </div>

            {(csvUploadError || csvUploadSuccess) && (
              <div className="pt-4 flex flex-col gap-2">
                {csvUploadError && <div className="p-3 bg-red-50 text-red-950 rounded-xl text-xs flex gap-2"><AlertCircle className="w-4 h-4 text-red-600" /> {csvUploadError}</div>}
                {csvUploadSuccess && <div className="p-3 bg-green-50 text-green-950 rounded-xl text-xs flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> {csvUploadSuccess}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6" id="main-content-fluid">
        {activeTab === "catalog" && (
          <BunpoList 
            onSelectPractice={handleSelectPractice} 
            items={bunpoList} 
            displayLanguage={displayLanguage} 
            masteredIds={masteredIds}
            onToggleMastery={handleToggleMastery}
          />
        )}

        {activeTab === "practice" && (
          <BunpoQuiz 
            initialItem={selectedPracticeItem} 
            items={bunpoList} 
            displayLanguage={displayLanguage} 
            masteredIds={masteredIds}
            onToggleMastery={handleToggleMastery}
          />
        )}

        {activeTab === "flashcards" && (
          <BunpoFlashcards items={bunpoList} displayLanguage={displayLanguage} />
        )}

        {activeTab === "quiz-mcq" && (
          <BunpoMCQ 
            items={bunpoList} 
            displayLanguage={displayLanguage} 
            onSelectPractice={handleSelectPractice}
          />
        )}
      </main>
    </div>
  );
}
