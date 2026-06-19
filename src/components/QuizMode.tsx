/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  Check, 
  X, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  Award as Trophy, 
  BookOpen, 
  ArrowRight, 
  Play, 
  Volume2, 
  AlertCircle,
  BookmarkPlus,
  Compass
} from "lucide-react";
import { KotobaItem } from "../data/kotobaDb";

interface QuizModeProps {
  kotobaList: KotobaItem[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onBackToDashboard: () => void;
}

interface Question {
  type: "kanji-to-meaning" | "hiragana-to-kanji" | "fill-sentence";
  wordItem: KotobaItem;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  exampleSentenceRaw?: string;
  exampleSentenceHiragana?: string;
  exampleSentenceTranslation?: string;
}

export default function QuizMode({
  kotobaList,
  favorites,
  onToggleFavorite,
  onBackToDashboard
}: QuizModeProps) {
  // Extract all unique sections/parts (Bagian)
  const allParts = useMemo(() => {
    const sections = new Set<string>();
    kotobaList.forEach(item => {
      if (item.bagian) sections.add(item.bagian.trim());
    });
    return Array.from(sections).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [kotobaList]);

  // Selected filter state (defaults to "all")
  const [selectedPart, setSelectedPart] = useState<string>("all");

  // Dynamic subset list based on filter
  const quizSubset = useMemo(() => {
    if (selectedPart === "all") return kotobaList;
    return kotobaList.filter(item => item.bagian === selectedPart);
  }, [kotobaList, selectedPart]);

  const [activeTab, setActiveTab] = useState<"quiz" | "match">("quiz");
  
  // Game 1: Multiple Choice Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [failedWords, setFailedWords] = useState<KotobaItem[]>([]);

  // Game 2: Match Match Game State
  const [japaneseCards, setJapaneseCards] = useState<{ id: number; text: string; matched: boolean }[]>([]);
  const [indonesianCards, setIndonesianCards] = useState<{ id: number; text: string; matched: boolean }[]>([]);
  const [selectedJapanese, setSelectedJapanese] = useState<number | null>(null);
  const [selectedIndonesian, setSelectedIndonesian] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [matchWins, setMatchWins] = useState(false);

  // Generate Questions helper
  const initializeQuiz = () => {
    if (quizSubset.length === 0) return;
    
    // Pick 10 random items or max subset length
    const totalQuestions = Math.min(10, quizSubset.length);
    const shuffledList = [...quizSubset].sort(() => Math.random() - 0.5);
    const selectedSubset = shuffledList.slice(0, totalQuestions);

    const generatedQuestions = selectedSubset.map((wordItem): Question => {
      // Pick question type randomly
      const randTypeIdx = Math.floor(Math.random() * 3);
      const questionTypes: Question["type"][] = ["kanji-to-meaning", "hiragana-to-kanji", "fill-sentence"];
      const type = questionTypes[randTypeIdx];

      // Populate dummy options
      const decidersSet = new Set<string>();
      let correctAnswer = "";
      let prompt = "";

      if (type === "kanji-to-meaning") {
        correctAnswer = wordItem.arti;
        prompt = `Apakah arti dari kosa kata: "${wordItem.kanji}" (${wordItem.hiragana})?`;
        decidersSet.add(correctAnswer);

        // Fill remaining 3 random options from global list to ensure variety
        while (decidersSet.size < Math.min(4, kotobaList.length)) {
          const randItem = kotobaList[Math.floor(Math.random() * kotobaList.length)];
          decidersSet.add(randItem.arti);
        }
      } else if (type === "hiragana-to-kanji") {
        correctAnswer = wordItem.kanji;
        prompt = `Pilihlah penulisan Kanji yang tepat untuk pembacaan hiragana: "${wordItem.hiragana}"`;
        decidersSet.add(correctAnswer);

        while (decidersSet.size < Math.min(4, kotobaList.length)) {
          const randItem = kotobaList[Math.floor(Math.random() * kotobaList.length)];
          decidersSet.add(randItem.kanji);
        }
      } else {
        // Find example sentence missing target
        correctAnswer = wordItem.kanji;
        const sentenceSplit = wordItem.contohKalimat.replace(wordItem.kanji, " [____] ");
        prompt = `Lengkapi kalimat rumpang berikut: \n"${sentenceSplit}"`;
        decidersSet.add(correctAnswer);

        while (decidersSet.size < Math.min(4, kotobaList.length)) {
          const randItem = kotobaList[Math.floor(Math.random() * kotobaList.length)];
          decidersSet.add(randItem.kanji);
        }
      }

      return {
        type,
        wordItem,
        prompt,
        choices: Array.from(decidersSet).sort(() => Math.random() - 0.5),
        correctAnswer,
        exampleSentenceRaw: wordItem.contohKalimat,
        exampleSentenceHiragana: wordItem.contohKalimatHiragana,
        exampleSentenceTranslation: wordItem.artiKalimat
      };
    });

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerRevealed(false);
    setScoreCount(0);
    setIsQuizCompleted(false);
    setFailedWords([]);
  };

  // Generate Connecting matching cards game helper
  const initializeMatchingGame = () => {
    if (quizSubset.length === 0) return;
    const size = Math.min(4, quizSubset.length);
    const shuffledList = [...quizSubset].sort(() => Math.random() - 0.5).slice(0, size);

    const jpCards = shuffledList.map(item => ({
      id: item.id,
      text: `${item.kanji} (${item.hiragana})`,
      matched: false
    })).sort(() => Math.random() - 0.5);

    const indoCards = shuffledList.map(item => ({
      id: item.id,
      text: item.arti,
      matched: false
    })).sort(() => Math.random() - 0.5);

    setJapaneseCards(jpCards);
    setIndonesianCards(indoCards);
    setSelectedJapanese(null);
    setSelectedIndonesian(null);
    setMatchCount(0);
    setMatchWins(false);
  };

  // Initialize both games on load and when subset filter changes
  useEffect(() => {
    initializeQuiz();
    initializeMatchingGame();
  }, [quizSubset]);

  // Handle choice submission
  const handleAnswerSelect = (option: string) => {
    if (answerRevealed) return;
    setSelectedAnswer(option);
    setAnswerRevealed(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (option === currentQuestion.correctAnswer) {
      setScoreCount(prev => prev + 1);
    } else {
      setFailedWords(prev => [...prev, currentQuestion.wordItem]);
    }
  };

  // Move to next question or complete
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerRevealed(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  // Click card connections logic
  const handleJpCardClick = (id: number) => {
    if (japaneseCards.find(c => c.id === id)?.matched) return;
    setSelectedJapanese(id);

    // If an indonesian card is already selected, try to match
    if (selectedIndonesian !== null) {
      checkCardMatch(id, selectedIndonesian);
    }
  };

  const handleIndoCardClick = (id: number) => {
    if (indonesianCards.find(c => c.id === id)?.matched) return;
    setSelectedIndonesian(id);

    if (selectedJapanese !== null) {
      checkCardMatch(selectedJapanese, id);
    }
  };

  const checkCardMatch = (jpId: number, indoId: number) => {
    if (jpId === indoId) {
      // Connect correct match!
      setJapaneseCards(prev => prev.map(c => c.id === jpId ? { ...c, matched: true } : c));
      setIndonesianCards(prev => prev.map(c => c.id === indoId ? { ...c, matched: true } : c));
      setMatchCount(prev => prev + 1);
      
      const newCount = matchCount + 1;
      if (newCount === japaneseCards.length) {
        setMatchWins(true);
      }
    } else {
      // Wrong connection shake feedback triggers
      const elements = document.querySelectorAll(".connect-card");
      elements.forEach(el => el.classList.add("animate-shake"));
      setTimeout(() => {
        elements.forEach(el => el.classList.remove("animate-shake"));
      }, 500);
    }
    
    // Clear selection buffer after match attempt
    setSelectedJapanese(null);
    setSelectedIndonesian(null);
  };

  const voicePronunciation = (txt: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(txt);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div id="quiz-and-challenge-mode" className="space-y-6">
      {/* Mode selectors & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-2xl mx-auto">
        <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto border border-white/10">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 sm:flex-initial py-1.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "quiz" ? "bg-brand-gold text-dark-bg shadow-sm font-black" : "text-white/50 hover:text-white"
            }`}
          >
            <HelpCircle size={14} />
            Pilihan Ganda
          </button>
          <button
            onClick={() => setActiveTab("match")}
            className={`flex-1 sm:flex-initial py-1.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "match" ? "bg-brand-gold text-dark-bg shadow-sm font-black" : "text-white/50 hover:text-white"
            }`}
          >
            <Compass size={14} />
            Hubungkan Kartu
          </button>
        </div>

        {/* Part selector dropdown */}
        <div className="flex items-center gap-1.5 bg-dark-panel px-3 py-1.5 rounded-xl border border-white/10 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-[10px] font-bold text-white/50 font-mono uppercase tracking-wider">Materi Bagian:</span>
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            className="bg-transparent text-brand-gold font-bold text-xs py-0.5 px-1 outline-none cursor-pointer"
          >
            <option value="all" className="bg-dark-panel text-white">Semua Bagian</option>
            {allParts.map(part => (
              <option key={part} value={part} className="bg-dark-panel text-white">{part}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === "quiz" ? (
        /* GAME 1: PILIHAN GANDA */
        <div id="quiz-pilihan-ganda-panel" className="bg-dark-panel rounded-2xl border border-white/10 p-5 md:p-6 shadow-md max-w-2xl mx-auto animate-fadeIn">
          {quizSubset.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={28} className="text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#E2E8F0]">Bagian Belum Terisi</p>
              <p className="text-xs text-white/40 mt-1">Tidak ditemukan kosakata pada bagian atau kelompok filter ini.</p>
            </div>
          ) : !isQuizCompleted && questions.length > 0 ? (
            /* Active Question State */
            <div className="space-y-6">
              {/* Question metadata header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-brand-gold bg-white/5 border border-brand-gold/20 font-mono tracking-wider">
                  Tipe: {questions[currentQuestionIndex].type.toUpperCase().replace("-", " ")}
                </span>
                <span className="text-xs font-mono font-medium text-white/40">
                  Pertanyaan <span className="font-bold text-white/80">{currentQuestionIndex + 1}</span> dari <span className="font-bold text-white/80">{questions.length}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-gold h-full rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Prompt */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#E2E8F0] leading-relaxed font-sans select-text whitespace-pre-wrap">
                  {questions[currentQuestionIndex].prompt}
                </h3>
                {questions[currentQuestionIndex].type === "fill-sentence" && (
                  <div className="bg-white/[0.02] rounded-xl p-3 border border-white/10 inline-block w-full">
                    <p className="text-xs font-mono text-white/40">{questions[currentQuestionIndex].exampleSentenceHiragana}</p>
                    <p className="text-xs italic text-white/70 mt-1 font-serif">"{questions[currentQuestionIndex].exampleSentenceTranslation}"</p>
                  </div>
                )}
              </div>

              {/* Choices Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questions[currentQuestionIndex].choices.map((option, idx) => {
                  const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
                  const isSelected = option === selectedAnswer;
                  
                  // Styles depending on revealed state
                  let choiceClass = "border-white/10 bg-white/[0.01] text-white/80 hover:bg-white/5 hover:border-white/20";
                  if (answerRevealed) {
                    if (isCorrect) {
                      choiceClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
                    } else if (isSelected) {
                      choiceClass = "border-red-500/50 bg-red-500/10 text-red-400";
                    } else {
                      choiceClass = "border-white/5 bg-white/[0.005] text-white/20 opacity-45";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={answerRevealed}
                      className={`connect-card p-4 text-xs font-semibold rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${choiceClass}`}
                    >
                      <span className="truncate pr-2">{option}</span>
                      {answerRevealed && isCorrect && <Check size={14} className="text-emerald-400 shrink-0 ml-2" />}
                      {answerRevealed && isSelected && !isCorrect && <X size={14} className="text-red-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanatory sentence cards disclosed after revealing answers */}
              {answerRevealed && (
                <div className="bg-white/[0.02] p-4 border border-white/10 rounded-xl space-y-2 animate-fadeIn select-text">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#E2E8F0] font-sans flex items-center gap-1">
                        Kunci Jawaban: <span className="text-sm text-brand-gold px-1.5 py-0.5 bg-white/5 border border-white/15 font-black rounded">{questions[currentQuestionIndex].correctAnswer}</span>
                      </h4>
                      <p className="text-[11px] text-white/50 mt-1.5">
                        Hiragana: <strong className="text-brand-gold">{questions[currentQuestionIndex].wordItem.hiragana}</strong> &bull; Arti: {questions[currentQuestionIndex].wordItem.arti}
                      </p>
                    </div>
                    <button
                      onClick={() => voicePronunciation(questions[currentQuestionIndex].wordItem.kanji)}
                      className="p-1.5 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg cursor-pointer"
                      title="Pelafalan"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Next navigation trigger */}
              <div className="flex justify-end pt-3 border-t border-white/5">
                {answerRevealed ? (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1 py-2 px-4 bg-brand-gold hover:opacity-90 text-dark-bg text-xs font-black rounded-xl shadow border border-brand-gold transition cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <p className="text-xs italic text-white/30">Pilihlah salah satu jawaban di atas untuk melanjutkan...</p>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Score Summary completed state */
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-sm">
                  <Trophy size={48} className="text-brand-gold animate-bounce" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#E2E8F0]">Ujian Kotoba Selesai!</h3>
                <p className="text-sm text-white/40">Anda berhasil merampungkan sesi evaluasi kosakata N3.</p>
              </div>

              {/* Score Badge */}
              <div className="bg-white/[0.02] border border-white/10 max-w-xs mx-auto rounded-2xl p-4 shadow-inner">
                <p className="text-xs font-mono font-medium text-white/40 uppercase tracking-wider">Skor Akhir Ujian</p>
                <p className="text-4xl font-extrabold text-brand-gold mt-1 font-mono">{scoreCount}0 <span className="text-xs text-white/40 font-bold block mt-0.5">( {scoreCount} dari {questions.length} Benar)</span></p>
              </div>

              {/* Retrying & Bookmark options if failed words exist */}
              {failedWords.length > 0 ? (
                <div className="space-y-3 max-w-md mx-auto text-left select-text">
                  <h4 className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-red-400" />
                    Kata yang perlu Anda ulas lagi:
                  </h4>
                  <div className="bg-white/[0.01] border border-white/10 rounded-xl divide-y divide-white/5 text-xs overflow-hidden">
                    {failedWords.map(word => (
                      <div key={word.id} className="p-3 flex justify-between items-center hover:bg-white/5 transition-colors">
                        <div>
                          <strong className="font-sans font-bold text-[#E2E8F0]">{word.kanji}</strong>{" "}
                          <span className="text-white/40 font-mono">({word.hiragana})</span>
                          <span className="text-white/60 block text-[11px] font-semibold mt-0.5">{word.arti}</span>
                        </div>
                        <button
                          onClick={() => onToggleFavorite(word.id)}
                          className={`p-1.5 text-xs font-bold rounded-lg transition border flex items-center gap-1 cursor-pointer ${
                            favorites.includes(word.id)
                              ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30 hover:bg-brand-gold/20"
                              : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                          }`}
                        >
                          <BookmarkPlus size={11} />
                          <span>{favorites.includes(word.id) ? "Bookmarked" : "Simpan"}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-bold max-w-sm mx-auto">
                  🎉 Luar biasa! Seluruh pertanyaan dijawab dengan akurat.
                </div>
              )}

              <div className="flex justify-center gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={onBackToDashboard}
                  className="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition cursor-pointer"
                >
                  Kembali ke Dasbor
                </button>
                <button
                  onClick={initializeQuiz}
                  className="px-4 py-2 bg-brand-gold hover:opacity-90 text-dark-bg rounded-xl text-xs font-bold shadow-sm transition border border-brand-gold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  Ambil Kuis Lagi
                </button>
              </div>

            </div>
          )}
        </div>
      ) : (
        /* GAME 2: HUBUNGKAN KARTU MATCH GAME */
        <div id="match-card-game-panel" className="bg-dark-panel rounded-2xl border border-white/10 p-5 md:p-6 shadow-md max-w-3xl mx-auto space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-[#E2E8F0] flex items-center justify-center gap-1.5">
              <Compass size={18} className="text-brand-gold" />
              Menghubungkan Kanji-Arti (N3 Connect)
            </h3>
            <p className="text-xs text-white/40">Hubungkan setiap kosa kata Kanji di sebelah kiri dengan arti bahasa Indonesia yang tepat!</p>
          </div>

          {quizSubset.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={28} className="text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#E2E8F0]">Bagian Belum Terisi</p>
              <p className="text-xs text-white/40 mt-1">Tidak ditemukan kosakata pada bagian atau kelompok filter ini.</p>
            </div>
          ) : matchWins ? (
            <div className="text-center py-8 space-y-4 animate-[#a3e635]">
              <Award className="text-brand-gold mx-auto animate-bounce" size={40} />
              <h4 className="text-base font-bold text-[#E2E8F0]">Selamat! Sesi Match Selesai.</h4>
              <p className="text-xs text-white/50">Anda berhasil menghubungkan semua kata dengan 100% akurat.</p>
              
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={onBackToDashboard}
                  className="px-4 py-1.5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/5 cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  onClick={initializeMatchingGame}
                  className="px-4 py-1.5 bg-brand-gold hover:opacity-90 text-dark-bg rounded-lg text-xs font-black cursor-pointer border border-brand-gold shadow"
                >
                  Mainkan Lagi
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              
              {/* Japanese Col (Left) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase text-center block">Japanese Kanji List</span>
                {japaneseCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleJpCardClick(card.id)}
                    disabled={card.matched}
                    className={`connect-card w-full p-4 rounded-xl border-2 text-left font-sans text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      card.matched 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 opacity-40 cursor-not-allowed" 
                        : selectedJapanese === card.id
                          ? "bg-[#DFC15D]/10 border-brand-gold text-brand-gold ring-2 ring-brand-gold/20"
                          : "bg-white/[0.01] border-white/10 text-[#E2E8F0] hover:bg-white/5 hover:border-white/20 shadow-sm"
                    }`}
                  >
                    <span>{card.text}</span>
                    {card.matched && <Check size={14} className="text-emerald-400" />}
                  </button>
                ))}
              </div>

              {/* Indonesian col (Right) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase text-center block">Arti Indonesia List</span>
                {indonesianCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleIndoCardClick(card.id)}
                    disabled={card.matched}
                    className={`connect-card w-full p-4 rounded-xl border-2 text-left font-semibold text-xs transition-all flex items-center justify-between cursor-pointer ${
                      card.matched 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 opacity-40 cursor-not-allowed" 
                        : selectedIndonesian === card.id
                          ? "bg-[#DFC15D]/10 border-[#DFC15D] text-brand-gold ring-2 ring-brand-gold/20"
                          : "bg-white/[0.01] border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20 shadow-sm"
                    }`}
                  >
                    <span>{card.text}</span>
                    {card.matched && <Check size={14} className="text-emerald-400" />}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* Quick reset inside matches panel */}
          {!matchWins && (
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                onClick={initializeMatchingGame}
                className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
              >
                <RefreshCw size={12} />
                Acak & Atur Ulang Kartu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
