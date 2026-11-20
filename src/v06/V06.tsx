// V06 · «جنگی که جهان باستان را تمام کرد» (Khosrow II vs Heraclius, 602–628) — horizontal YouTube documentary, 25:47.
// Narration: public/v06/voice.mp3 (17 chapters joined). Timing: vo.json (each script word aligned to the narration).
// Pictures: the user's cinematic stills and clips (public/v06/img, public/v06/clips) laid out by plan.py → plan.json,
// plus code-made map scenes (map.tsx), date/quote cards and chapter titles.
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { FootageTime, Vignette, useT, type Manifest, type Shot } from "../footage/footage";
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
type Scene = { kind: "map" | "card" | "chapter"; id?: string; text?: string; sub?: string; n?: number; title?: string; at: number; until: number; full?: boolean };
const PLAN = planRaw as unknown as { total: number; shots: Shot[]; scenes: Scene[] };
export const END = PLAN.total + 1.5;
export const FRAMES = Math.ceil(END * FPS);
const MUSIC = { file: "", volume: 0.09 }; // filled in after the music pass

const KEYWORDS = ["خسرو", "خُسرو", "هراکلیوس", "اورشلیم", "قسطنطنیه", "تیسفون", "شهربراز", "صلیب", "نینوا", "یرموک", "نهاوند", "قادسیه", "شیرویه", "یزدگرد", "آذرگشنسب", "طاعون", "روم", "ایران"];
const CHUNKS = chunksFrom(VO, 6, KEYWORDS);

// the manifest: every still and clip the plan uses
const MAN: Manifest = { clips: {} };
for (const s of PLAN.shots) {
  if (MAN.clips[s.name]) continue;
  const n = s.name.slice(1);
  MAN.clips[s.name] = s.name[0] === "i" ? { file: `v06/img/${n}.jpg`, kind: "image", w: 2400, h: 1340 } : { file: `v06/clips/${n}.mp4`, kind: "video", w: 1920, h: 1080 };
}

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const vis = (t: number, a: number, b: number, fin = 0.4, fout = 0.4) => clamp((t - a) / fin) * clamp((b - t) / fout);
const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);


// a light footage bed: no CSS filters and no per-frame noise (both are very slow on a CPU-only renderer);
// the stills are already graded, and film grain is added once in the final encode
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const Layer: React.FC<{ s: Shot; t: number }> = ({ s, t }) => {
  const { w: DW, h: DH } = useContext(Dims);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clip = MAN.clips[s.name];
  const still = clip.kind === "image";
  const len = s.until - s.at + 0.45;
  const p = ease(clamp((t - s.at) / Math.max(0.1, len)));
  const z = (s.zoom ?? 1) * (1 + (s.push ?? (still ? 0.08 : 0.04)) * p);
  const focus = s.focus ?? [0.5, 0.5], pan = s.pan ?? [0, 0];
  const fx = clamp(focus[0] + pan[0] * p), fy = clamp(focus[1] + pan[1] * p);
  const sc = Math.max(DW / clip.w, DH / clip.h) * z;
  const vw = clip.w * sc, vh = clip.h * sc;
  const left = Math.min(0, Math.max(DW - vw, DW / 2 - fx * vw)), top = Math.min(0, Math.max(DH - vh, DH / 2 - fy * vh));
  const style: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: clip.w, height: clip.h, maxWidth: "none", transformOrigin: "0 0", transform: `translate(${left}px, ${top}px) scale(${sc})` };
  if (still) return <Img src={staticFile(clip.file)} style={style} />;
  const seqFrom = frame - Math.round((t - s.at) * fps);
  return (
    <Sequence from={seqFrom} durationInFrames={Math.max(1, Math.round(len * fps) + 2)} layout="none">
      <OffthreadVideo src={staticFile(clip.file)} muted trimBefore={Math.round((s.from ?? 0) * fps)} playbackRate={s.rate ?? 1} style={style} />
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
  const big = (s.text ?? "").length > 14 ? 92 : 150;
  if (s.full)
    return (
      <AbsoluteFill style={{ opacity: o, background: "radial-gradient(ellipse at 50% 45%, rgba(20,14,8,0.78), rgba(0,0,0,0.94))", alignItems: "center", justifyContent: "center", direction: "rtl" }}>
        <div style={{ width: 260 * k, height: 2, background: GOLD, marginBottom: 34 }} />
        <div style={{ font: `${big}px ${FONT_NUM}`, color: GOLD, textShadow: "0 6px 40px #000", transform: `scale(${0.94 + 0.06 * k})`, textAlign: "center", maxWidth: 1500, lineHeight: 1.25 }}>{s.text}</div>
        <div style={{ font: `44px ${FONT_TEXT}`, color: INK, marginTop: 26, opacity: clamp((t - s.at - 0.3) / 0.5) }}>{s.sub}</div>
        <div style={{ width: 260 * k, height: 2, background: GOLD, marginTop: 34 }} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ opacity: o, direction: "rtl" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.72) 100%)" }} />
      <div style={{ position: "absolute", right: 110, top: 300, textAlign: "right", transform: `translateX(${(1 - k) * -40}px)` }}>
        <div style={{ width: 90, height: 4, background: GOLD, marginBottom: 22, marginLeft: "auto" }} />
        <div style={{ font: `${big * 0.9}px ${FONT_NUM}`, color: GOLD, textShadow: "0 6px 30px #000", lineHeight: 1.15 }}>{s.text}</div>
        <div style={{ font: `40px ${FONT_TEXT}`, color: INK, marginTop: 18, textShadow: "0 3px 14px #000" }}>{s.sub}</div>
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
        <div style={{ font: `40px ${FONT_TEXT}`, color: GOLD, letterSpacing: 2 }}>فصل {fa(s.n)}</div>
        <div style={{ height: 3, width: 360 * k, background: GOLD, margin: "10px 0 14px auto" }} />
        <div style={{ font: `78px ${FONT_NUM}`, color: INK, textShadow: "0 4px 24px #000" }}>{s.title}</div>
      </div>
    </AbsoluteFill>
  );
};

const Opening: React.FC<{ t: number }> = ({ t }) => {
  // the channel line over the first seconds of the hook
  const o = vis(t, 0.3, 4.6, 0.6, 0.8);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", right: 80, top: 60, direction: "rtl", opacity: o * 0.9, font: `30px ${FONT_TEXT}`, color: GOLD, letterSpacing: 1 }}>تاریخ جاوید</div>
  );
};

export const V06Frame: React.FC<{ silent?: boolean; reel?: boolean }> = ({ silent, reel }) => {
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

export const V06: React.FC<{ silent?: boolean }> = ({ silent }) => (
  <AbsoluteFill>
    <V06Frame silent={silent} />
    {!silent && <Audio src={staticFile("v06/voice.mp3")} />}
    {!silent && MUSIC.file && <Audio src={staticFile(MUSIC.file)} volume={MUSIC.volume} />}
  </AbsoluteFill>
);

/** stills at chosen seconds: one frame per time, for review contact sheets */
export const V06Look: React.FC<{ times: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  return (
    <FootageTime.Provider value={times[Math.min(f, times.length - 1)]}>
      <V06Frame silent />
    </FootageTime.Provider>
  );
};

// review times: start, every map scene's middle, every card, a few footage shots per chapter
const SC = PLAN.scenes;
import sentRaw from "./sentences.json";
const SENT = sentRaw as { a: number; b: number }[];
export const LOOK: number[] = SENT.filter((_, i) => i % 6 === 2).map((s) => (s.a + s.b) / 2);
export const LOOK_OLD: number[] = [
  0.5, 2.5,
  ...SC.filter((s) => s.kind === "map").map((s) => s.at + (s.until - s.at) * 0.7),
  ...SC.filter((s) => s.kind === "card").map((s) => s.at + 1.2),
  ...SC.filter((s) => s.kind === "chapter").map((s) => s.at + 1.6),
].sort((a, b) => a - b);
export const useLookFps = () => useVideoConfig().fps;

// ───────── reels: two vertical cliffhanger parts cut from the long video ─────────
export const REELS = [
  { id: "V06-Reel1", from: 62.90, to: 119.00, part: "قسمت ۱ از ۳", title: "روزی که اورشلیم\nسقوط کرد", audio: "v06/reel1.mp3", end: "وقتی وارد شهر شدن، چه چیزی از دست رفت؟", next: "قسمت ۲ را از دست نده" },
  { id: "V06-Reel2", from: 958.40, to: 997.20, part: "قسمت ۲ از ۳", title: "نامه‌ای که یک\nامپراتوری را نابود کرد", audio: "v06/reel2.mp3", end: "شهربراز چه کرد؟", next: "قسمت ۳ را از دست نده" },
  { id: "V06-Reel3", from: 1082.50, to: 1130.60, part: "قسمت ۳ از ۳", title: "شبی که خسرو\nاز کاخش گریخت", audio: "v06/reel3.mp3", end: "خطر واقعی کجا بود؟", next: "داستان کامل را ببین" },
];
export const REEL_TAIL = 4.2;
const REEL_CHUNKS = chunksFrom(VO, 4, KEYWORDS);
export const Reel: React.FC<{ n: number; look?: number[] }> = ({ n, look }) => {
  const f = useCurrentFrame();
  const r = REELS[n];
  const local = look ? look[Math.min(f, look.length - 1)] : f / FPS;
  const t = Math.min(r.from + local, r.to);
  const end = local - (r.to - r.from);
  const endO = clamp(end / 0.5);
  return (
    <AbsoluteFill style={{ background: "#000", direction: "rtl" }}>
      <Dims.Provider value={{ w: 1080, h: 1920 }}>
        <FootageTime.Provider value={t}><V06Frame silent reel /></FootageTime.Provider>
      </Dims.Provider>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 700, background: "linear-gradient(180deg, rgba(0,0,0,.82), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(0deg, rgba(0,0,0,.85), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ display: "inline-block", font: `42px ${FONT_TEXT}`, color: "#120d07", background: GOLD, padding: "6px 32px 12px", borderRadius: 40 }}>{r.part}</div>
        <div style={{ font: `104px/1.16 ${FONT_NUM}`, color: INK, marginTop: 26, whiteSpace: "pre-line", textShadow: "0 6px 30px #000, 0 0 3px #000" }}>{r.title}</div>
      </div>
      <FootageTime.Provider value={t}>
        {end < 0 && <Captions chunks={REEL_CHUNKS} y={1330} w={1080} size={70} font={FONT_TEXT} accent="#FFC83D" max={980} />}
      </FootageTime.Provider>
      <div style={{ position: "absolute", bottom: 170, left: 0, right: 0, textAlign: "center", font: `34px ${FONT_TEXT}`, color: GOLD, opacity: 0.9 }}>تاریخ جاوید</div>
      {end > 0 && (
        <AbsoluteFill style={{ opacity: endO, background: "rgba(0,0,0,0.86)", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ font: `56px ${FONT_TEXT}`, color: INK, maxWidth: 900 }}>{r.end}</div>
          <div style={{ font: `104px/1.2 ${FONT_NUM}`, color: GOLD, marginTop: 30, transform: `scale(${0.92 + 0.08 * endO})` }}>ادامه‌ی ماجرا<br />در ویدیوی کامل</div>
          <div style={{ font: `48px ${FONT_TEXT}`, color: INK, marginTop: 40 }}>یوتیوب «تاریخ جاوید» · لینک در بیو</div>
          <div style={{ font: `40px ${FONT_TEXT}`, color: `${INK}bb`, marginTop: 30 }}>{r.next}</div>
        </AbsoluteFill>
      )}
      {!look && <Audio src={staticFile(r.audio)} />}
    </AbsoluteFill>
  );
};
export const reelFrames = (n: number) => Math.ceil((REELS[n].to - REELS[n].from + REEL_TAIL) * FPS);
