import React, { useState, useMemo } from "react";
import { Search, Compass, BookOpen, Layers } from "lucide-react";
import { RadicalInfo, UserProgress } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface RadicalListProps {
  radicals: RadicalInfo[];
  selectedRadicalId: string | null;
  onSelectRadical: (radicalId: string) => void;
  progress: UserProgress;
}

export default function RadicalList({
  radicals,
  selectedRadicalId,
  onSelectRadical,
  progress,
}: RadicalListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();

  const filteredRadicals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return radicals;

    return radicals.filter((r) => {
      // Show radical if matches name, symbol, variants, or if it contains a kanji matching search
      const matchesName = r.name.toLowerCase().includes(term);
      const matchesSymbol = r.symbol.includes(term);
      const matchesVariants = r.variants.some((v) => v.includes(term));
      const containsKanji = r.kanjiList.some((k) => k === term); // exact kanji search is extremely robust

      return matchesName || matchesSymbol || matchesVariants || containsKanji;
    });
  }, [radicals, searchTerm]);

  // Compute learned stats for each radical
  const getLearnedCount = (radical: RadicalInfo) => {
    return radical.kanjiList.filter((k) => progress.learnedKanji.includes(k)).length;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            {t("ui_radical_library")}
          </h2>
          <p className="text-xs text-slate-400">
            {t("ui_radical_desc").replace("51", radicals.length.toString())}
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative max-w-sm w-full md:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("ui_search_radical")}
            className="w-full bg-slate-800 border border-slate-705 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Grid listing */}
      {filteredRadicals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <BookOpen className="w-12 h-12 mb-2 opacity-30" />
          <p className="text-sm">No radicals match your query.</p>
          <p className="text-xs text-slate-600 mt-1">Try searching a different symbol or a specific Kanji.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5 overflow-y-auto max-h-[640px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredRadicals.map((radical) => {
            const learned = getLearnedCount(radical);
            const total = radical.kanjiList.length;
            const completionPercent = Math.round((learned / total) * 100);
            const isSelected = selectedRadicalId === radical.id;

            return (
              <button
                key={radical.id}
                onClick={() => onSelectRadical(radical.id)}
                className={`text-left p-4 rounded-xl border flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? "bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/20"
                    : "bg-slate-800/40 border-slate-750 hover:bg-slate-800 hover:border-slate-700 hover:shadow-sm"
                }`}
              >
                {/* Visual decoration overlay */}
                <div translate="no" className="absolute -top-6 -right-6 text-6xl font-bold text-slate-800/20 group-hover:text-slate-800/30 transition-all pointer-events-none select-none font-sans">
                  {radical.symbol}
                </div>

                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span translate="no" className="text-3xl font-bold text-sky-400 group-hover:scale-110 transition-transform duration-350 select-none">
                      {radical.symbol}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-white group-hover:text-sky-305 transition-colors leading-tight">
                        {radical.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {radical.variants.length > 0 &&
                          `Variants: ${radical.variants.join(", ")}`}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 line-clamp-2 h-8 leading-snug">
                    {radical.meaning}
                  </p>
                </div>

                <div>
                  {/* Status meter */}
                  <div className="flex items-center justify-between text-[10px] text-slate-450 font-mono mb-1">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-500" />
                      {total} Kanji
                    </span>
                    <span>{learned}/{total} {t("ui_learned")}</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, completionPercent)}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
