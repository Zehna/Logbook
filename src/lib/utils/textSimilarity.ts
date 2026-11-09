import type { LogbookEntry } from "@/src/lib/exporters/types";

/**
 * Audit kualitas & anti-duplikasi logbook. Sebelumnya inline di app/page.tsx
 * (dan tidak pernah dipakai di sana selain definisinya) — dipindah ke sini
 * agar bisa diuji unit dan dipakai ulang.
 */

export function getWordList(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
}

export function getWordSet(text: string): Set<string> {
    return new Set(getWordList(text));
}

export function computeJaccardSimilarity(textA: string, textB: string): number {
    const setA = getWordSet(textA);
    const setB = getWordSet(textB);
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    setA.forEach((w) => {
      if (setB.has(w)) intersection++;
    });
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

export function computeOverallUniqueness(entriesList: LogbookEntry[]): number {
    if (entriesList.length === 0) return 100;
    const allWords = entriesList.flatMap((e) =>
      getWordList(e.deskripsiKegiatan || "")
    );
    if (allWords.length === 0) return 100;
    const uniqueCount = new Set(allWords).size;
    return Math.round((uniqueCount / allWords.length) * 100);
}
