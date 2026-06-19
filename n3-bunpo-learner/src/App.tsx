import React, { useState, useEffect } from "react";
import BunpoList from "./components/BunpoList";
import BunpoQuiz from "./components/BunpoQuiz";
import BunpoFlashcards from "./components/BunpoFlashcards";
import BunpoMCQ from "./components/BunpoMCQ";
import { BUNPO_DATA, BunpoItem } from "./data/bunpo";
import { csvToBunpoItems } from "./utils/csvParser";
import { 
  GraduationCap, BookOpen, Layers, Edit3, HelpCircle, ChevronRight, 
  BookOpenCheck, Settings, Globe, FileUp, Database, Key, Trash2, 
  CheckCircle2, AlertCircle, RefreshCw, Award
} from "lucide-react";

export default function App() {
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

  // Sync back language preferences to localstorage
  useEffect(() => {
    localStorage.setItem("bunpo_display_lang", displayLanguage);
  }, [displayLanguage]);

  // Jump immediately to exercise/quiz tab with a selected element
  const handleSelectPractice = (item: BunpoItem) => {
    setSelectedPracticeItem(item);
    setActiveTab("practice");
  };

  // CSV Import parser
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

  // Reset database back to hardcoded default
  const handleResetDatabase = () => {
    if (window.confirm("Apakah Anda yakin ingin memulihkan pola kalimat bawaan (Standard Preset)? Tindakan ini akan menghapus database CSV unggahan kustom Anda.")) {
      setBunpoList(BUNPO_DATA);
      localStorage.removeItem("bunpo_list_custom");
      setCsvUploadSuccess("Berhasil memulihkan pola kalimat standard preset!");
      setCsvUploadError(null);
    }
  };

  // Set custom API Key
  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    setCustomApiKey(trimmed);
    localStorage.setItem("user_gemini_api_key", trimmed);
    alert(trimmed ? "Kunci API kustom tersimpan dengan aman!" : "Kunci API dinonaktifkan.");
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text-dark flex flex-col font-sans" id="applet-viewport">
      
      {/* Dynamic Header */}
      <header className="bg-white border-b border-natural-border sticky top-0 z-40" id="applet-header">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 md:py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            
            {/* Branding / Title */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-natural-accent rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xs">
                N3
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-natural-text-dark flex items-center gap-1">
                  Bunpou Master <span className="text-base">🌸</span>
                </h1>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8A8870] font-bold">
                  {displayLanguage === "ID" ? "Panduan & Latihan Mandiri Pola N3" : "JLPT N3 Independent Study Guide"}
                </p>
              </div>
            </div>

            {/* Navigation Tabs and Settings */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full md:w-auto pb-1 md:pb-0" id="controls-row">
              {/* Navigation Tabs */}
              <nav className="flex items-center bg-natural-sidebar border border-natural-border p-0.5 sm:p-1 rounded-xl scrollbar-none w-full md:w-auto" id="nav-tabs">
                <button
                  onClick={() => {
                    setActiveTab("catalog");
                    setSelectedPracticeItem(null);
                  }}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === "catalog"
                      ? "bg-natural-accent text-white shadow-xs"
                      : "text-natural-text-muted hover:text-natural-text-dark"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{displayLanguage === "ID" ? "Daftar" : "List"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("practice")}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === "practice"
                      ? "bg-natural-accent text-white shadow-xs"
                      : "text-natural-text-muted hover:text-natural-text-dark"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{displayLanguage === "ID" ? "Latihan" : "Practice"}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("flashcards");
                    setSelectedPracticeItem(null);
                  }}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === "flashcards"
                      ? "bg-natural-accent text-white shadow-xs"
                      : "text-natural-text-muted hover:text-natural-text-dark"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("quiz-mcq");
                    setSelectedPracticeItem(null);
                  }}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === "quiz-mcq"
                      ? "bg-natural-accent text-white shadow-xs"
                      : "text-natural-text-muted hover:text-natural-text-dark"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{displayLanguage === "ID" ? "Kuis" : "Quiz"}</span>
                </button>
              </nav>

              {/* Control Panel Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                id="settings-trigger-top"
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide shrink-0 ${
                  showSettings 
                    ? "bg-natural-accent border-transparent text-white shadow-xs" 
                    : "bg-white border-natural-border text-natural-text-dark hover:bg-natural-sidebar"
                }`}
                title="Pengaturan"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Settings Panel Container */}
      {showSettings && (
        <div className="bg-white border-b border-natural-border px-4 py-6 shadow-md transition-all divide-y divide-natural-border/60" id="settings-widget-panel">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h3 className="font-serif font-semibold text-lg text-natural-text-dark flex items-center gap-2">
              <Settings className="w-5 h-5 text-natural-accent animate-spin-slow" />
              {displayLanguage === "ID" ? "Pusat Setelan Belajar & Integrasi Data" : "Learning Settings & Data Integration"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              
              {/* Box 1: Language Switcher */}
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
                    🇮🇩 Bahasa Indonesia
                  </button>
                  <button
                    onClick={() => setDisplayLanguage("EN")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      displayLanguage === "EN"
                        ? "bg-natural-accent text-white shadow-xs"
                        : "bg-white text-natural-text-muted border border-natural-border hover:text-natural-text-dark"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Box 2: Custom API Key */}
              <div className="space-y-3 bg-natural-sidebar p-4 rounded-2xl border border-natural-border">
                <span className="text-[10px] uppercase font-bold text-natural-accent tracking-widest flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {displayLanguage === "ID" ? "API Key Gemini AI Anda" : "Personal Gemini API Key"}
                </span>
                <p className="text-xs text-natural-text-muted">
                  {displayLanguage === "ID"
                    ? "Gunakan kuota Gemini API kustom Anda sendiri untuk mendapatkan penilaian kalimat kreatif secara tak terbatas."
                    : "Insert your personal Google Gemini API key to evaluate your custom sentence writing."}
                </p>
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
                      {displayLanguage === "ID" ? "Simpan Kunci" : "Save Key"}
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
                        title="Hapus Kunci"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] flex items-center gap-1.5 mt-1 font-medium">
                    {customApiKey ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {displayLanguage === "ID" ? "Menggunakan API Key Kustom" : "Using Custom API Key"}
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {displayLanguage === "ID" ? "Menggunakan Kunci Server Bawaan" : "Using Default Server Key"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 3: CSV Import & Management */}
              <div className="space-y-3 bg-natural-sidebar p-4 rounded-2xl border border-natural-border">
                <span className="text-[10px] uppercase font-bold text-natural-accent tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {displayLanguage === "ID" ? "Database & Impor CSV" : "Grammar Database & CSV Import"}
                </span>
                <p className="text-xs text-natural-text-muted">
                  {displayLanguage === "ID"
                    ? `Perbarui atau tambah database pola kalimat Anda secara instan menggunakan dokumen .csv (Sekarang: ${bunpoList.length} pola)`
                    : `Import custom grammar structures dynamically from a CSV file. (Current database: ${bunpoList.length} patterns)`}
                </p>
                
                <div className="space-y-2 pt-1">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-file-uploader"
                    />
                    <label
                      htmlFor="csv-file-uploader"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-natural-badge text-natural-text-dark border border-natural-border rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                    >
                      <FileUp className="w-3.5 h-3.5 text-natural-accent" />
                      {displayLanguage === "ID" ? "Unggah Dokumen CSV" : "Upload CSV File"}
                    </label>
                  </div>

                  <button
                    onClick={handleResetDatabase}
                    className="w-full py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 inline mr-1" />
                    {displayLanguage === "ID" ? "Reset ke Bawaan (60+)" : "Reset to Default (60+)"}
                  </button>
                </div>
              </div>

            </div>

            {/* Upload Feedback Messages */}
            {(csvUploadError || csvUploadSuccess) && (
              <div className="pt-4 flex flex-col gap-2">
                {csvUploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-950 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Gagal Mengimpor:</p>
                      <p>{csvUploadError}</p>
                    </div>
                  </div>
                )}
                {csvUploadSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-950 rounded-xl text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Sukses:</p>
                      <p>{csvUploadSuccess}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6" id="main-content-fluid">
        
        {/* Conditional tabs */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 font-medium text-xs text-natural-text-muted">
              <span>N3 Bunpo Learner</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-natural-text-dark">
                {displayLanguage === "ID" ? "Daftar Pola Kalimat" : "Grammar Pattern List"}
              </span>
            </div>
            <BunpoList 
              onSelectPractice={handleSelectPractice} 
              items={bunpoList} 
              displayLanguage={displayLanguage} 
              masteredIds={masteredIds}
              onToggleMastery={handleToggleMastery}
            />
          </div>
        )}

        {activeTab === "practice" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 font-medium text-xs text-natural-text-muted">
              <span>N3 Bunpo Learner</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-natural-text-dark">
                {displayLanguage === "ID" ? "Latihan Tulis Pola" : "Sentence Practice"}
              </span>
            </div>
            
            {/* Quick selector bar or hint */}
            {selectedPracticeItem && (
              <div className="p-3 bg-natural-badge border border-natural-border rounded-xl flex items-center justify-between text-xs font-sans text-natural-text-dark">
                <p>
                  <span>{displayLanguage === "ID" ? "Mempraktikkan pola terpilih: " : "Practicing selected pattern: "}</span> 
                  <strong className="text-sm font-semibold font-serif text-natural-accent">{selectedPracticeItem.japanese}</strong> 
                  <span className="text-natural-text-muted italic"> 
                    ({displayLanguage === "ID" ? selectedPracticeItem.meaningId : selectedPracticeItem.meaningEn})
                  </span>
                </p>
                <button
                  onClick={() => setSelectedPracticeItem(null)}
                  className="px-2.5 py-1 bg-white hover:bg-natural-sidebar border border-natural-border rounded-lg text-natural-text-dark font-semibold text-[10px] uppercase tracking-wider transition-all"
                >
                  {displayLanguage === "ID" ? "Ganti Soal" : "Change Question"}
                </button>
              </div>
            )}

            <BunpoQuiz 
              initialItem={selectedPracticeItem} 
              items={bunpoList} 
              displayLanguage={displayLanguage} 
              masteredIds={masteredIds}
              onToggleMastery={handleToggleMastery}
            />
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 font-medium text-xs text-natural-text-muted">
              <span>N3 Bunpo Learner</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-natural-text-dark">
                {displayLanguage === "ID" ? "Kartu Hafalan" : "Mnemonic Flashcards"}
              </span>
            </div>
            <BunpoFlashcards 
              items={bunpoList} 
              displayLanguage={displayLanguage} 
            />
          </div>
        )}

        {activeTab === "quiz-mcq" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 font-medium text-xs text-natural-text-muted">
              <span>N3 Bunpo Learner</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-natural-text-dark">
                {displayLanguage === "ID" ? "Kuis Pilihan Ganda" : "Multiple-Choice Quiz"}
              </span>
            </div>
            <BunpoMCQ 
              items={bunpoList} 
              displayLanguage={displayLanguage} 
              onSelectPractice={(item) => {
                setSelectedPracticeItem(item);
                setActiveTab("practice");
              }}
            />
          </div>
        )}

      </main>

      {/* Dynamic footer */}
      <footer className="bg-natural-sidebar border-t border-natural-border py-6" id="applet-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-natural-text-muted font-sans flex items-center gap-1.5 flex-wrap">
            <span>&copy; 2026 JLPT N3 Bunpo Learner.</span>
            <span>{displayLanguage === "ID" ? "Didukung oleh teknologi Gemini AI." : "Powered by Gemini AI and Antigravity."}</span>
          </p>
          <div className="flex items-center gap-2.5 text-xs font-sans text-natural-text-muted">
            <span className="uppercase tracking-wider font-semibold text-[10px]">
              {displayLanguage === "ID" ? "Capaian Belajar Anda Aman di Memori Lokal Browser" : "Your learning database is stored safe in your local browser storage"}
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
