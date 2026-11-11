const WORD = /[\p{L}\p{N}]+/gu;
const MAX_GAP = 6;

function fold(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matches(summaryWord: string, titleWord: string) {
  const summary = fold(summaryWord);
  const title = fold(titleWord);
  if (summary === title) return true;
  if (summary.length < 5 || title.length < 5) return false;
  if (Math.abs(summary.length - title.length) > 3) return false;
  const prefix = Math.min(summary.length, title.length) - 1;
  return prefix >= 4 && summary.slice(0, prefix) === title.slice(0, prefix);
}

function words(text: string) {
  return [...text.matchAll(WORD)].map((match) => ({
    word: match[0],
    index: match.index ?? 0,
  }));
}

/** Span in the summary that restates the title, including words between the matched ones. */
export function titleHighlight(title: string, summary: string) {
  const summaryWords = words(summary);
  const titleWords = words(title)
    .map((entry) => entry.word)
    .filter((word) => /\d/.test(word) || fold(word).length >= 3);
  if (summaryWords.length === 0 || titleWords.length === 0) return null;

  let best: { count: number; start: number; end: number } | null = null;

  for (let titleStart = 0; titleStart < titleWords.length; titleStart += 1) {
    for (let startAt = 0; startAt < summaryWords.length; startAt += 1) {
      let count = 0;
      let first = -1;
      let end = -1;
      let lastMatch = -1;
      let cursor = startAt;

      for (let index = titleStart; index < titleWords.length; index += 1) {
        let found = -1;
        for (let wordIndex = cursor; wordIndex < summaryWords.length; wordIndex += 1) {
          if (lastMatch >= 0 && wordIndex - lastMatch > MAX_GAP) break;
          if (matches(summaryWords[wordIndex].word, titleWords[index])) {
            found = wordIndex;
            break;
          }
        }
        if (found < 0) break;
        const entry = summaryWords[found];
        if (first < 0) first = entry.index;
        end = entry.index + entry.word.length;
        lastMatch = found;
        cursor = found + 1;
        count += 1;
      }

      const accepted = count >= 2 || (count === 1 && end - first >= 5);
      if (first < 0 || !accepted) continue;
      if (
        !best ||
        count > best.count ||
        (count === best.count && end - first < best.end - best.start)
      ) {
        best = { count, start: first, end };
      }
    }
  }

  return best ? { start: best.start, end: best.end } : null;
}
