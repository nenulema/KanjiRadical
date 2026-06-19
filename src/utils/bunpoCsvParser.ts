import { BunpoItem } from "../data/bunpo";

export function parseCSV(text: string): Record<string, string>[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentVal += '"';
          i++;
        } else {
          // Ending quote
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentVal);
        currentVal = "";
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip standard CRLF
        }
        row.push(currentVal);
        lines.push(row);
        row = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
  }
  // catch final value
  if (currentVal || row.length > 0) {
    row.push(currentVal);
    lines.push(row);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.trim());
  const jsonResult: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 0 || (values.length === 1 && values[0].trim() === "")) continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ? values[j].trim() : "";
    }
    jsonResult.push(obj);
  }

  return jsonResult;
}

export function csvToBunpoItems(csvText: string): BunpoItem[] {
  const records = parseCSV(csvText);
  if (records.length === 0) return [];

  // Helper to normalize strings for comparison
  const normalize = (s: string) => s.replace(/[^a-zA-Z0-9\/\s]/g, "").replace(/\s+/g, "").toLowerCase();

  // Find the key in record based on similarity
  const findKey = (record: Record<string, string>, targets: string[]): string | undefined => {
    const normalizedTargets = targets.map(normalize);
    const keys = Object.keys(record);
    
    // First pass: exact normalized match
    for (const key of keys) {
      const normalizedKey = normalize(key);
      if (normalizedTargets.includes(normalizedKey)) {
        return key;
      }
    }
    // Second pass: starts with or contains
    for (const key of keys) {
      const normalizedKey = normalize(key);
      for (const target of normalizedTargets) {
        if (normalizedKey.includes(target) || target.includes(normalizedKey)) {
          return key;
        }
      }
    }
    return undefined;
  };

  return records.map((rec, index) => {
    const keyJp = findKey(rec, ["bunpobahasajepang", "bahasajepang", "japanese", "japan", "patterns", "pola", "bunpo"]);
    const keyRomaji = findKey(rec, ["romajibunpo", "romajigrammar", "romaji"]);
    const keyMeaningId = findKey(rec, ["artibahasaindonesia", "artiindonesia", "indonesia", "meaningid", "makna", "maknahid"]);
    const keyMeaningEn = findKey(rec, ["artiinggris", "artien", "englishmeaning", "meaning", "meaningen"]);
    const keyLink = findKey(rec, ["linkbunpo", "link", "url", "source"]);
    const keyFormula = findKey(rec, ["formula", "formation", "rumus", "pattern", "formasi"]);
    const keyExampleJa = findKey(rec, ["contohkalimat", "exampleja", "japaneseexample", "example", "sentence"]);
    const keyExampleId = findKey(rec, ["artikalimatindonesia", "exampleid", "indonesianexample", "artikalimat", "artikalimatindo"]);
    const keyExampleEn = findKey(rec, ["artikalimatinggris", "exampleen", "englishexample"]);
    const keyRomajiExample = findKey(rec, ["hiragananyaromajinya", "romajiexample", "romajicontoh", "hiragana", "romajinya", "hiragananyaromajinya"]);

    const japanese = keyJp ? rec[keyJp] : "";
    const romaji = keyRomaji ? rec[keyRomaji] : "";
    
    // Create unique ID
    let rawId = romaji.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (!rawId) {
      rawId = japanese.replace(/[^\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/g, "-");
    }
    const id = rawId ? `${rawId}-${index}` : `custom-${index}`;

    return {
      id,
      japanese: japanese || "Pola Baru",
      romaji: romaji || "pola-baru",
      meaningId: keyMeaningId ? rec[keyMeaningId] : "",
      meaningEn: keyMeaningEn ? rec[keyMeaningEn] : "",
      link: keyLink ? rec[keyLink] : "",
      formula: keyFormula ? rec[keyFormula] : "",
      exampleJa: keyExampleJa ? rec[keyExampleJa] : "",
      exampleId: keyExampleId ? rec[keyExampleId] : "",
      exampleEn: keyExampleEn ? rec[keyExampleEn] : "",
      romajiExample: keyRomajiExample ? rec[keyRomajiExample] : ""
    };
  }).filter(item => item.japanese.trim() !== "" || item.romaji.trim() !== "");
}
