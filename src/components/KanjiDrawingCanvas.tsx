/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { 
  Trash2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Volume2, 
  RefreshCw, 
  CheckCircle,
  HelpCircle,
  Award,
  ChevronRight,
  TrendingUp,
  History
} from "lucide-react";
import { addCharacterDrawn } from "../data/kotobaDb";

interface KanjiDrawingCanvasProps {
  kanji: string;
  hiragana: string;
  translation: string;
  onSuccess?: (score: number) => void;
}

interface CalligraphyEvaluation {
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  score: number;
  balanceScore: number;
  proportionScore: number;
  feedback: string;
  suggestions: string[];
}

const getFontSizePixel = (len: number) => {
  if (len <= 1) return 260;
  if (len === 2) return 160;
  if (len === 3) return 110;
  return Math.max(70, Math.round(320 / len));
};

export default function KanjiDrawingCanvas({ 
  kanji, 
  hiragana, 
  arti, 
  onSuccess 
}: { 
  kanji: string; 
  hiragana: string; 
  arti: string; 
  onSuccess?: (score: number) => void 
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [guideOpacity, setGuideOpacity] = useState<number>(30); // 0 = Blank, 15 = Transparansi Tipis, 30 = Sedang, 60 = Jelas
  const [brushSize, setBrushSize] = useState(12);
  const [localScore, setLocalScore] = useState<number | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<CalligraphyEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Cycle transparency guide opacity levels
  const cycleGuideOpacity = () => {
    setGuideOpacity((prev) => {
      if (prev === 30) return 60;
      if (prev === 60) return 0;
      if (prev === 0) return 15;
      return 30;
    });
  };

  // Play word pronunciation
  const speakWord = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(kanji);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Safe initialize canvas sizing
  useEffect(() => {
    initCanvas();
    setTouchOverrides();
  }, [kanji]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal size for high-res rendering on diverse grids
    canvas.width = 400;
    canvas.height = 400;

    // Reset parameters
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#DFC15D"; // Calligraphy Gold ink
    ctx.lineWidth = brushSize;

    setLocalScore(null);
    setAiEvaluation(null);
    setEvalError(null);
    setCanvasHistory([]);
    setHistoryIndex(-1);

    // Capture initial blank state
    saveState(canvas.toDataURL());
  };

  // Prevent sliding in mobile Safari/Chrome while drawing
  const setTouchOverrides = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const preventDefault = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };
    
    canvas.addEventListener("touchstart", preventDefault, { passive: false });
    canvas.addEventListener("touchmove", preventDefault, { passive: false });
  };

  const saveState = (dataUrl: string) => {
    const nextHistory = canvasHistory.slice(0, historyIndex + 1);
    nextHistory.push(dataUrl);
    setCanvasHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support Touch & Mouse
    let clientX = 0;
    let clientY = 0;
    
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Scale according to the client bound to internal 400x400 canvas sizes
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e.nativeEvent);
    if (!coords) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e.nativeEvent);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      saveState(canvas.toDataURL());
    }
    
    // Automatically trigger local structural rating after each drawing stroke completes
    calculateLocalScore();
  };

  // Accurate client-side stroke-overlap algorithm
  const calculateLocalScore = () => {
    const canvas = canvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!canvas || !hiddenCanvas) return;

    const ctx = canvas.getContext("2d");
    const hCtx = hiddenCanvas.getContext("2d");
    if (!ctx || !hCtx) return;

    // Set hidden reference size
    hiddenCanvas.width = 400;
    hiddenCanvas.height = 400;

    // Clean reference canvas and draw reference Kanji
    const fontSize = getFontSizePixel(kanji.length);
    hCtx.fillStyle = "#ffffff";
    hCtx.fillRect(0, 0, 400, 400);
    hCtx.fillStyle = "#000000";
    hCtx.font = `bold ${fontSize}px sans-serif`;
    hCtx.textAlign = "center";
    hCtx.textBaseline = "middle";
    hCtx.fillText(kanji, 200, 200); // Evaluate full word/kanji

    // Analyze pixel intersections to compute Intersection Over Union (IoU)
    const userImgData = ctx.getImageData(0, 0, 400, 400);
    const refImgData = hCtx.getImageData(0, 0, 400, 400);

    let matchCount = 0;
    let refPoints = 0;
    let userOutsidePoints = 0;

    // Scan bounding region
    for (let pixel = 0; pixel < userImgData.data.length; pixel += 4) {
      const userAlpha = userImgData.data[pixel + 3]; // Alpha channel (drawn pixels have opacity > 0)
      
      // reference Kanji was drawn black (#000000) on white (#FFFFFF)
      const refR = refImgData.data[pixel];
      const isRefFilled = refR < 150; // Dark pixel represents correct character outline
      const isUserFilled = userAlpha > 50;

      if (isRefFilled) {
        refPoints++;
        if (isUserFilled) {
          matchCount++;
        }
      } else if (isUserFilled) {
        // User wrote outside the lines of the target Kanji template
        userOutsidePoints++;
      }
    }

    if (refPoints === 0) {
      setLocalScore(0);
      return;
    }

    // Penalize overshoot to discourage filling the whole screen
    const rawRatio = matchCount / refPoints;
    const penaltyRatio = Math.max(0, 1 - (userOutsidePoints / (refPoints * 1.5)));
    
    // Scale and bound the score
    const finalScore = Math.min(100, Math.max(0, Math.round(rawRatio * penaltyRatio * 100)));
    setLocalScore(finalScore);

    // Save history & milestones
    if (finalScore > 40) {
      addCharacterDrawn(finalScore);
    }
  };

  const clearCanvas = () => {
    initCanvas();
  };

  const undoState = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyIndex <= 0) return;
    
    const prevIndex = historyIndex - 1;
    const prevImg = new Image();
    prevImg.src = canvasHistory[prevIndex];
    prevImg.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 400, 400);
      ctx.drawImage(prevImg, 0, 0);
      setHistoryIndex(prevIndex);
      calculateLocalScore();
    };
  };

  // Call server-side API proxy to get an evaluation from Gemini 3.5 AI Tutor
  const checkDrawingWithAI = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsEvaluating(true);
    setEvalError(null);
    setAiEvaluation(null);

    try {
      const drawnImageBase64 = canvas.toDataURL("image/png");
      
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          kanji: kanji,
          hiragana: hiragana,
          arti: arti,
          imageBase64: drawnImageBase64
        })
      });

      if (!response.ok) {
        throw new Error(`Gagal memanggil API Evaluasi Tutor AI: ${response.statusText}`);
      }

      const critiqueResult: CalligraphyEvaluation = await response.json();
      setAiEvaluation(critiqueResult);
      
      if (onSuccess && critiqueResult.score >= 50) {
        onSuccess(critiqueResult.score);
      }
    } catch (e: any) {
      console.error(e);
      setEvalError(e.message || "Terjadi kendala saat menghubungkan ke Server Tutor AI Gemini.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div id="drawing-notebook-panel" className="bg-dark-panel rounded-2xl shadow-md border border-white/10 p-5 lg:p-6 flex flex-col items-center animate-fadeIn h-full">
      {/* Canvas Drawing Section */}
      <div className="w-full flex flex-col items-center max-w-[400px] mx-auto">
        {/* Header toolbar */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-mono tracking-wider text-white/40 uppercase">
              Genkouyoushi Canvas
            </span>
            <h3 className="text-base font-semibold text-[#E2E8F0] flex items-center gap-1.5 mt-0.5">
              Tulis Karakter: <span className="text-xl font-bold font-sans text-brand-gold px-2 py-0.5 bg-white/5 border border-white/10 rounded">{kanji}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cycleGuideOpacity}
              title="Atur transparansi bayangan bantuan kanji (Sangat Jelas, Sedang, Tipis, atau Hitam Blank)"
              className={`p-2 rounded-lg transition-all border text-sm flex items-center gap-1.5 cursor-pointer ${
                guideOpacity > 0 
                  ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30 hover:bg-brand-gold/20" 
                  : "bg-white/5 text-white/50 hover:bg-white/10 border-white/10"
              }`}
            >
              {guideOpacity > 0 ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="text-xs font-bold">
                {guideOpacity === 0 ? "Bantuan: Blank" : `Bantuan: ${guideOpacity}%`}
              </span>
            </button>
            <button
              onClick={speakWord}
              title="Dengar Lafal"
              className="p-2 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>

        {/* The Writing Box in Beautiful Charcoal Minimalist Calligraphy Plate */}
        <div className="relative w-full max-w-[340px] md:max-w-[380px] aspect-square bg-[#121212] border-2 border-white/15 rounded-xl overflow-hidden shadow-inner group">
          {/* Traditional Grid lines */}
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
            {/* Horizontal dash */}
            <div className="w-full h-px border-t border-dashed border-white/10"></div>
          </div>
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
            {/* Vertical dash */}
            <div className="h-full w-px border-l border-dashed border-white/10"></div>
          </div>

          {/* Golden Underlay Guide Template */}
          <div 
            style={{ opacity: guideOpacity / 100 }}
            className="absolute inset-0 pointer-events-none select-none flex items-center justify-center transition-opacity duration-300"
          >
            <span 
              style={{ fontSize: `${getFontSizePixel(kanji.length)}px`, lineHeight: 1 }}
              className="font-sans font-extrabold text-[#DFC15D] antialiased select-none tracking-normal whitespace-nowrap"
            >
              {kanji}
            </span>
          </div>

          {/* Main Drawing Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none antialiased"
          />

          {/* Hidden reference canvas used for scoring calculations */}
          <canvas ref={hiddenCanvasRef} className="hidden" />
        </div>

        {/* Brush Controls & Quick actions */}
        <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-center mt-5 gap-3.5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Brush Width Slider */}
            <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-xs font-semibold text-white/40 whitespace-nowrap">Kuas:</span>
              <input
                type="range"
                min="6"
                max="24"
                value={brushSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value);
                  setBrushSize(size);
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext("2d");
                    if (ctx) ctx.lineWidth = size;
                  }
                }}
                className="w-16 md:w-20 accent-brand-gold cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-white/70">{brushSize}px</span>
            </div>

            {/* Quick Transparency pills - requested: 'tombol untuk membuat transparansi bantuan menulis kanji menjadi ada atau hilang (hitam blank)' */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setGuideOpacity(0)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  guideOpacity === 0 
                    ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                    : "text-white/45 hover:text-white"
                }`}
                title="Sembunyikan panduan sepenuhnya (Hitam Blank)"
              >
                Blank
              </button>
              <button
                onClick={() => setGuideOpacity(15)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  guideOpacity === 15 
                    ? "bg-brand-gold text-[#121212] font-black" 
                    : "text-white/45 hover:text-white"
                }`}
                title="Transparansi Tipis (15%)"
              >
                15%
              </button>
              <button
                onClick={() => setGuideOpacity(30)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  guideOpacity === 30 
                    ? "bg-brand-gold text-[#121212] font-black" 
                    : "text-white/45 hover:text-white"
                }`}
                title="Transparansi Sedang (30%)"
              >
                30%
              </button>
              <button
                onClick={() => setGuideOpacity(60)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  guideOpacity === 60 
                    ? "bg-brand-gold text-[#121212] font-black" 
                    : "text-white/45 hover:text-white"
                }`}
                title="Transparansi Jelas (60%)"
              >
                60%
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={undoState}
              disabled={historyIndex <= 0}
              className="px-3 py-1.5 text-xs text-white/80 hover:text-white font-bold bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer animate-none"
            >
              Undo
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-1.5 text-xs text-white/80 hover:text-red-400 font-bold bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 rounded-lg transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
