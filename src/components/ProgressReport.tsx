import React from "react";
import { Bookmark, CheckCircle2, Award, Sparkles, BookOpen } from "lucide-react";
import { RadicalInfo, UserProgress } from "../types";

interface ProgressReportProps {
  progress: UserProgress;
  radicals: RadicalInfo[];
  onSelectRadical: (radicalId: string) => void;
  onSelectKanji: (kanji: string, radical: RadicalInfo) => void;
}

export default function ProgressReport({
  progress,
  radicals,
  onSelectRadical,
  onSelectKanji,
}: ProgressReportProps) {
  const totalKanjiInDataset = radicals.reduce((acc, rad) => acc + rad.kanjiList.length, 0);
  const learnedCount = progress.learnedKanji.length;
  const bookmarkedCount = progress.bookmarkedKanji.length;

  const totalProgressPercentage = totalKanjiInDataset > 0
    ? Math.round((learnedCount / totalKanjiInDataset) * 100)
    : 0;

  // Find which radical each bookmarked kanji belongs to, so clicking a bookmark works instantly
  const handleBookmarkClick = (kanji: string) => {
    const parentRadical = radicals.find((r) => r.kanjiList.includes(kanji));
    if (parentRadical) {
      onSelectKanji(kanji, parentRadical);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Overall Progress Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 flex flex-col justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Overall Mastery
            </h3>
            <Award className="w-5 h-5 text-amber-400" />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold tracking-tight text-white">
              {totalProgressPercentage}%
            </span>
            <span className="text-slate-400 text-sm">
              ({learnedCount} / {totalKanjiInDataset} Kanji)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-450 to-emerald-450 h-full rounded-full transition-all duration-550 ease-out"
              style={{ width: `${Math.max(3, totalProgressPercentage)}%` }}
            ></div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          Unlock achievements as you read more. Choose any radical group below to start practicing.
        </p>
      </div>

      {/* Quiz statistics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 flex flex-col justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Quiz Records
            </h3>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-slate-800/40 p-3 rounded-xl border border-slate-805/50">
              <span className="block text-xl font-bold text-white">
                {progress.quizStats.totalTaken}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Taken</span>
            </div>
            <div className="text-center bg-slate-800/40 p-3 rounded-xl border border-slate-805/50">
              <span className="block text-xl font-bold text-emerald-400">
                {progress.quizStats.correctAnswers}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Correct</span>
            </div>
            <div className="text-center bg-slate-800/40 p-3 rounded-xl border border-slate-805/50">
              <span className="block text-xl font-bold text-amber-400">
                {progress.quizStats.streak} 🔥
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Streak</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 mt-4 leading-relaxed flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Keep up the daily streak to solidify contextual memory.</span>
        </div>
      </div>

      {/* Bookmarks Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 flex flex-col justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Bookmarked Kanji ({bookmarkedCount})
            </h3>
            <Bookmark className="w-5 h-5 text-purple-400" />
          </div>

          {progress.bookmarkedKanji.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-slate-500 text-center">
              <BookOpen className="w-8 h-8 opacity-40 mb-1" />
              <p className="text-xs">No bookmarks saved yet.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Click the star icon on any Kanji during study.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {progress.bookmarkedKanji.map((kanji) => {
                const parentRad = radicals.find((r) => r.kanjiList.includes(kanji));
                return (
                  <button
                    key={kanji}
                    onClick={() => handleBookmarkClick(kanji)}
                    title={parentRad ? `Radical: ${parentRad.name}` : ""}
                    className="w-8 h-8 rounded-lg bg-slate-800/70 hover:bg-purple-950/40 hover:border-purple-500/50 border border-slate-700/60 flex items-center justify-center text-sm font-semibold text-purple-300 transition-all font-sans cursor-pointer hover:scale-105"
                  >
                    {kanji}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          Click any bookmarked character above to review its readings, mnemonic, and custom contextual sentences.
        </p>
      </div>
    </div>
  );
}
