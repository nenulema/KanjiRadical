/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  FileCode, 
  Terminal, 
  ArrowUpRight, 
  Download, 
  Settings, 
  HelpCircle,
  Copy,
  Check,
  Cpu
} from "lucide-react";

export default function ReadmeIntegration() {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const schemaSnippet = `export interface KotobaItem {
  id: number;
  index: number;
  halaman: number;
  no: number;
  bagian: string; // Misal: "4日目"
  kanji: string;  // Misal: "経済"
  hiragana: string;
  arti: string;
  contohKalimat: string;
  contohKalimatHiragana: string;
  artiKalimat: string;
}`;

  const linkSnippet = `// Mengaktifkan filter otomatis dari Aplikasi "Kanji Radical" Anda:
import React from 'react';
import AppKotobaN3 from './components/N3StudyApp';

export default function IntegratedKanjiSuite() {
  const [activeKanjiFilter, setActiveKanjiFilter] = React.useState<string | null>(null);

  // Fungsi callback ketika Radical diklik di aplikasi Anda:
  const handleRadicalClick = (targetKanji: string) => {
    setActiveKanjiFilter(targetKanji);
  };

  return (
    <div className="min-h-screen grid grid-cols-12 gap-4">
      {/* Kolom Kiri: Aplikasi Kanji Radical Anda */}
      <div className="col-span-4 bg-white p-4">
        <MyKanjiRadicalApp onSelectKanji={handleRadicalClick} />
      </div>

      {/* Kolom Kanan: Aplikasi Kotoba N3 ini */}
      <div className="col-span-8 bg-neutral-50 p-4 border-l">
        <AppKotobaN3 filterKanji={activeKanjiFilter} />
      </div>
    </div>
  );
}`;

  return (
    <div id="developer-guide-panel" className="bg-white rounded-2xl border p-5 md:p-6 shadow-sm space-y-6 max-w-4xl mx-auto select-text">
      
      {/* Title */}
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
          <Cpu size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-800">Pusat Integrasi Antigravity IDE</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Panduan kustomisasi dan penyatuan aplikasi Kotoba N3 dengan aplikasi Kanji Radical Anda.</p>
        </div>
      </div>

      {/* Step by step download guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <span className="text-[10px] font-mono font-bold text-indigo-700">LANGKAH 1</span>
          <h4 className="font-bold text-neutral-800 text-xs mt-1">Gunakan Menu Settings</h4>
          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
            Klik ikon gir atau ekspor di menu kanan atas <strong>Google AI Studio</strong>, lalu pilih <strong>Download ZIP</strong> untuk menyimpan semua codebase.
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <span className="text-[10px] font-mono font-bold text-indigo-700">LANGKAH 2</span>
          <h4 className="font-bold text-neutral-800 text-xs mt-1">Pindahkan Berkas Goresan</h4>
          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
            Pindahkan folder <code>src/components/</code> dan berkas data <code>src/data/kotobaDb.ts</code> ke dalam struktur folder Antigravity IDE Anda.
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <span className="text-[10px] font-mono font-bold text-indigo-700">LANGKAH 3</span>
          <h4 className="font-bold text-neutral-800 text-xs mt-1">Gabungkan Package.json</h4>
          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
            Salin baris dependensi <code>express</code> dan <code>@google/genai</code> jika Anda ingin mengaktifkan "Tutor AI Kaligrafi" di IDE utama Anda.
          </p>
        </div>
      </div>

      {/* Code snippets */}
      <div className="space-y-4">
        
        {/* Snippet 1 Schema */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-neutral-750 flex items-center gap-1.5">
              <FileCode size={14} className="text-indigo-600" />
              1. Struktur Model Data (KotobaItem)
            </h4>
            <button
              onClick={() => copyToClipboard(schemaSnippet, "schema")}
              className="text-[11px] font-bold text-indigo-650 hover:underline flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-md"
            >
              {copied === "schema" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied === "schema" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="bg-neutral-900 text-neutral-200 text-xs p-4 rounded-xl overflow-x-auto font-mono">
            {schemaSnippet}
          </pre>
        </div>

        {/* Snippet 2 Communication Link */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-neutral-750 flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-600" />
              2. Kode Komunikasi Antara Aplikasi (Deep Link Kanji)
            </h4>
            <button
              onClick={() => copyToClipboard(linkSnippet, "link")}
              className="text-[11px] font-bold text-indigo-650 hover:underline flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-md"
            >
              {copied === "link" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied === "link" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="bg-neutral-900 text-neutral-200 text-xs p-4 rounded-xl overflow-x-auto font-mono whitespace-pre leading-relaxed">
            {linkSnippet}
          </pre>
        </div>

      </div>

      {/* Integration guidelines footnotes */}
      <div className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl">
        <h5 className="font-bold text-neutral-800 text-xs flex items-center gap-1">
          <HelpCircle size={14} className="text-indigo-600" />
          Mengapa Menggunakan Arsitektur Ini?
        </h5>
        <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-neutral-600 leading-relaxed">
          <li><strong>Zero Network Latency:</strong> Seluruh database vocabulary tersimpan dalam dataset lokal kencang dan hemat kuota internet.</li>
          <li><strong>Universal Exportable state:</strong> Penilaian goresan tangan dinilai di sisi klien (offline) dengan performa andal, sehingga Anda tidak perlu membeli server terpisah.</li>
          <li><strong>Keamanan Kunci API:</strong> Kunci AI divalidasi dengan aman melalui server backend proxy agar tidak bocor ke peramban.</li>
        </ul>
      </div>

    </div>
  );
}
