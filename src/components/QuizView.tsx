import React, { useState, useEffect, useMemo } from "react";
import { X, CheckCircle, AlertOctagon, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import { RadicalInfo, QuizQuestion, UserProgress } from "../types";
import { FALLBACK_DICTIONARY } from "../data/fallbackDictionary";

interface QuizViewProps {
  radical: RadicalInfo;
  radicals: RadicalInfo[]; // to draw distractors from other radicals if needed
  onClose: () => void;
  onUpdateStats: (numCorrect: number) => void;
}

// Built-in educational fallback mapping for most frequent Kanji across the 51 Radicals
// to guarantee premium, high-fidelity quiz questions offline!
const KANJI_DICTIONARY_LIGHT: Record<string, { meanings: string[]; readings: string[]; definition: string }> = {
  // Water
  "水": { meanings: ["Water", "Liquid"], readings: ["スイ", "みず"], definition: "H2O, water element." },
  "海": { meanings: ["Sea", "Ocean"], readings: ["カイ", "うみ"], definition: "Saltwater bodies of ocean." },
  "活": { meanings: ["Lively", "Activity"], readings: ["カツ", "い.きる"], definition: "Life, energy, activity." },
  "汽": { meanings: ["Steam", "Vapour"], readings: ["キ"], definition: "Steam power, locomotion." },
  "池": { meanings: ["Pond", "Reservoir"], readings: ["チ", "いけ"], definition: "Small pool or pond." },
  "泳": { meanings: ["Swim", "Flit"], readings: ["エイ", "およ.ぐ"], definition: "Swimming strokes." },
  "温": { meanings: ["Warm", "Temperature"], readings: ["オン", "あたた.かい"], definition: "Warm air or liquids." },
  "漢": { meanings: ["Sino-", "China", "Man"], readings: ["カン"], definition: "Sino-Japanese kanji letters." },
  "決": { meanings: ["Decide", "Agree"], readings: ["ケツ", "き.める"], definition: "Decision, vote." },
  "湖": { meanings: ["Lake", "Basin"], readings: ["コ", "みずうみ"], definition: "Freshwater lakes." },
  "港": { meanings: ["Port", "Harbor"], readings: ["コウ", "みなと"], definition: "Seaport harbor." },
  // Person
  "人": { meanings: ["Person", "Human"], readings: ["ジン", "ひと"], definition: "Human beings or nationalities." },
  "休": { meanings: ["Rest", "Day off"], readings: ["キュウ", "やす.む"], definition: "Resting beside a tree." },
  "何": { meanings: ["What", "Which"], readings: ["カ", "なに"], definition: "Asking what or which item." },
  "会": { meanings: ["Meeting", "Association"], readings: ["カイ", "あ.う"], definition: "Gathering of members." },
  "今": { meanings: ["Now", "Present"], readings: ["コン", "いま"], definition: "Current instant." },
  "作": { meanings: ["Create", "Prepare", "Make"], readings: ["サク", "つく.る"], definition: "Making things." },
  "体": { meanings: ["Body", "Structure"], readings: ["タイ", "からだ"], definition: "Physical human body." },
  "仕": { meanings: ["Attend", "Serve"], readings: ["シ", "つか.える"], definition: "Service or working role." },
  "使": { meanings: ["Use", "Order"], readings: ["シ", "つか.う"], definition: "Utilizing tools." },
  "住": { meanings: ["Dwell", "Inhabit"], readings: ["ジュウ", "す.む"], definition: "Living in a house." },
  // Hand
  "手": { meanings: ["Hand", "Force"], readings: ["シュ", "て"], definition: "Human arm and hand." },
  "指": { meanings: ["Finger", "Point at"], readings: ["シ", "ゆび"], definition: "Fingers or point indices." },
  "持": { meanings: ["Hold", "Possess"], readings: ["ジ", "も.つ"], definition: "Holding objects." },
  "打": { meanings: ["Hit", "Strike"], readings: ["ダ", "う.つ"], definition: "Hitting balls, typing." },
  "投": { meanings: ["Throw", "Cast"], readings: ["トウ", "な.げる"], definition: "Throwing projectiles." },
  // Tree
  "木": { meanings: ["Tree", "Wood"], readings: ["モク", "き"], definition: "Trees, timber, wood panels." },
  "本": { meanings: ["Book", "Origin", "Main"], readings: ["ホン", "もと"], definition: "Origin, book files, main units." },
  "林": { meanings: ["Grove", "Thicket"], readings: ["リン", "はやし"], definition: "A light cluster of trees." },
  "森": { meanings: ["Forest", "Woods"], readings: ["シン", "もり"], definition: "A massive green woods." },
  "校": { meanings: ["School", "Exam"], readings: ["コウ"], definition: "Educational academy, school." },
  // Heart
  "心": { meanings: ["Heart", "Mind", "Spirit"], readings: ["シン", "こころ"], definition: "Emotions, brain mind, soul." },
  "思": { meanings: ["Think", "Reflect"], readings: ["シ", "おも.う"], definition: "Thoughts, reflection views." },
  "悪": { meanings: ["Bad", "Evil"], readings: ["アク", "わる.い"], definition: "Evil or improper quality." },
  "意": { meanings: ["Intent", "Meaning"], readings: ["イ"], definition: "Idea, meaning, intent." },
  // Mouth
  "口": { meanings: ["Mouth", "Opening"], readings: ["コウ", "くち"], definition: "Mouth opening or gate exit." },
  "古": { meanings: ["Old", "Epoch"], readings: ["コ", "ふる.い"], definition: "Ancient things, history items." },
  "同": { meanings: ["Same", "Equivalent"], readings: ["ドウ", "おな.じ"], definition: "Exact same identity." },
};

export default function QuizView({
  radical,
  radicals,
  onClose,
  onUpdateStats,
}: QuizViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Generate 5 random questions based on candidates inside the active radical
  useEffect(() => {
    const list = radical.kanjiList;
    if (list.length === 0) return;

    const generated: QuizQuestion[] = [];
    const size = Math.min(5, list.length);

    // Pick 'size' unique random characters
    const shuffledKanji = [...list].sort(() => 0.5 - Math.random()).slice(0, size);

    shuffledKanji.forEach((kanji, idx) => {
      const fullDict = FALLBACK_DICTIONARY[kanji];
      const lightDict = KANJI_DICTIONARY_LIGHT[kanji];
      
      const meanings = fullDict ? fullDict.meanings : (lightDict ? lightDict.meanings : ["Unknown Meaning"]);
      const readings = fullDict ? [...fullDict.readingsOn, ...fullDict.readingsKun].filter(r => r) : (lightDict ? lightDict.readings : ["Unknown Reading"]);
      
      if (readings.length === 0) readings.push("Unknown Reading");

      const qType = Math.random() > 0.5 ? "meaning" : "reading";
      let questionText = "";
      let correctAnswer = "";

      const meaningQuestions = [
        `What does the Kanji 「${kanji}」 mean?`,
        `Choose the correct English meaning for 「${kanji}」.`,
        `How would you translate the Kanji 「${kanji}」?`
      ];
      
      const readingQuestions = [
        `How do you read the Kanji 「${kanji}」?`,
        `What is the correct reading (Onyomi/Kunyomi) for 「${kanji}」?`,
        `Choose the correct pronunciation for 「${kanji}」.`
      ];

      if (qType === "meaning") {
        questionText = meaningQuestions[Math.floor(Math.random() * meaningQuestions.length)];
        correctAnswer = meanings[0];
      } else {
        questionText = readingQuestions[Math.floor(Math.random() * readingQuestions.length)];
        correctAnswer = readings[0];
      }

      // Collect distractors from FALLBACK_DICTIONARY
      const allKanjiKeys = Object.keys(FALLBACK_DICTIONARY);
      // Add light dictionary keys just in case
      Object.keys(KANJI_DICTIONARY_LIGHT).forEach(k => {
        if (!allKanjiKeys.includes(k)) allKanjiKeys.push(k);
      });
      
      const randomKeys = allKanjiKeys.sort(() => 0.5 - Math.random());
      
      const distractors = randomKeys
        .filter(k => k !== kanji)
        .map((k) => {
          const fd = FALLBACK_DICTIONARY[k];
          const ld = KANJI_DICTIONARY_LIGHT[k];
          if (qType === "meaning") {
            return fd ? fd.meanings[0] : (ld ? ld.meanings[0] : "");
          } else {
            const r = fd ? [...fd.readingsOn, ...fd.readingsKun].filter(x => x) : (ld ? ld.readings : []);
            return r.length > 0 ? r[0] : "";
          }
        })
        .filter((val, i, self) => val && self.indexOf(val) === i && val !== correctAnswer && val !== "Unknown Meaning" && val !== "Unknown Reading")
        .slice(0, 3);

      // If we don't have enough distractors, fill with fallbacks
      const fallbackMeanings = ["Power", "Mountain", "River", "Sun", "Moon", "Fire", "Gold", "Sword"];
      const fallbackReadings = ["サン", "カワ", "ニチ", "ゲツ", "ヒ", "キン", "ケン", "ジン"];
      
      while (distractors.length < 3) {
        if (qType === "meaning") {
            const fb = fallbackMeanings.find(f => !distractors.includes(f) && f !== correctAnswer) || "Energy";
            distractors.push(fb);
        } else {
            const fb = fallbackReadings.find(f => !distractors.includes(f) && f !== correctAnswer) || "ドウ";
            distractors.push(fb);
        }
      }

      // Mix option array
      const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(correctAnswer);
      
      const defStr = fullDict ? fullDict.mnemonic : (lightDict ? lightDict.definition : "A kanji character.");

      generated.push({
        id: `${kanji}-${idx}`,
        kanji,
        type: qType as any,
        questionText,
        options,
        correctIndex,
        explanation: `The kanji "${kanji}" represents "${meanings.join(", ")}" and is read as "${readings.join(", ")}". ${defStr}`,
      });
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  }, [radical]);

  const currentQuestion = questions[currentIdx];

  const handleOptionSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswered) return;
    setIsAnswered(true);

    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      // Synchronize results to main user stats and parent callback
      onUpdateStats(score + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
        
        {/* Visual progress ribbon */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-800">
          {!quizCompleted && questions.length > 0 && (
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          )}
        </div>

        {/* Header toolbar */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Interactive Radical Challenge
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* SCREEN 1: SCORECARD SUMMARY */}
        {quizCompleted ? (
          <div className="text-center py-8 space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-indigo-950/40 border-2 border-indigo-500/50 flex items-center justify-center text-5xl animate-bounce shadow-xl relative">
              <Trophy className="absolute w-12 h-12 text-amber-400 stroke-[1.5px]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Test Complete!</h2>
              <p className="text-sm text-slate-450 mt-1.5 max-w-xs mx-auto">
                Excellent effort under the <span className="text-sky-305 font-bold font-sans">{radical.symbol}</span> ({radical.name}) radical group.
              </p>
            </div>

            {/* Score statistics metrics */}
            <div className="grid grid-cols-2 gap-4 w-full bg-slate-850 p-4 border border-slate-801 rounded-2xl">
              <div className="text-center">
                <span className="block text-slate-500 text-[10px] uppercase tracking-wider font-mono">My Score</span>
                <span className="text-3xl font-extrabold text-white">
                  {score} / {questions.length}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-slate-500 text-[10px] uppercase tracking-wider font-mono">Accuracy</span>
                <span className="text-3xl font-extrabold text-emerald-400">
                  {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex w-full gap-3 mt-4">
              <button
                onClick={() => {
                  // restart
                  setQuestions([]);
                  setCurrentIdx(0);
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                  setScore(0);
                  setQuizCompleted(false);
                }}
                className="flex-1 bg-slate-800 border border-slate-701 hover:bg-slate-750 text-slate-205 text-xs font-semibold py-3.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
              >
                Restart Test
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold py-3.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors shadow-md"
              >
                Close workbook
              </button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          /* Empty / Loader panel */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
            <p className="text-xs">Assembling review card deck from radical vocabulary list...</p>
          </div>
        ) : (
          /* SCREEN 2: ACTIVE QUESTION VIEW */
          <div className="space-y-6 flex-grow flex flex-col justify-between">
            {/* Question card */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2.5 py-1 rounded-full font-semibold">
                  Question {currentIdx + 1} of {questions.length}
                </span>

                <span className="text-3xl font-extrabold text-indigo-400 animate-pulse font-sans shadow-sm select-none">
                  {currentQuestion.kanji}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white leading-relaxed">
                {currentQuestion.questionText}
              </h4>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 gap-2.5 py-4">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedAnswer === oIdx;
                const isCorrect = currentQuestion.correctIndex === oIdx;

                let btnStyles = "bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-200";

                if (isAnswered) {
                  if (isCorrect) {
                     btnStyles = "bg-emerald-950/20 border-emerald-500 text-emerald-400 font-medium scale-[1.01]";
                  } else if (isSelected) {
                     btnStyles = "bg-rose-950/20 border-rose-550 text-rose-400 font-medium line-through";
                  } else {
                     btnStyles = "bg-slate-850 opacity-40 border-slate-801 text-slate-500";
                  }
                } else if (isSelected) {
                  btnStyles = "bg-indigo-950/30 border-indigo-505 text-indigo-300 shadow-md transform translate-x-1";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(oIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-xl border text-xs transition-all duration-150 grid grid-cols-[1fr_auto] items-center cursor-pointer ${btnStyles}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {isAnswered && isSelected && !isCorrect && <AlertOctagon className="w-4 h-4 text-rose-450" />}
                  </button>
                );
              })}
            </div>

            {/* Micro actions area & explanations panel */}
            <div className="space-y-4">
              {isAnswered && (
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-805 text-[11px] text-slate-400 leading-relaxed max-h-24 overflow-y-auto">
                  <span className="font-bold text-white block mb-0.5">Tutor Explanation:</span>
                  {currentQuestion.explanation}
                </div>
              )}

              {/* Navigation button */}
              {!isAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full bg-indigo-650 hover:bg-indigo-700 disabled:opacity-45 text-white text-xs font-semibold py-4.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors shadow-lg"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold py-4.5 rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  {currentIdx + 1 < questions.length ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    "View scorecard results"
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
