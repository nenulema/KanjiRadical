import React, { useState, useEffect } from "react";
import { BookOpen, HelpCircle, Compass, GraduationCap, ChevronRight, Layers, Award, LogIn, LogOut } from "lucide-react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { RADICALS_DATA } from "./data/radicals";
import { RadicalInfo, UserProgress } from "./types";
import ProgressReport from "./components/ProgressReport";
import RadicalList from "./components/RadicalList";
import KanjiGrid from "./components/KanjiGrid";
import KanjiDetailsModal from "./components/KanjiDetailsModal";
import QuizView from "./components/QuizView";

const LOCAL_STORAGE_KEY = "kanji-radical-explorer-progress";

const DEFAULT_PROGRESS: UserProgress = {
  learnedKanji: [],
  bookmarkedKanji: [],
  quizStats: {
    totalTaken: 0,
    correctAnswers: 0,
    streak: 0,
  },
};

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [selectedRadicalId, setSelectedRadicalId] = useState<string | null>(null);
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);
  const [selectedKanjiRadical, setSelectedKanjiRadical] = useState<RadicalInfo | null>(null);
  const [activeQuizRadicalId, setActiveQuizRadicalId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProgress;
            // Ensure data structure matches
            const mergedData = { ...DEFAULT_PROGRESS, ...data };
            setProgress(mergedData);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
          }
        } catch (error) {
          console.error("Error fetching progress from Firestore", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize and load progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error reading localStorage:", err);
    }

    // Default to the first radical "water" on boot for smooth user onboarding
    if (RADICALS_DATA.length > 0) {
      setSelectedRadicalId(RADICALS_DATA[0].id);
    }
  }, []);

  // Save progress updates to localStorage and Firestore
  const saveProgress = async (updated: UserProgress) => {
    setProgress(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error writing localStorage:", err);
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        await setDoc(docRef, updated);
      } catch (err) {
        console.error("Error saving progress to Firestore:", err);
      }
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error logging in:", error);
      alert(`Gagal login dengan Google: ${error.message}\n\nPastikan 'Google' sign-in diaktifkan di Firebase Console > Authentication.`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Toggle absolute learned status of a Kanji
  const handleToggleLearned = (kanji: string) => {
    const learned = [...progress.learnedKanji];
    const idx = learned.indexOf(kanji);
    if (idx >= 0) {
      learned.splice(idx, 1);
    } else {
      learned.push(kanji);
    }
    saveProgress({ ...progress, learnedKanji: learned });
  };

  // Toggle bookmarked status of a Kanji
  const handleToggleBookmark = (kanji: string) => {
    const bookmarks = [...progress.bookmarkedKanji];
    const idx = bookmarks.indexOf(kanji);
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
    } else {
      bookmarks.push(kanji);
    }
    saveProgress({ ...progress, bookmarkedKanji: bookmarks });
  };

  // After a quiz, record scores and update user streak stats
  const handleQuizStatsUpdate = (numCorrect: number) => {
    const stats = { ...progress.quizStats };
    stats.totalTaken += 1;
    stats.correctAnswers += numCorrect;

    // Increment streak if 3 or more answers were correct, else reset to zero
    if (numCorrect >= 3) {
      stats.streak += 1;
    } else {
      stats.streak = 0;
    }

    saveProgress({ ...progress, quizStats: stats });
  };

  // Active radical info
  const activeRadical = RADICALS_DATA.find((r) => r.id === selectedRadicalId) || null;
  const activeQuizRadical = RADICALS_DATA.find((r) => r.id === activeQuizRadicalId) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Premium Header Bar */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-650 flex items-center justify-center shadow-lg font-bold text-white select-none">
              根
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Kanji Radical Explorer
                <span className="text-[10px] bg-indigo-900/60 border border-indigo-800 text-indigo-300 font-mono px-2 py-0.5 rounded-full uppercase leading-none font-bold">
                  v3.5
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">
                Radical-based contextual kanji memorization playbook
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 hidden sm:inline-block font-mono">
              Learned: {progress.learnedKanji.length} Kanji
            </span>
            <span className="text-slate-800 hidden sm:inline-block">|</span>
            <a
              href="#about_guide"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Kanji Radical Explorer matches characters to foundational radicals. Select any radical to view list items, click characters to inspect interactive mnemonics and natural Japanese example sentences with translation details!"
                );
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Guide</span>
            </a>
            
            {user ? (
              <button
                onClick={handleLogout}
                className="text-xs text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60 px-3.5 py-2 rounded-xl cursor-pointer"
              >
                <img src={user.photoURL || ""} alt="Profile" className="w-4 h-4 rounded-full border border-rose-500/30" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="text-xs text-white transition-colors flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 px-3.5 py-2 rounded-xl cursor-pointer shadow-md shadow-indigo-900/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login (Sync)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Statistics progress overview row */}
        <section id="progress_overview" className="animate-fade-in">
          <ProgressReport
            progress={progress}
            radicals={RADICALS_DATA}
            onSelectRadical={setSelectedRadicalId}
            onSelectKanji={(kanji, rad) => {
              setSelectedKanji(kanji);
              setSelectedKanjiRadical(rad);
            }}
          />
        </section>

        {/* Studio main learning division split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Section: Radical Library Map Selector */}
          <section id="radical_library" className="lg:col-span-4 xl:col-span-4 w-full">
            <RadicalList
              radicals={RADICALS_DATA}
              selectedRadicalId={selectedRadicalId}
              onSelectRadical={setSelectedRadicalId}
              progress={progress}
            />
          </section>

          {/* Section: Active Radical Grid Workspace */}
          <section id="kanji_workspace" className="lg:col-span-8 xl:col-span-8 w-full sticky top-24">
            {activeRadical ? (
              <KanjiGrid
                radical={activeRadical}
                progress={progress}
                onSelectKanji={(kanji, rad) => {
                  setSelectedKanji(kanji);
                  setSelectedKanjiRadical(rad);
                }}
                onToggleLearned={handleToggleLearned}
                onToggleBookmark={handleToggleBookmark}
                onStartQuiz={() => setActiveQuizRadicalId(activeRadical.id)}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
                <Compass className="w-12 h-12 text-slate-650 animate-spin-slow mx-auto mb-3" />
                <h3 className="font-bold text-white text-base">Select a Radical</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Choose any of the 51 radicals in the catalog above to view, explore, and run quizzes on categorized characters.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* OVERLAY 1: ACTIVE STUDY WORKBOOK DIALOG */}
      {selectedKanji && selectedKanjiRadical && (
        <KanjiDetailsModal
          kanji={selectedKanji}
          radical={selectedKanjiRadical}
          onClose={() => {
            setSelectedKanji(null);
            setSelectedKanjiRadical(null);
          }}
          progress={progress}
          onToggleLearned={handleToggleLearned}
          onToggleBookmark={handleToggleBookmark}
          onNavigate={(newKanji) => setSelectedKanji(newKanji)}
        />
      )}

      {/* OVERLAY 2: GAMIFIED RADICAL QUIZ arena */}
      {activeQuizRadicalId && activeQuizRadical && (
        <QuizView
          radical={activeQuizRadical}
          radicals={RADICALS_DATA}
          onClose={() => setActiveQuizRadicalId(null)}
          onUpdateStats={handleQuizStatsUpdate}
        />
      )}

      {/* Footer credits bar */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-slate-455">
              Kanji Radical Explorer © 2026
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Integrates 51 key Jōyō radicals with contextual AI explanations.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              1,300+ Jōyō characters
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Progress auto-saved locally
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
