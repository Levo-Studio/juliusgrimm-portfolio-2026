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

const MIN_WORD_LENGTH = 3;
const MAX_RUN_LENGTH = 3;
const RUN_CONTINUE_RATE = 4;

/** Filler words carry no meaning on their own — skip them so highlights land on content words. */
const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "into", "onto", "than",
  "then", "when", "where", "while", "just", "like", "over", "under", "your",
  "you", "are", "was", "were", "been", "being", "have", "has", "had", "not",
  "but", "its", "it's", "own", "who", "all", "any", "one", "two", "out",
  "off", "can", "will", "would", "could", "should", "did", "does", "each",
  "every", "some", "more", "most", "such", "even", "also", "still", "now",
  "get", "got", "let", "lets", "let's", "way", "ways", "into"
]);

const cleanWord = (word: string): string => word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();

/** A denser divisor for shorter copy too — a two-line case study shouldn't stay bare. */
const baseRateFor = (totalWords: number): number => {
  if (totalWords > 120) return 5;
  if (totalWords > 60) return 6;
  return 7;
};

const STARTS_QUOTE = /^["“]/;
const ENDS_QUOTE = /["”][,.;:!?]*$/;

/** Anything inside "quotes" always highlights in full, regardless of the random pass. */
const markQuotedRuns = (words: string[], highlighted: boolean[]): void => {
  let inQuote = false;

  words.forEach((word, index) => {
    if (!inQuote && STARTS_QUOTE.test(word)) {
      highlighted[index] = true;
      inQuote = !ENDS_QUOTE.test(word);
      return;
    }
    if (inQuote) {
      highlighted[index] = true;
      if (ENDS_QUOTE.test(word)) inQuote = false;
    }
  });
};

/** Returns one boolean per word, occasionally chaining a hit into a short run of neighbors. */
export const highlightWords = (words: string[]): boolean[] => {
  const rate = baseRateFor(words.length);
  const highlighted = words.map((word, index) => {
    const clean = cleanWord(word);
    if (clean.length < MIN_WORD_LENGTH || STOPWORDS.has(clean)) return false;
    return hashWord(clean, index) % rate === 0;
  });

  for (let index = 0; index < words.length; index++) {
    if (!highlighted[index]) continue;
    for (let next = index + 1; next < Math.min(words.length, index + MAX_RUN_LENGTH); next++) {
      const clean = cleanWord(words[next]);
      if (clean.length < MIN_WORD_LENGTH || STOPWORDS.has(clean) || hashWord(clean, next) % RUN_CONTINUE_RATE !== 0) {
        break;
      }
      highlighted[next] = true;
    }
  }

  markQuotedRuns(words, highlighted);

  return highlighted;
};
