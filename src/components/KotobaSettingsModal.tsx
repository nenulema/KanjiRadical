import React, { useState } from "react";
import { X, Settings, Type, Palette, EyeOff, CloudUpload, Loader2 } from "lucide-react";
import { KotobaSettings } from "../data/kotobaDb";

interface KotobaSettingsModalProps {
  settings: KotobaSettings;
  onClose: () => void;
  onSave: (settings: KotobaSettings) => void;
  isAdmin?: boolean;
  onSyncToCloud?: () => void;
  isSyncing?: boolean;
}

export default function KotobaSettingsModal({ settings, onClose, onSave, isAdmin, onSyncToCloud, isSyncing }: KotobaSettingsModalProps) {
  const [draft, setDraft] = useState<KotobaSettings>({ ...settings });

  const handleSave = () => {
    onSave(draft);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-panel border border-brand-gold/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-brand-gold">
            <Settings size={18} />
            <h3 className="font-bold">Pengaturan Tampilan</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Latihan Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Type size={16} className="text-white/40" />
              <label className="text-sm font-semibold">Ukuran Font Kalimat (Latihan)</label>
            </div>
            <p className="text-xs text-white/40 mb-2">Mengatur seberapa besar tulisan contoh kalimat dan artinya pada mode Latihan & Tulis.</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Kecil", value: "text-xs" },
                { label: "Sedang", value: "text-sm" },
                { label: "Besar", value: "text-base" },
                { label: "Sangat Besar", value: "text-lg" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDraft({ ...draft, practiceSentenceSize: opt.value as any })}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    draft.practiceSentenceSize === opt.value
                      ? "bg-brand-gold/20 text-brand-gold border-brand-gold"
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className={`p-3 bg-white/5 rounded-lg border border-white/5 text-brand-gold font-bold ${draft.practiceSentenceSize}`}>
              Pratinjau: 私の携帯電話はどこですか。
            </div>
          </div>

          {/* Katalog Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Type size={16} className="text-white/40" />
              <label className="text-sm font-semibold">Ukuran Font Terjemahan (Katalog)</label>
            </div>
            <p className="text-xs text-white/40 mb-2">Mengatur seberapa besar tulisan terjemahan bahasa Indonesia di halaman awal Katalog.</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Kecil", value: "text-[10px]" },
                { label: "Sedang", value: "text-xs" },
                { label: "Besar", value: "text-sm" },
                { label: "Sangat Besar", value: "text-base" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDraft({ ...draft, catalogFontSize: opt.value as any })}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    draft.catalogFontSize === opt.value
                      ? "bg-brand-gold/20 text-brand-gold border-brand-gold"
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Translation Color */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Palette size={16} className="text-white/40" />
              <label className="text-sm font-semibold">Warna Tulisan Arti Bahasa Indonesia</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Putih Standar", value: "text-white/90" },
                { label: "Abu-abu Redup", value: "text-white/50" },
                { label: "Emas Elegan", value: "text-brand-gold" },
                { label: "Biru Muda", value: "text-blue-300" },
                { label: "Hijau Emerald", value: "text-emerald-400" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDraft({ ...draft, translationColor: opt.value })}
                  className={`py-1.5 px-3 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                    draft.translationColor === opt.value
                      ? "bg-brand-gold/20 border-brand-gold"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  } ${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blur Translation Feature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-brand-gold">
                  <EyeOff size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">Mode Ujian (Sensor Arti)</h4>
                  <p className="text-[10px] text-white/40">Secara default membuat arti kata menjadi blur. Klik untuk melihat artinya.</p>
                </div>
              </div>
              <button
                onClick={() => setDraft({ ...draft, blurTranslation: !draft.blurTranslation })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                  draft.blurTranslation ? "bg-emerald-500" : "bg-white/20"
                }`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                  draft.blurTranslation ? "transform translate-x-5" : ""
                }`} />
              </button>
            </div>
          </div>

          {/* Admin Tools */}
          {isAdmin && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-emerald-400">
                <CloudUpload size={16} />
                <label className="text-sm font-semibold">Admin: Sync ke Global Database</label>
              </div>
              <p className="text-xs text-white/40 mb-2">Simpan database CSV lokal yang sedang aktif saat ini ke Firestore sebagai <b>Global Database</b> agar semua user mendapatkan pembaruan otomatis.</p>
              <button
                onClick={onSyncToCloud}
                disabled={isSyncing}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                {isSyncing ? "Menyinkronkan ke Cloud..." : "Push CSV ke Global Cloud"}
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-black bg-brand-gold text-dark-bg hover:opacity-90 shadow-lg shadow-brand-gold/20 transition-all cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
        
      </div>
    </div>
  );
}
