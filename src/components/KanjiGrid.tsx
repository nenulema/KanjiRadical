import React, { useState, useMemo } from "react";
import { Check, Star, Filter, GraduationCap, Grid, Info } from "lucide-react";
import { RadicalInfo, UserProgress } from "../types";

interface KanjiGridProps {
  radical: RadicalInfo;
  progress: UserProgress;
  onSelectKanji: (kanji: string, radical: RadicalInfo) => void;
  onToggleLearned: (kanji: string) => void;
  onToggleBookmark: (kanji: string) => void;
  onStartQuiz: () => void;
}

type FilterType = "all" | "learned" | "unlearned" | "bookmarked";

export default function KanjiGrid({
  radical,
  progress,
  onSelectKanji,
  onToggleLearned,
  onToggleBookmark,
  onStartQuiz,
}: KanjiGridProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredKanji = useMemo(() => {
    let list = radical.kanjiList;

    // Filter by search query
    if (searchQuery.trim()) {
      list = list.filter((k) => k.includes(searchQuery.trim()));
    }

    // Filter by category status
    switch (filter) {
      case "learned":
        return list.filter((k) => progress.learnedKanji.includes(k));
      case "unlearned":
        return list.filter((k) => !progress.learnedKanji.includes(k));
      case "bookmarked":
        return list.filter((k) => progress.bookmarkedKanji.includes(k));
      default:
        return list;
    }
  }, [radical, filter, searchQuery, progress]);

  const learnedCount = useMemo(() => {
    return radical.kanjiList.filter((k) => progress.learnedKanji.includes(k)).length;
  }, [radical, progress]);

  const totalCount = radical.kanjiList.length;
  const progressPercent = Math.round((learnedCount / totalCount) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col h-full">
      {/* Header section representing selected radical details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-sky-400/10 border border-sky-550/30 flex items-center justify-center text-4xl font-extrabold text-sky-400 font-sans shadow-inner select-none">
            {radical.symbol}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{radical.name} Radical</h2>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {radical.symbol} {radical.variants.length > 0 && `(${radical.variants.join(", ")})`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {radical.description}
            </p>
          </div>
        </div>

        {/* Action Button: Start interactive quiz */}
        <button
          onClick={onStartQuiz}
          disabled={radical.kanjiList.length === 0}
          className="bg-indigo-600 hover:bg-indigo-750 disabled:opacity-40 text-white font-medium text-xs px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2 self-start md:self-center shrink-0 uppercase tracking-wider"
        >
          <GraduationCap className="w-4.5 h-4.5" />
          Quiz Radical ({totalCount})
        </button>
      </div>

      {/* Progress metrics and filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Statistics info */}
        <div className="flex items-center space-x-4 shrink-0">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-bold text-emerald-400">{learnedCount}</span>
            <span className="text-xs text-slate-500">/</span>
            <span className="text-xs text-slate-400">{totalCount} Learned</span>
          </div>
          <span className="text-slate-750 text-xs">|</span>
          <span className="text-xs text-slate-400 font-mono font-medium">{progressPercent}% Mastered</span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-750 focus:border-indigo-505 outline-none rounded-xl text-xs py-2 px-3 text-slate-100 placeholder-slate-500 h-9 transition-colors"
          />

          <div className="bg-slate-850 border border-slate-750 p-1 rounded-xl flex items-center space-x-1 h-9">
            {(["all", "learned", "unlearned", "bookmarked"] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer capitalize ${
                  filter === type
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of actual Kanji characters */}
      {filteredKanji.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 border border-dashed border-slate-801 rounded-xl">
          <Info className="w-10 h-10 mb-2 opacity-30 text-indigo-400" />
          <p className="text-sm">No characters found for this status.</p>
          <p className="text-xs text-slate-600 mt-1">Try modifying your query or select custom filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 overflow-y-auto max-h-[380px] p-1 pr-2">
          {filteredKanji.map((char) => {
            const isLearned = progress.learnedKanji.includes(char);
            const isBookmarked = progress.bookmarkedKanji.includes(char);

            return (
              <div
                key={char}
                className={`relative rounded-xl border p-2 flex flex-col items-center justify-center aspect-square select-none cursor-pointer group hover:scale-[1.03] transition-all duration-200 ${
                  isLearned
                    ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/70 text-emerald-100"
                    : "bg-slate-800/40 border-slate-750 hover:bg-slate-850 hover:border-slate-700 text-slate-100"
                }`}
                onClick={() => onSelectKanji(char, radical)}
              >
                {/* Kanji character displayed large */}
                <span className="text-3xl font-extrabold tracking-normal font-sans group-hover:scale-110 transition-transform duration-250 select-none">
                  {char}
                </span>

                {/* Microstatus Indicators in top corners */}
                <div className="absolute top-1 right-1 flex space-x-0.5">
                  {isBookmarked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(char);
                      }}
                      className="text-amber-400 hover:text-amber-500 transition-colors p-0.5 rounded"
                      title="Bookmarked"
                    >
                      <Star className="w-3 h-3 fill-amber-400" />
                    </button>
                  )}
                  {isLearned && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLearned(char);
                      }}
                      className="text-emerald-400 hover:text-emerald-505 transition-colors p-0.5 rounded"
                      title="Learned"
                    >
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </button>
                  )}
                </div>

                {/* hover helper popup text */}
                <div className="absolute -bottom-1 opacity-0 group-hover:opacity-100 group-hover:-bottom-1.5 transition-all text-[8px] bg-slate-950 text-slate-300 px-1 py-0.5 rounded font-mono shadow-md pointer-events-none select-none z-10">
                  Click to learn
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
