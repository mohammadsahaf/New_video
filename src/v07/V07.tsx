// V07 · «ایلام: نامی که پاک نشد» — horizontal YouTube documentary, ~25 min.
// Narration: public/v07/voice.mp3 (16 sections joined). Timing: vo.json (each script word aligned to the narration).
// Pictures: the user's cinematic stills and clips (public/v07/img, public/v07/clips) + real museum photos (public/v07/art),
// laid out by plan.py → plan.json, plus code-made map scenes (map.tsx), cards and chapter titles.
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { FootageTime, Vignette, useT, type Shot } from "../footage/footage";
import { Captions } from "../footage/captions";
import { chunksFrom, narration } from "../footage/vo";
import { MapScene } from "./map";
import voRaw from "./vo.json";
import planRaw from "./plan.json";

export const FPS = 30;
const W = 1920;
const Dims = createContext({ w: 1920, h: 1080 });
const GOLD = "#d8b25a", INK = "#efe3c4";
export const VO = narration(voRaw as never);
type Scene = { kind: "map" | "card" | "chapter"; id?: string; text?: string; sub?: string; n?: number; at: number; until: number; full?: boolean; title?: boolean };
type S = Shot & { art?: boolean; w?: number; h?: number };
const PLAN = planRaw as unknown as { total: number; shots: S[]; scenes: Scene[] };
export const END = PLAN.total + 1.5;
export const FRAMES = Math.ceil(END * FPS);
const MUSIC = { file: "", volume: 0.09 }; // filled in after the music pass

const CHAPTER_TITLES: Record<number, string> = {
  2: "دو چهره‌ی یک سرزمین", 3: "ثروتِ کوه‌ها و رازِ یک زبان", 4: "قفلی که چهار هزار سال بسته ماند", 5: "آونگ",
  6: "خدایان و وزیرانِ بزرگ", 7: "عصرِ طلایی", 8: "شوتروک و قانونِ ناتمام", 9: "غنیمت‌های زیرِ خاک",
  10: "آشور برمی‌خیزد", 11: "برادر علیه برادر", 12: "شبِ نمک", 13: "سرِ یک پادشاه، باغِ یک پادشاه",
  14: "طنزِ تلخِ تاریخ", 15: "ایلام در دلِ ایران", 16: "تقریباً",
};
const KEYWORDS = ["ایلام", "شوش", "اَنشان", "انشان", "آشوربانیپال", "آشور", "کوروش", "حمورابی", "ناپیرآسو", "ناپیر", "شوتروک", "چُغازَنبیل", "چغازنبیل", "نینوا", "بابل", "اور", "نَرام‌سین", "تِئومان", "نام", "اسم", "نمک", "نفرین", "اولای", "مَردوخ", "پوزور", "داریوش", "هومبان", "هَلتاش"];
const CHUNKS = chunksFrom(VO, 6, KEYWORDS);

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const vis = (t: number, a: number, b: number, fin = 0.4, fout = 0.4) => clamp((t - a) / fin) * clamp((b - t) / fout);
const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

type Media = { file: string; kind: "image" | "video"; w: number; h: number; art?: boolean };
const mediaOf = (s: S): Media => {
  if (s.art) return { file: `v07/art/${s.name.slice(2)}.jpg`, kind: "image", w: s.w ?? 1600, h: s.h ?? 900, art: true };
  const n = s.name.slice(1);
  return s.name[0] === "i" ? { file: `v07/img/${n}.jpg`, kind: "image", w: 2400, h: 1340 } : { file: `v07/clips/${n}.mp4`, kind: "video", w: 1920, h: 1080 };
};

// a light footage bed: no CSS filters and no per-frame noise (both are very slow on a CPU-only renderer);
// the stills are already graded, and film grain is added once in the final encode
const Layer: React.FC<{ s: S; t: number }> = ({ s, t }) => {
  const { w: DW, h: DH } = useContext(Dims);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = mediaOf(s);
  const still = m.kind === "image";
  const len = s.until - s.at + 0.45;
  const p = ease(clamp((t - s.at) / Math.max(0.1, len)));
  const z = (s.zoom ?? 1) * (1 + (s.push ?? (still ? 0.08 : 0.04)) * p);
  const focus = s.focus ?? [0.5, 0.5], pan = s.pan ?? [0, 0];
  const fx = clamp(focus[0] + pan[0] * p), fy = clamp(focus[1] + pan[1] * p);
  // real photos: the whole picture stays visible (contain) on a dark plate; stills and clips fill the frame (cover)
  const sc = (m.art ? Math.min((DW * 0.9) / m.w, (DH * 0.9) / m.h) : Math.max(DW / m.w, DH / m.h)) * (m.art ? 1 + 0.05 * p : z);
  const vw = m.w * sc, vh = m.h * sc;
  const left = m.art ? (DW - vw) / 2 : Math.min(0, Math.max(DW - vw, DW / 2 - fx * vw));
  const top = m.art ? (DH - vh) / 2 : Math.min(0, Math.max(DH - vh, DH / 2 - fy * vh));
  const style: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: m.w, height: m.h, maxWidth: "none", transformOrigin: "0 0", transform: `translate(${left}px, ${top}px) scale(${sc})` };
  if (still) {
    return (
      <>
        {m.art && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1d1810, #070605)" }} />}
        <Img src={staticFile(m.file)} style={m.art ? { ...style, boxShadow: "0 0 80px #000" } : style} />
        {m.art && <div style={{ position: "absolute", left: left - 8, top: top - 8, width: vw + 16, height: vh + 16, border: `2px solid ${GOLD}66`, pointerEvents: "none" }} />}
      </>
    );
  }
  const seqFrom = frame - Math.round((t - s.at) * fps);
  return (
    <Sequence from={seqFrom} durationInFrames={Math.max(1, Math.round(len * fps) + 2)} layout="none">
      <OffthreadVideo src={staticFile(m.file)} muted trimBefore={Math.round((s.from ?? 0) * fps)} playbackRate={s.rate ?? 1} style={style} />
    </Sequence>
  );
};
const SHOTS = PLAN.shots.filter((s) => s.name !== "black").sort((a, b) => a.at - b.at);
const MIX = 0.45;
const Bed: React.FC<{ t: number }> = ({ t }) => {
  let i = SHOTS.findIndex((s, k) => t >= s.at && (k === SHOTS.length - 1 || t < SHOTS[k + 1].at));
  if (i < 0) i = 0;
  const show = i > 0 && t < SHOTS[i].at + MIX ? [i - 1, i] : [i];
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      {show.map((k) => (
        <AbsoluteFill key={SHOTS[k].name + k} style={{ opacity: k === i && show.length > 1 ? clamp((t - SHOTS[i].at) / MIX) : 1 }}>
          <Layer s={SHOTS[k]} t={t} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

const Card: React.FC<{ s: Scene; t: number }> = ({ s, t }) => {
  const o = vis(t, s.at, s.until, 0.35, 0.45);
  if (o <= 0) return null;
  const k = clamp((t - s.at) / 0.6);
  const len = (s.text ?? "").replace(/\n/g, "").length;
  const big = s.title ? 210 : len > 40 ? 64 : len > 22 ? 82 : len > 14 ? 100 : 150;
  if (s.full)
    return (
      <AbsoluteFill style={{ opacity: o, background: s.title ? "radial-gradient(ellipse at 50% 45%, rgba(20,14,8,0.55), rgba(0,0,0,0.9))" : "radial-gradient(ellipse at 50% 45%, rgba(20,14,8,0.8), rgba(0,0,0,0.95))", alignItems: "center", justifyContent: "center", direction: "rtl" }}>
        <div style={{ width: 260 * k, height: 2, background: GOLD, marginBottom: 34 }} />
        <div style={{ font: `${big}px/1.3 ${FONT_NUM}`, color: GOLD, textShadow: "0 6px 40px #000", transform: `scale(${0.94 + 0.06 * k})`, textAlign: "center", maxWidth: 1560, whiteSpace: "pre-line" }}>{s.text}</div>
        {s.sub && <div style={{ font: `46px ${FONT_TEXT}`, color: INK, marginTop: 26, opacity: clamp((t - s.at - 0.3) / 0.5), textAlign: "center", maxWidth: 1500 }}>{s.sub}</div>}
        <div style={{ width: 260 * k, height: 2, background: GOLD, marginTop: 34 }} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ opacity: o, direction: "rtl" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0) 28%, rgba(0,0,0,0.74) 100%)" }} />
      <div style={{ position: "absolute", right: 110, top: 280, textAlign: "right", maxWidth: 1000, transform: `translateX(${(1 - k) * -40}px)` }}>
        <div style={{ width: 90, height: 4, background: GOLD, marginBottom: 22, marginLeft: "auto" }} />
        <div style={{ font: `${big * 0.9}px/1.2 ${FONT_NUM}`, color: GOLD, textShadow: "0 6px 30px #000", whiteSpace: "pre-line" }}>{s.text}</div>
        {s.sub && <div style={{ font: `40px ${FONT_TEXT}`, color: INK, marginTop: 18, textShadow: "0 3px 14px #000" }}>{s.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

const ChapterTitle: React.FC<{ s: Scene; t: number }> = ({ s, t }) => {
  const o = vis(t, s.at, s.until, 0.5, 0.6);
  if (o <= 0 || !s.n || s.n === 1) return null;
  const k = clamp((t - s.at) / 0.8);
  return (
    <AbsoluteFill style={{ opacity: o, direction: "rtl" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 380, background: "linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", right: 96, top: 74, textAlign: "right" }}>
        <div style={{ font: `40px ${FONT_TEXT}`, color: GOLD, letterSpacing: 2 }}>بخش {fa(s.n)}</div>
        <div style={{ height: 3, width: 360 * k, background: GOLD, margin: "10px 0 14px auto" }} />
        <div style={{ font: `78px ${FONT_NUM}`, color: INK, textShadow: "0 4px 24px #000" }}>{CHAPTER_TITLES[s.n] ?? ""}</div>
      </div>
    </AbsoluteFill>
  );
};

const Opening: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 0.3, 4.6, 0.6, 0.8);
  if (o <= 0) return null;
  return <div style={{ position: "absolute", right: 80, top: 60, direction: "rtl", opacity: o * 0.9, font: `30px ${FONT_TEXT}`, color: GOLD, letterSpacing: 1 }}>تاریخ جاوید</div>;
};

export const V07Frame: React.FC<{ silent?: boolean; reel?: boolean }> = ({ silent, reel }) => {
  const t = useT();
  const maps = reel ? [] : PLAN.scenes.filter((s) => s.kind === "map");
  const map = maps.find((s) => t >= s.at - 0.4 && t < s.until + 0.4);
  const mapO = map ? vis(t, map.at - 0.35, map.until + 0.35, 0.45, 0.45) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {mapO < 1 && <Bed t={t} />}
      {mapO < 1 && <Vignette strength={0.5} />}
      {map && mapO > 0 && (
        <AbsoluteFill style={{ opacity: mapO }}>
          <MapScene id={map.id as string} p={clamp((t - map.at) / Math.max(1, map.until - map.at))} t={t} bare={reel} />
        </AbsoluteFill>
      )}
      {PLAN.scenes.filter((s) => s.kind === "card" && (!reel || s.full) && t > s.at - 0.5 && t < s.until + 0.6).map((s, i) => <Card key={i} s={s} t={t} />)}
      {!reel && PLAN.scenes.filter((s) => s.kind === "chapter" && t > s.at - 0.5 && t < s.until + 0.7).map((s, i) => <ChapterTitle key={i} s={s} t={t} />)}
      {!reel && <Opening t={t} />}
      {!reel && <Captions chunks={CHUNKS} y={930} w={W} size={48} font={FONT_TEXT} accent="#FFC83D" max={1500} />}
    </AbsoluteFill>
  );
};

export const V07: React.FC<{ silent?: boolean }> = ({ silent }) => (
  <AbsoluteFill>
    <V07Frame silent={silent} />
    {!silent && <Audio src={staticFile("v07/voice.mp3")} />}
    {!silent && MUSIC.file && <Audio src={staticFile(MUSIC.file)} volume={MUSIC.volume} />}
  </AbsoluteFill>
);

/** stills at chosen seconds: one frame per time, for review contact sheets */
export const V07Look: React.FC<{ times: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  return (
    <FootageTime.Provider value={times[Math.min(f, times.length - 1)]}>
      <V07Frame silent />
    </FootageTime.Provider>
  );
};

// review times: every map scene's middle, every card, every chapter title, plus a sample of the footage
const SC = PLAN.scenes;
export const LOOK: number[] = [
  0.5, 2.5, 8, 30,
  ...SC.filter((s) => s.kind === "map").map((s) => s.at + (s.until - s.at) * 0.7),
  ...SC.filter((s) => s.kind === "card").map((s) => s.at + 1.2),
  ...SC.filter((s) => s.kind === "chapter").map((s) => s.at + 1.6),
  ...PLAN.shots.filter((_, i) => i % 11 === 5).map((s) => (s.at + s.until) / 2),
].sort((a, b) => a - b);
