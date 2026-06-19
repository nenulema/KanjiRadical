import React from "react";

/**
 * Safely highlights a target sub-string (e.g. Kanji or Hiragana) within a Japanese sentence.
 * Returns a React element with stylized match.
 * 
 * Supports options for color:
 * - "gold" (Default Theme matches brand-gold beautifully)
 * - "green" (Emerald highlight matching successful streaks)
 * - "red" (Rose highlight for sharp warning attention)
 */
export function renderHighlightedText(text: string, target: string, colorStyle: "gold" | "green" | "red" = "gold") {
  if (!text) return <span>{text || ""}</span>;
  if (!target) return <span>{text}</span>;

  // 1. Clean the target to strip parentheses like "(する)", " (する)", "（する）", "（する" etc.
  let cleanTarget = target.replace(/\s*[\(\（].*?[\)\）]/g, "").trim();
  // Strip any remaining lone parenthesis characters
  cleanTarget = cleanTarget.replace(/[\(\)（）]/g, "").trim();

  if (!cleanTarget) {
    return <span>{text}</span>;
  }

  // Select the appropriate Tailwind utility class list for the highlight span without any box or border
  let highlightClass = "text-brand-gold font-extrabold text-[1.05em]";
  if (colorStyle === "green") {
    highlightClass = "text-emerald-400 font-extrabold text-[1.05em]";
  } else if (colorStyle === "red") {
    highlightClass = "text-rose-400 font-extrabold text-[1.05em]";
  }

  const index = text.indexOf(cleanTarget);
  if (index === -1) {
    // Fallback: If not found exactly, try partial match (characters) or return original text
    return <span>{text}</span>;
  }

  const before = text.substring(0, index);
  const match = text.substring(index, index + cleanTarget.length);
  const after = text.substring(index + cleanTarget.length);

  return (
    <span>
      {before}
      <strong className={highlightClass}>{match}</strong>
      {after}
    </span>
  );
}
