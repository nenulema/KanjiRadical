import React, { useState, useEffect } from "react";
import { BunpoItem } from "../data/bunpo";
import { 
  CheckCircle2, XCircle, ArrowRight, RefreshCw, HelpCircle, 
  Award, Sparkles, AlertCircle, Bookmark, Check, HelpCircle as HelpIcon 
} from "lucide-react";

interface BunpoMCQProps {
  items: BunpoItem[];
  displayLanguage: "ID" | "EN";
  onSelectPractice?: (item: BunpoItem) => void;
}

interface Question {
  type: "blank" | "meaning" | "reverse";
  item: BunpoItem;
  prompt: string;
  subPrompt?: string; // Romaji reference
  correctAnswer: string;
  options: string[];
  explanation: string;
}

const highlightPattern = (
  text: string | undefined,
  pattern: string | undefined,
  highlightClass: string = "text-[#C2593F] font-extrabold font-serif inline-block"
) => {
  if (!text) return "";
  if (!pattern) return text;

  // Split pattern by common placeholder marks (both halfwidth and fullwidth tildes/waves, ellipses, dots, spaces, slashes)
  const partsOfPattern = pattern
    .split(/[〜～~…\s.\-、，,。\/（）()]+/g)
    .map(p => {
      if (!p) return "";
      return p
        .replace(/\(.*?\)/g, "")   // remove (latin parenthesis)
        .replace(/（.*?）/g, "")  // remove （Japanese parenthesis）
        .trim();
    })
    .filter(p => p.length > 0);

  if (partsOfPattern.length === 0) return text;

  // Sort parts by descending length so that longer ones match first
  const sortedParts = [...partsOfPattern].sort((a, b) => b.length - a.length);
  
  // Escape regex characters
  const escapedParts = sortedParts.map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
  
  // Create regex containing all parts
  const regex = new RegExp(`(${escapedParts.join("|")})`, "g");
  const segments = text.split(regex);

  if (segments.length <= 1) {
    return text;
  }

  return (
    <>
      {segments.map((segment, i) =>
        regex.test(segment) ? (
          <span key={i} className={highlightClass}>
            {segment}
          </span>
        ) : (
          segment
        )
      )}
    </>
  );
};

export default function BunpoMCQ({ items, displayLanguage, onSelectPractice }: BunpoMCQProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<{ question: Question; selected: string }[]>([]);

  // Generate a quiz set of 10 questions
  const generateQuiz = () => {
    if (!items || items.length < 4) return;

    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    const selectedBatch = shuffledItems.slice(0, Math.min(10, shuffledItems.length));

    const generated: Question[] = selectedBatch.map((item) => {
      // Choose question type randomly
      const types: ("blank" | "meaning" | "reverse")[] = ["blank", "meaning", "reverse"];
      const chosenType = types[Math.floor(Math.random() * types.length)];

      let prompt = "";
      let subPrompt = "";
      let correctAnswer = "";
      let wrongOptionsPool: string[] = [];
      let explanation = "";

      if (chosenType === "blank") {
        // Complete the sentence blank
        const blankedJa = item.exampleJa
          ? item.exampleJa.replace(item.japanese, " ________ ")
          : `${item.romaji} (____)`;
        prompt = displayLanguage === "ID" 
          ? `Lengkapi bagian rumpang pada kalimat berikut:` 
          : `Fill in the blank for the sentence:`;
        subPrompt = blankedJa;

        correctAnswer = item.japanese;
        // Collect wrong options (other grammar items' japanese forms)
        wrongOptionsPool = items
          .filter((i) => i.id !== item.id)
          .map((i) => i.japanese);
          
        explanation = displayLanguage === "ID"
          ? `Pola kalimat "${item.japanese}" (${item.romaji}) berarti "${item.meaningId}". Contoh kalimat lengkapnya: "${item.exampleJa}"`
          : `The grammar pattern "${item.japanese}" (${item.romaji}) means "${item.meaningEn}". Fully formed sentence: "${item.exampleJa}"`;

      } else if (chosenType === "meaning") {
        // Match meaning
        prompt = displayLanguage === "ID"
          ? `Apakah arti dari pola kalimat berikut: "${item.japanese}"?`
          : `What is the meaning of the grammar pattern: "${item.japanese}"?`;
        subPrompt = `Romaji: ${item.romaji}`;

        correctAnswer = displayLanguage === "ID" ? item.meaningId : item.meaningEn;
        wrongOptionsPool = items
          .filter((i) => i.id !== item.id)
          .map((i) => (displayLanguage === "ID" ? i.meaningId : i.meaningEn));
          
        explanation = displayLanguage === "ID"
          ? `Tata bahasa "${item.japanese}" mempunyai rumus "${item.formula || '-'}". Contoh: ${item.exampleJa}`
          : `Grammar structure "${item.japanese}" uses formula "${item.formula || '-'}". Example: ${item.exampleJa}`;

      } else {
        // Reverse Meaning Match: "Which grammar means XYZ?"
        const meaningText = displayLanguage === "ID" ? item.meaningId : item.meaningEn;
        prompt = displayLanguage === "ID"
          ? `Manakah pola kalimat N3 yang mengekspresikan penafsiran: "${meaningText}"?`
          : `Which N3 grammar pattern expresses the meaning: "${meaningText}"?`;
        subPrompt = "";

        correctAnswer = `${item.japanese} (${item.romaji})`;
        wrongOptionsPool = items
          .filter((i) => i.id !== item.id)
          .map((i) => `${i.japanese} (${i.romaji})`);

        explanation = displayLanguage === "ID"
          ? `Pola "${item.japanese}" merupakan jawaban tepat untuk arti "${meaningText}".`
          : `The pattern "${item.japanese}" is the correct match for "${meaningText}".`;
      }

      // Shuffle wrong options & take 3
      const chosenWrong = [...new Set(wrongOptionsPool)]
        .filter((opt) => opt !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Mix option answers
      const mixedOptions = [correctAnswer, ...chosenWrong].sort(() => Math.random() - 0.5);

      return {
        type: chosenType,
        item,
        prompt,
        subPrompt,
        correctAnswer,
        options: mixedOptions,
        explanation,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setWrongAnswers([]);
  };

  useEffect(() => {
    generateQuiz();
  }, [items, displayLanguage]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => [...prev, { question: currentQuestion, selected: option }]);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  if (!items || items.length < 4) {
    return (
      <div className="text-center py-12 text-natural-text-muted font-sans uppercase tracking-widest text-sm bg-white border border-natural-border rounded-2xl">
        {displayLanguage === "ID" 
          ? "Isi database CSV kustom terlebih dahulu untuk menghasilkan kuis dinamis!" 
          : "Please upload your custom CSV list to experience the dynamic self-quiz board!"}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (quizFinished) {
    const finalPercent = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto bg-white border border-natural-border p-8 rounded-3xl shadow-sm text-center space-y-6 animate-fade-in" id="quiz-completion-screen">
        <div className="inline-flex p-4 bg-natural-badge rounded-full text-natural-accent">
          <Award className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif font-bold text-2xl text-natural-text-dark">
            {displayLanguage === "ID" ? "Sesi Kuis Selesai! 🎉" : "Quiz Completed! 🎉"}
          </h3>
          <p className="text-xs text-natural-text-muted max-w-md mx-auto">
            {displayLanguage === "ID"
              ? "Luar biasa! Anda telah menyelesaikan set kuis pilihan ganda untuk tata bahasa N3."
              : "Great job completing the dynamic multiple choice practice board."}
          </p>
        </div>

        {/* Score Ring Display */}
        <div className="flex justify-center items-center gap-10 py-4">
          <div className="bg-natural-sidebar p-6 rounded-2xl border border-natural-border text-center min-w-[120px]">
            <span className="text-[10px] text-natural-text-muted font-bold block uppercase tracking-wider">
              {displayLanguage === "ID" ? "Skor Benar" : "Score Tally"}
            </span>
            <span className="text-3xl font-bold text-natural-text-dark font-mono block">
              {score} <span className="text-xs text-natural-text-muted">/ {questions.length}</span>
            </span>
          </div>

          <div className="bg-natural-sidebar p-6 rounded-2xl border border-natural-border text-center min-w-[120px]">
            <span className="text-[10px] text-natural-text-muted font-bold block uppercase tracking-wider">
              {displayLanguage === "ID" ? "Persentase" : "Percentage"}
            </span>
            <span className="text-3xl font-bold text-natural-accent font-mono block">
              {finalPercent}%
            </span>
          </div>
        </div>

        {/* Incorrect list review if any */}
        {wrongAnswers.length > 0 && (
          <div className="text-left border border-natural-border rounded-2xl p-5 space-y-3 bg-natural-bg/30">
            <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500" />
              {displayLanguage === "ID" ? "Ulasan Kesalahan Jawaban:" : "Mistake Review Box:"}
            </h4>
            <div className="divide-y divide-natural-border/40 max-h-48 overflow-y-auto space-y-2.5 pr-2">
              {wrongAnswers.map((item, index) => (
                <div key={index} className="pt-2 text-xs">
                  <p className="font-medium text-natural-text-dark font-serif">
                    {index + 1}. {item.question.prompt}
                  </p>
                  {item.question.subPrompt && (
                    <p className="text-[#6B695A] font-mono py-1 select-none text-[11px]">
                      {item.question.subPrompt}
                    </p>
                  )}
                  <p className="text-red-600">
                    {displayLanguage === "ID" ? "Anda memilih:" : "You chose:"} <span className="font-semibold">{item.selected}</span>
                  </p>
                  <p className="text-green-700 font-semibold">
                    {displayLanguage === "ID" ? "Kunci yang benar:" : "Correct answer:"} {item.question.correctAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={generateQuiz}
            className="flex-1 py-3 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {displayLanguage === "ID" ? "Ulangi Kuis Baru" : "Restart New Quiz"}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-natural-text-muted font-sans uppercase tracking-widest text-sm">
        {displayLanguage === "ID" ? "Merancang kuis cerdas..." : "Building intelligent exam questions..."}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-fade-in" id="quiz-mcq-workspace">
      
      {/* Quiz Progress header */}
      <div className="flex items-center justify-between font-sans text-xs text-natural-text-muted">
        <span>
          {displayLanguage === "ID" ? "Kuis Pilihan Ganda" : "Grammar Core MCQ"}
        </span>
        <span className="font-mono font-bold">
          {displayLanguage === "ID" ? "Soal " : "Question "} {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress horizontal line */}
      <div className="w-full h-1.5 bg-white border border-natural-border rounded-full overflow-hidden">
        <div 
          className="h-full bg-natural-accent transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card Box */}
      <div className="bg-white border border-natural-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-4 sm:space-y-5">
        
        {/* Prompt Header */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-natural-badge border border-natural-border rounded-full text-[9px] sm:text-[10px] text-natural-accent font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            {displayLanguage === "ID" ? `Tipe Kuis: ${currentQuestion.type === "blank" ? "Melengkapi Kalimat" : currentQuestion.type === "meaning" ? "Menebak Arti Pola" : "Pilih Pola Sesuai Arti"}` : `Quiz Type: ${currentQuestion.type}`}
          </span>
          
          <h3 className="text-base sm:text-lg font-serif font-semibold text-natural-text-dark leading-relaxed">
            {currentQuestion.prompt}
          </h3>

          {currentQuestion.subPrompt && (
            <div className="p-3 sm:p-4 bg-natural-sidebar border border-natural-border/80 rounded-xl sm:rounded-2xl text-center">
              <p className="text-lg sm:text-xl font-serif text-natural-text-dark select-none leading-relaxed tracking-wide">
                {currentQuestion.subPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {currentQuestion.options.map((option, idx) => {
            const isCorrectOption = option === currentQuestion.correctAnswer;
            const isSelectedOption = option === selectedOption;
            
            let btnStyle = "border-natural-border hover:border-natural-accent bg-white text-natural-text-dark hover:shadow-xs";
            
            if (isAnswered) {
              if (isCorrectOption) {
                btnStyle = "border-green-500 bg-green-50 text-green-950 font-bold pr-10";
              } else if (isSelectedOption) {
                btnStyle = "border-red-400 bg-red-50 text-red-950 font-medium pr-10";
              } else {
                btnStyle = "border-natural-border bg-white text-natural-text-muted/60 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionClick(option)}
                className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left text-xs sm:text-sm transition-all relative flex items-center justify-between cursor-pointer font-sans ${btnStyle}`}
              >
                <span>{option}</span>
                {isAnswered && isCorrectOption && (
                  <Check className="w-5 h-5 text-green-600 shrink-0 absolute right-4" />
                )}
                {isAnswered && isSelectedOption && !isCorrectOption && (
                  <span className="text-red-500 font-bold shrink-0 absolute right-4">&times;</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Instant feedback explanation panel */}
        {isAnswered && (
          <div className="bg-[#FDFCF0] border border-[#E6E4D5] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 animate-fade-in">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-natural-accent uppercase tracking-widest flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" />
                {displayLanguage === "ID" ? "Ulasan Kunci Jawaban / Keterangan:" : "Answer Key & Grammar Analysis:"}
              </h4>
              <p className="text-xs text-[#6B695A] font-serif leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>

            {currentQuestion.item?.exampleJa && (
              <div className="p-3 bg-white border border-natural-border/70 rounded-xl space-y-1.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-natural-text-muted block">
                  {displayLanguage === "ID" ? "Visualisasi Posisi Pola:" : "Grammar Pattern Alignment:"}
                </span>
                <p className="text-base font-serif text-natural-text-dark leading-normal">
                  {highlightPattern(currentQuestion.item.exampleJa, currentQuestion.item.japanese)}
                </p>
                {currentQuestion.item.romajiExample && (
                  <p className="text-[10px] text-[#8A8870] font-mono leading-relaxed">
                    {highlightPattern(currentQuestion.item.romajiExample, currentQuestion.item.romaji)}
                  </p>
                )}
              </div>
            )}

            {onSelectPractice && (
              <button
                onClick={() => onSelectPractice(currentQuestion.item)}
                className="mt-2 text-[10px] text-natural-accent font-bold uppercase tracking-wider underline hover:text-natural-accent-hover block cursor-pointer"
              >
                {displayLanguage === "ID" ? "Buka Latihan Tulis Pola Ini" : "Practice Writing Custom Sentence with This Pattern"} &rarr;
              </button>
            )}
          </div>
        )}

        {/* Footer actions inside the card */}
        <div className="flex justify-between items-center pt-2 border-t border-natural-border/60">
          <div>
            {isAnswered ? (
              <span className={`text-[10px] uppercase font-bold tracking-wider ${selectedOption === currentQuestion.correctAnswer ? "text-green-600" : "text-red-500"}`}>
                {selectedOption === currentQuestion.correctAnswer 
                  ? (displayLanguage === "ID" ? "Benar! +1 Poin" : "Correct! +1 Point")
                  : (displayLanguage === "ID" ? "Jawaban Anda Salah" : "Incorrect Answer")}
              </span>
            ) : (
              <span className="text-[10px] text-natural-text-muted uppercase tracking-wider flex items-center gap-1 font-medium">
                <HelpIcon className="w-3 h-3" />
                {displayLanguage === "ID" ? "Pilihlah salah satu jawaban di atas!" : "Pick any choice above to lock in!"}
              </span>
            )}
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={!isAnswered}
            className="px-6 py-2.5 bg-natural-accent hover:bg-natural-accent-hover disabled:bg-[#E6E4D5] disabled:text-[#A8A690] disabled:cursor-not-allowed text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>
              {currentIndex === questions.length - 1 
                ? (displayLanguage === "ID" ? "Selesai" : "Finish") 
                : (displayLanguage === "ID" ? "Soal Berikutnya" : "Next Question")}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
