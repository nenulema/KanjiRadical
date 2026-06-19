import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Language } from "../i18n/translations";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const options: { code: Language; flag: string; label: string }[] = [
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "id", flag: "🇮🇩", label: "ID" },
    { code: "ja", flag: "🇯🇵", label: "JA" },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-1 rounded-xl shadow-lg">
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLanguage(opt.code)}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all text-xs sm:text-sm shrink-0 ${
            language === opt.code
              ? "bg-indigo-600 border border-indigo-400 shadow-md transform scale-105"
              : "bg-transparent border border-transparent hover:bg-slate-800 opacity-70 hover:opacity-100"
          }`}
          title={opt.label}
        >
          {opt.flag}
        </button>
      ))}
    </div>
  );
}
