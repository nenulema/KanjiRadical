/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from "react";
import { 
  Search, 
  BookOpen, 
  Star, 
  CheckCircle2, 
  Clock, 
  Play, 
  Volume2, 
  Bookmark, 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  RotateCcw, 
  Award, 
  Filter, 
  Calendar,
  Grid,
  List,
  Check,
  Zap,
  Info,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  KotobaItem, 
  getFavorites, 
  saveFavorites, 
  ProgressMap, 
  getProgressMap, 
  saveProgressMap, 
  getStreakData, 
  parseCSV, 
  saveKotobaData, 
  resetKotobaData 
} from "../data/kotobaDb";
import { renderHighlightedText } from "../utils/textHighlight";

interface DashboardProps {
  kotobaList: KotobaItem[];
  progressMap: ProgressMap;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onUpdateProgress: (id: number, status: "unlearned" | "learning" | "mastered") => void;
  onSelectWord: (word: KotobaItem) => void;
  onRefreshData: () => void;
}

export default function Dashboard({
  kotobaList,
  progressMap,
  favorites,
  onToggleFavorite,
  onUpdateProgress,
  onSelectWord,
  onRefreshData
}: DashboardProps) {
  const [searchTerm, setSearchQuery] = useState("");
  const [selectedBagian, setSelectedDayFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [csvContentText, setCsvContentText] = useState("");
  const [importSuccessMsg, setImportSuccessMsg] = useState("");
  const [importErrorMsg, setImportErrorMsg] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Track which word card currently has its hiragana example sentence revealed
  const [revealedHiraganaSentences, setRevealedHiraganaSentences] = useState<Record<number, boolean>>({});

  const toggleSentenceHiragana = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedHiraganaSentences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Load user streak and sketch statistics
  const metrics = useMemo(() => {
    return getStreakData();
  }, [kotobaList]);

  // Extract list of all unique "Bagian" (days) present in the database, sorted logically
  const allDays = useMemo(() => {
    const set = new Set<string>();
    kotobaList.forEach(item => {
      if (item.bagian) set.add(item.bagian.trim());
    });
    return Array.from(set).sort((a, b) => {
      // Sort days e.g., "1日目", "4日目" numerically
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [kotobaList]);

  // Filtered Kotoba list
  const filteredList = useMemo(() => {
    return kotobaList.filter(item => {
      // 1. Search Query
      const query = searchTerm.toLowerCase();
      const matchSearch = 
        item.kanji.toLowerCase().includes(query) ||
        item.hiragana.toLowerCase().includes(query) ||
        item.arti.toLowerCase().includes(query) ||
        item.contohKalimat.toLowerCase().includes(query) ||
        item.artiKalimat.toLowerCase().includes(query);
      
      // 2. Day Filter
      const matchDay = selectedBagian === "all" || item.bagian === selectedBagian;

      // 3. Status Filter (Bookmarks, learning, unlearned, etc)
      let matchStatus = true;
      if (statusFilter === "favorites") {
        matchStatus = favorites.includes(item.id);
      } else if (statusFilter === "unlearned") {
        matchStatus = !progressMap[item.id] || progressMap[item.id] === "unlearned";
      } else if (statusFilter === "learning") {
        matchStatus = progressMap[item.id] === "learning";
      } else if (statusFilter === "mastered") {
        matchStatus = progressMap[item.id] === "mastered";
      }

      return matchSearch && matchDay && matchStatus;
    });
  }, [kotobaList, searchTerm, selectedBagian, statusFilter, favorites, progressMap]);

  // Word statistics calculations
  const stats = useMemo(() => {
    const total = kotobaList.length;
    let unlearned = 0;
    let learning = 0;
    let mastered = 0;

    kotobaList.forEach(item => {
      const status = progressMap[item.id] || "unlearned";
      if (status === "unlearned") unlearned++;
      else if (status === "learning") learning++;
      else if (status === "mastered") mastered++;
    });

    return {
      total,
      unlearned,
      learning,
      mastered,
      masteryPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      learningPercent: total > 0 ? Math.round((learning / total) * 100) : 0
    };
  }, [kotobaList, progressMap]);

  // Speech helper
  const speakWord = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // CSV Importer logic
  const handleCSVImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImportErrorMsg("");
    setImportSuccessMsg("");

    if (!csvContentText.trim()) {
      setImportErrorMsg("Konten CSV tidak boleh kosong.");
      return;
    }

    try {
      const parsed = parseCSV(csvContentText);
      if (parsed.length === 0) {
        throw new Error("Format CSV tidak didukung atau tidak ada baris yang valid.");
      }

      saveKotobaData(parsed);
      setImportSuccessMsg(`Sukses mengimpor ${parsed.length} N3 Kotoba kosakata baru ke database lokal!`);
      setCsvContentText("");
      setTimeout(() => {
        onRefreshData();
        setShowImportPanel(false);
        setImportSuccessMsg("");
      }, 1800);
    } catch (err: any) {
      setImportErrorMsg(err.message || "Gagal mengurai file CSV. Pastikan kolom sesuai petunjuk.");
    }
  };

  const handleResetData = () => {
    if (confirm("Apakah Anda yakin ingin mengembalikan database Kotoba ke data default (500+ N3 Kata)?")) {
      resetKotobaData();
      onRefreshData();
      alert("Database dikembalikan ke awal!");
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContentText(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="kotoba-dashboard-hub" className="space-y-6">
      
      {/* 1. Header Hero with user stats banner (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak Bento Column with elegant gold gradient */}
        <div id="streak-card" className="bg-gradient-to-br from-brand-gold to-amber-600 rounded-2xl p-5 text-dark-bg shadow-md flex flex-col justify-between border border-brand-gold/30">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-dark-bg/10 rounded-xl">
              <Zap size={20} className="text-dark-bg fill-dark-bg" />
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-dark-bg/15 rounded-full font-mono uppercase tracking-wider">
              Streak
            </span>
          </div>
          <div className="mt-4">
            <p className="text-5xl font-extrabold font-mono tracking-tight text-dark-bg">{metrics.streak || 0}</p>
            <p className="text-xs text-dark-bg/90 font-bold mt-1">Hari beruntun aktif Anda!</p>
          </div>
        </div>

        {/* Word Progress Stats Card - Sophisticated Dark panel */}
        <div id="mastery-card" className="bg-dark-panel rounded-2xl p-5 shadow-sm border border-white/10 flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <BookOpen size={16} className="text-brand-gold" />
                <span className="text-sm font-semibold text-[#E2E8F0]">Kemajuan N3 Kotoba</span>
              </div>
              <span className="text-xs font-mono font-medium text-white/40">
                {stats.mastered} / {stats.total} Kata
              </span>
            </div>
            {/* Custom Multi-Color Progress Indicator */}
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex mb-2 border border-white/5">
              <div 
                style={{ width: `${stats.masteryPercent}%` }} 
                className="bg-emerald-500 h-full transition-all duration-500" 
                title={`${stats.mastered} kata mahir`}
              />
              <div 
                style={{ width: `${stats.learningPercent}%` }} 
                className="bg-brand-gold h-full transition-all duration-500" 
                title={`${stats.learning} kata dipelajari`}
              />
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-white/60">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                Mahir: <strong className="font-bold text-[#E2E8F0]">{stats.masteryPercent}%</strong>
              </span>
              <span className="flex items-center gap-1.5 text-white/60">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold block" />
                Dipelajari: <strong className="font-bold text-[#E2E8F0]">{stats.learningPercent}%</strong>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-white/40 pt-3 border-t border-white/5 leading-relaxed">
            Hafalkan kata dan tingkatkan statusnya untuk meraih skor kemajuan 100%!
          </p>
        </div>

        {/* Kanji Calligraphy Stats Card in Gold Accent Outline */}
        <div id="calligraphy-card" className="bg-dark-panel rounded-2xl p-5 shadow-sm border border-white/10 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="p-2 bg-white/5 rounded-xl border border-white/10">
              <Award size={18} className="text-brand-gold" />
            </span>
            <span className="text-xs font-mono font-medium text-white/40 uppercase tracking-widest">Calligraphy</span>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-extrabold text-[#E2E8F0]">{metrics.averageDrawingScore || 0}%</p>
            <p className="text-xs text-white/40 mt-1">Akurasi Menggambar ({metrics.charactersDrawn || 0} Kanji)</p>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
            <div 
              style={{ width: `${metrics.averageDrawingScore || 0}%` }} 
              className="bg-brand-gold h-full rounded-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Primary Filtering Area - matching Sleek Dark palette */}
      <div className="bg-dark-panel rounded-xl p-4 shadow-md border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kanji, hiragana, contoh kalimat, atau arti bahasa Indonesia..."
            className="w-full pl-10 pr-4 py-2 bg-dark-bg/60 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm text-[#E2E8F0] placeholder-white/30"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Day filter */}
          <div id="day-filter" className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[130px]">
            <Calendar size={14} className="text-white/40" />
            <select
              value={selectedBagian}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-white/80 outline-none w-full border-0 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all" className="bg-dark-panel text-white">Semua Hari / Bagian</option>
              {allDays.map(day => (
                <option key={day} value={day} className="bg-dark-panel text-white">{day}</option>
              ))}
            </select>
          </div>

          {/* Status learning filter */}
          <div id="status-filter" className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            <Filter size={14} className="text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-white/80 outline-none border-0 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all" className="bg-dark-panel text-white">Semua Status</option>
              <option value="unlearned" className="bg-dark-panel text-white">Belum Belajar</option>
              <option value="learning" className="bg-dark-panel text-white">Sedang Belajar</option>
              <option value="mastered" className="bg-dark-panel text-white">Hafal (Sudah Mahir)</option>
              <option value="favorites" className="bg-dark-panel text-white">Difavoritkan (★)</option>
            </select>
          </div>

          {/* Grid/List layout toggle */}
          <div className="flex border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-brand-gold text-dark-bg shadow-sm" : "text-white/40 hover:bg-white/5"}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-brand-gold text-dark-bg shadow-sm" : "text-white/40 hover:bg-white/5"}`}
            >
              <List size={14} />
            </button>
          </div>

          {/* CSV Import Trigger Button */}
          <button
            onClick={() => setShowImportPanel(!showImportPanel)}
            className="flex items-center gap-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-brand-gold hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm border border-white/10 cursor-pointer"
          >
            <Upload size={13} />
            <span>Kustomisasi CSV</span>
          </button>
        </div>
      </div>

      {/* 3. CSV Customizer Expansion Panel - Dark brushed gold flavor */}
      {showImportPanel && (
        <div id="csv-import-module" className="bg-dark-panel border border-brand-gold/20 rounded-2xl p-5 shadow-md transition-all animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-brand-gold" size={20} />
              <div>
                <h4 className="font-bold text-[#E2E8F0] text-sm">Ganti atau Tambah Database Kotoba</h4>
                <p className="text-xs text-white/40 mt-0.5">Urutkan kolom CSV Anda agar sesuai struktur standard pelajaran.</p>
              </div>
            </div>
            <button
              onClick={handleResetData}
              className="text-xs font-extrabold text-red-400 hover:underline flex items-center gap-1 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-red-500/30"
            >
              <RotateCcw size={12} />
              Revert Default
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 text-xs text-white/60 space-y-2">
              <div className="bg-white/[0.02] rounded-xl p-3 border border-white/10">
                <p className="font-bold text-brand-gold flex items-center gap-1 mb-1">
                  <Info size={13} className="text-brand-gold" />
                  Struktur Urutan Kolom CSV (Wajib):
                </p>
                <ol className="list-decimal pl-4 space-y-1 mt-1 text-[11px] text-white/50">
                  <li><strong>Index</strong> (Angka unik)</li>
                  <li><strong>Halaman</strong> (Angka halaman buku)</li>
                  <li><strong>No</strong> (Nomor kata)</li>
                  <li><strong>Bagian</strong> (Misal: 4日目 atau 5日目)</li>
                  <li><strong>Kanji</strong> (Aksara Kanji utama)</li>
                  <li><strong>Hiragana</strong> (Cara baca kata)</li>
                  <li><strong>Arti</strong> (Terjemahan kata Indonesia)</li>
                  <li><strong>Contoh Kalimat</strong> (Karakter Jepang)</li>
                  <li><strong>Contoh kalimat hiragana</strong></li>
                  <li><strong>Arti Kalimat</strong> (Penuh Indonesia)</li>
                </ol>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 border border-dashed border-white/20 hover:border-brand-gold/60 bg-white/5 text-brand-gold font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-brand-gold" />
                  Sumbang berkas CSV (.csv) Anda
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <form onSubmit={handleCSVImport} className="lg:col-span-7 flex flex-col gap-3">
              <textarea
                value={csvContentText}
                onChange={(e) => setCsvContentText(e.target.value)}
                placeholder="Tempelkan/paste baris-baris data CSV Anda langsung di sini...&#10;Contoh:&#10;1,1,1,4日目,経済,けいざい,Ekonomi,国の経済u安定させることが重要です。,くにのけいざいをあんていさせることがじゅうようです。,Menstabilkan ekonomi negara adalah hal yang penting."
                rows={5}
                className="w-full bg-dark-bg/80 text-white p-3 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs font-mono placeholder-white/20"
              />
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportPanel(false)}
                  className="px-3 py-1.5 text-xs text-white/40 hover:text-white bg-transparent cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-gold text-dark-bg hover:opacity-90 text-xs font-bold rounded-lg shadow-md border border-brand-gold shadow-brand-gold/10 cursor-pointer"
                >
                  Luncurkan Database Kustom
                </button>
              </div>

              {importSuccessMsg && (
                <p className="text-xs text-emerald-400 font-semibold mt-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 animate-fadeIn">
                  {importSuccessMsg}
                </p>
              )}
              {importErrorMsg && (
                <p className="text-xs text-red-400 font-semibold mt-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30 animate-fadeIn">
                  {importErrorMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 4. Filter List Label & Summary */}
      <div className="flex justify-between items-center text-xs text-neutral-400 font-mono">
        <span>Menampilkan {filteredList.length} dari {kotobaList.length} kosakata N3</span>
        <span>Filter: Bagian ({selectedBagian}) &bull; Status ({statusFilter})</span>
      </div>

      {/* 5. Main Card Workspace container */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 bg-dark-panel border border-white/10 rounded-2xl p-6">
          <BookOpen className="mx-auto text-white/20 mb-3" size={32} />
          <h4 className="text-sm font-bold text-[#E2E8F0]">Tidak ada kosakata yang cocok</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci jangkauan pencarian Anda atau reset filter day / status pada panel di atas.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDayFilter("all");
              setStatusFilter("all");
            }}
            className="mt-4 px-3.5 py-1.5 text-xs font-bold text-dark-bg bg-brand-gold hover:opacity-90 rounded-lg transition-colors cursor-pointer"
          >
            Bersihkan Semua Filter
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Bento Responsive 3-Column Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((item) => {
            const isFav = favorites.includes(item.id);
            const status = progressMap[item.id] || "unlearned";

            // Status border class modifiers for Sophisticated Dark theme
            const borderClass = 
              status === "mastered" ? "border-emerald-500/40 bg-emerald-500/[0.02]" : 
              status === "learning" ? "border-brand-gold/40 bg-brand-gold/[0.02]" : 
              "border-white/10 hover:border-white/20 bg-dark-panel";

            return (
              <div
                key={item.id}
                onClick={() => onSelectWord(item)}
                className={`rounded-2xl border-2 ${borderClass} p-5 hover:shadow-[#DFC15D]/5 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group relative h-full`}
              >
                <div>
                  {/* Top line with Day Indicator and Favorites */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white/60 bg-white/5 border border-white/5 font-mono flex items-center gap-1">
                      <Calendar size={10} />
                      {item.bagian}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className={`p-1.5 rounded-full hover:bg-white/5 transition-colors ${isFav ? "text-brand-gold fill-brand-gold" : "text-white/20 hover:text-white/50"}`}
                      >
                        <Star size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Character Block: Display Kanji & Kana paired perfectly */}
                  <div className="mb-2">
                    <h3 className="text-2xl font-black font-sans text-white tracking-tight group-hover:text-brand-gold transition-colors">
                      {item.kanji}
                    </h3>
                    <p className="text-xs font-semibold text-brand-gold/80 mt-0.5 font-mono">
                      {item.hiragana}
                    </p>
                  </div>

                  {/* Translation */}
                  <p className="text-xs font-bold text-[#E2E8F0] leading-relaxed">
                    {item.arti}
                  </p>

                  {/* Contoh Kalimat (Example Sentence) with "Reveal Hiragana" */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono tracking-widest text-[#DFC15D]/65 uppercase flex items-center gap-1">
                        Contoh Kalimat
                        <button 
                          onClick={(e) => speakWord(revealedHiraganaSentences[item.id] ? item.contohKalimatHiragana : item.contohKalimat, e)}
                          className="p-1 text-brand-gold bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors cursor-pointer"
                          title="Putar Kalimat"
                        >
                          <Volume2 size={8} />
                        </button>
                      </span>
                      
                      <button
                        onClick={(e) => toggleSentenceHiragana(item.id, e)}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                          revealedHiraganaSentences[item.id] 
                            ? "bg-brand-gold text-dark-bg border-brand-gold" 
                            : "bg-white/5 text-[#E2E8F0] border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {revealedHiraganaSentences[item.id] ? <EyeOff size={8} /> : <Eye size={8} />}
                        <span>{revealedHiraganaSentences[item.id] ? "Kanji" : "Hiragana"}</span>
                      </button>
                    </div>

                    {revealedHiraganaSentences[item.id] ? (
                      <p className="text-xs font-sans font-extrabold text-[#DFC15D] leading-relaxed select-text bg-brand-gold/[0.03] p-2.5 rounded-lg border border-brand-gold/5">
                        {renderHighlightedText(item.contohKalimatHiragana, item.hiragana, "gold")}
                      </p>
                    ) : (
                      <p className="text-xs font-sans font-bold text-white/95 leading-relaxed select-text">
                        {renderHighlightedText(item.contohKalimat, item.kanji, "gold")}
                      </p>
                    )}

                    <div className="bg-white/[0.01] rounded-lg p-2 border border-white/5">
                      <p className="text-[11px] text-white/60 italic leading-relaxed font-serif select-text">
                        {item.artiKalimat || "Tidak ada terjemahan kalimat."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer block containing exemplary sentence trigger and study status */}
                <div className="mt-4 pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
                  {/* Speaker Pron pronunciation speech btn */}
                  <button
                    onClick={(e) => speakWord(item.kanji, e)}
                    className="p-1 px-2.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Suara Lafal"
                  >
                    <Volume2 size={10} />
                    <span>Lafal</span>
                  </button>

                  {/* Learning Status Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onUpdateProgress(item.id, status === "mastered" ? "unlearned" : "mastered")}
                      className={`text-[10px] font-bold px-2 py-1 rounded border transition-all flex items-center gap-1 cursor-pointer ${
                        status === "mastered" 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30" 
                          : "bg-white/5 text-white/50 border-white/5 hover:bg-brand-gold/10 hover:text-brand-gold hover:border-brand-gold/30"
                      }`}
                    >
                      <CheckCircle2 size={10} className={status === "mastered" ? "text-emerald-400 fill-emerald-500/20" : ""} />
                      <span>{status === "mastered" ? "Hafal!" : "Tandai"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Row-style List Layout for speed review mapping fully styled in dark theme */
        <div className="bg-dark-panel rounded-2xl shadow-md border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10 text-xs font-mono text-white/40 select-none">
                  <th className="p-3.5 pl-4">No</th>
                  <th className="p-3.5">Bagian</th>
                  <th className="p-3.5">Aksara Kanji</th>
                  <th className="p-3.5">Hiragana / Reading</th>
                  <th className="p-3.5">Terjemahan</th>
                  <th className="p-3.5 text-center">Favorit</th>
                  <th className="p-3.5 text-right pr-4">Status Studi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#E2E8F0]">
                {filteredList.map((item, index) => {
                  const isFav = favorites.includes(item.id);
                  const status = progressMap[item.id] || "unlearned";

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectWord(item)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-4 font-mono text-xs text-white/30">{index + 1}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/5 text-white/70 rounded border border-white/15 font-mono">
                          {item.bagian}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-white font-sans group-hover:text-brand-gold transition-colors">
                        {item.kanji}
                      </td>
                      <td className="p-3.5 font-mono text-xs text-brand-gold/80">{item.hiragana}</td>
                      <td className="p-3.5 max-w-[350px]">
                        <p className="text-xs font-bold text-[#E2E8F0] mb-2">{item.arti}</p>
                        
                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-mono tracking-wider text-brand-gold/80 flex items-center gap-0.5">
                              Contoh:
                              <button 
                                onClick={(e) => speakWord(revealedHiraganaSentences[item.id] ? item.contohKalimatHiragana : item.contohKalimat, e)}
                                className="p-0.5 text-brand-gold bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                              >
                                <Volume2 size={8} />
                              </button>
                            </span>
                            
                            <button
                              onClick={(e) => toggleSentenceHiragana(item.id, e)}
                              className={`px-1 rounded text-[8px] font-mono font-bold transition-all border ${
                                revealedHiraganaSentences[item.id]
                                  ? "bg-brand-gold text-dark-bg border-brand-gold"
                                  : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
                              }`}
                            >
                              {revealedHiraganaSentences[item.id] ? "Kanji" : "Hiragana"}
                            </button>
                          </div>
                          
                          {revealedHiraganaSentences[item.id] ? (
                            <p className="text-[10px] font-sans font-extrabold text-[#DFC15D] leading-normal select-text">
                              {renderHighlightedText(item.contohKalimatHiragana, item.hiragana, "gold")}
                            </p>
                          ) : (
                            <p className="text-[10px] font-sans font-bold text-white/90 leading-normal select-text">
                              {renderHighlightedText(item.contohKalimat, item.kanji, "gold")}
                            </p>
                          )}
                          
                          <p className="text-[10px] text-white/40 italic font-serif leading-normal mt-0.5 select-text">
                            {item.artiKalimat}
                          </p>
                        </div>
                      </td>
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 hover:bg-white/5 rounded-full transition-colors ${isFav ? "text-brand-gold" : "text-white/20"}`}
                        >
                          <Star size={14} className={isFav ? "fill-brand-gold" : ""} />
                        </button>
                      </td>
                      <td className="p-3.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={(e) => speakWord(item.kanji, e)}
                            className="p-1 px-2 text-[10px] text-emerald-400 bg-emerald-500/10 rounded hover:bg-emerald-500/20 border border-emerald-500/20 mr-2 cursor-pointer"
                            title="Bicara"
                          >
                            <Volume2 size={10} />
                          </button>
                          
                          <select
                            value={status}
                            onChange={(e) => onUpdateProgress(item.id, e.target.value as any)}
                            className="bg-dark-bg/85 text-[11px] font-bold text-white/80 py-1 px-2.5 rounded border border-white/10 cursor-pointer outline-none focus:ring-1 focus:ring-brand-gold"
                          >
                            <option value="unlearned" className="bg-dark-panel text-white">Belum Belajar</option>
                            <option value="learning" className="bg-dark-panel text-white">Sedang Belajar</option>
                            <option value="mastered" className="bg-dark-panel text-white">Hafal</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
