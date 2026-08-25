/**
 * Deterministic word highlighting: same word in the same position always gets
 * the same verdict, so the "random" accent pattern is stable across renders
 * and server/client hydration without hardcoding which words to highlight.
 */
const hashWord = (word: string, index: number): number => {
  const seed = `${word}:${index}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const MIN_WORD_LENGTH = 4;
const HIGHLIGHT_RATE = 9;

export const shouldHighlightWord = (word: string, index: number): boolean => {
  const clean = word.replace(/[^\p{L}\p{N}]/gu, "");
  if (clean.length < MIN_WORD_LENGTH) return false;
  return hashWord(clean.toLowerCase(), index) % HIGHLIGHT_RATE === 0;
};
