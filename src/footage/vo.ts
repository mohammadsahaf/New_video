// Narration timing for footage videos: vo.json from tools/doc-build-vo.mjs ({ segs, words: [{ w, s, e, line }] })
// or words.json from tools/eleven-align.mjs ([{ w, s, e, si }]) — the same helpers for both.
import type { Manifest, Shot, Grade } from "./footage";

export type Word = { w: string; s: number; e: number; line: number };
export type Narration = { total: number; words: Word[] };
type Raw = { total?: number; words?: { w: string; s: number; e: number; line?: number }[] } | { w: string; s: number; e: number; si?: number }[];

export const narration = (raw: Raw): Narration => {
  const words: Word[] = Array.isArray(raw) ? raw.map((x) => ({ w: x.w, s: x.s, e: x.e, line: (x.si ?? 0) + 1 })) : (raw.words ?? []).map((x) => ({ w: x.w, s: x.s, e: x.e, line: x.line ?? 1 }));
  const total = (!Array.isArray(raw) && raw.total) || (words.length ? words[words.length - 1].e : 0);
  return { total, words };
};

const clean = (s: string) => s.replace(/[‌]/g, "").replace(/[،؛؟!?.,:;«»"'()\-–—…]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").trim();

/** first and last word time of narration line n (1-based) */
export const lineAt = (vo: Narration, n: number) => {
  const ws = vo.words.filter((w) => w.line === n);
  if (!ws.length) throw new Error(`no narration line ${n}`);
  return { start: ws[0].s, end: ws[ws.length - 1].e };
};

/** the time a word is said: wordAt(vo, 3, "موشک") — occ picks the 2nd, 3rd… time it is said in that line */
export const wordAt = (vo: Narration, line: number, word: string, occ = 1, edge: "s" | "e" = "s") => {
  const want = clean(word);
  const ws = vo.words.filter((w) => w.line === line);
  const hits = ws.filter((w) => clean(w.w) === want);
  const loose = hits.length ? hits : ws.filter((w) => clean(w.w).startsWith(want));
  const w = loose[occ - 1];
  if (!w) throw new Error(`"${word}" is not in narration line ${line}`);
  return w[edge];
};

/** caption chunks from the narration: a few words at a time, each lighting up as it is said */
export type Chunk = { words: { w: string; s: number; e: number; kw?: boolean }[]; s: number; e: number };
export const chunksFrom = (vo: Narration, maxWords = 4, keywords: string[] = []): Chunk[] => {
  const kws = keywords.map(clean);
  const out: Chunk[] = [];
  const lines = [...new Set(vo.words.map((w) => w.line))];
  for (const n of lines) {
    const ws = vo.words.filter((w) => w.line === n);
    // even cards: 10 words → 4·3·3, never 4·4·2 (a lonely word or two reads like a mistake)
    const cards = Math.max(1, Math.ceil(ws.length / maxWords));
    let i = 0;
    for (let k = 0; k < cards; k++) {
      const size = Math.ceil((ws.length - i) / (cards - k));
      const part = ws.slice(i, i + size);
      i += size;
      if (part.length) out.push({ words: part.map((w) => ({ w: w.w, s: w.s, e: w.e, kw: kws.includes(clean(w.w)) })), s: part[0].s, e: part[part.length - 1].e });
    }
  }
  out.forEach((c, k) => {
    const next = out[k + 1];
    c.e = next ? Math.min(next.s - 0.06, c.e + 0.9) : c.e + 0.6;
  });
  return out;
};

/**
 * The footage track straight from footage.json: every shot of the narration (the manifest keeps their times) gets
 * its clips in name order (s03a, s03b…), splitting the shot's time evenly; tweaks change any of them by name.
 * The first shot starts at 0 and the last runs to the end.
 */
export const autoShots = (man: Manifest & { shots?: Record<string, { t0: number | null; t1: number | null }> }, end: number, tweaks: Record<string, Partial<Shot>> = {}): Shot[] => {
  const plan = Object.entries(man.shots ?? {}).filter(([, s]) => s.t0 != null).sort((a, b) => (a[1].t0 as number) - (b[1].t0 as number));
  const out: Shot[] = [];
  plan.forEach(([id, s], k) => {
    const a = k === 0 ? 0 : (s.t0 as number);
    const b = k < plan.length - 1 ? (plan[k + 1][1].t0 as number) : end;
    const names = Object.keys(man.clips).filter((n) => (man.clips[n] as { shot?: string }).shot === id).sort();
    const list = names.length ? names : [id];
    list.forEach((name, j) => {
      const clip = man.clips[name];
      const old = clip && clip.year && clip.year < 1975;
      const museum = clip && clip.kind === "image" && /cleveland|wellcome|europeana/.test(clip.source || "");
      const grade: Grade = old ? "film" : "clean";
      // focus: where tools/footage.mjs found the subject (what moves, what stands out) — the crop keeps it in frame
      const focus = clip?.focus;
      out.push({ name, at: a + ((b - a) * j) / list.length, until: a + ((b - a) * (j + 1)) / list.length, fit: museum ? "contain" : "cover", grade, ...(focus ? { focus } : {}), ...tweaks[name] });
    });
  });
  return out;
};
