// V05 · the one-minute reel cut from the long video: the strongest lines of the narration, each over a picture of
// the long video (the same frames, in a 16:9 window on a vertical stage), a hook title, big word-by-word captions,
// and an open loop at the end that sends people to the full video and to follow.
// Audio is built separately (out/reel/… with tools/mix.mjs) from the same cuts: REEL_CUTS below.
import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { FootageTime } from "../footage/footage";
import { Frame, KEYWORDS, L, VO } from "./Petrov";

const FPS = 30;
const W = 1080, H = 1920;
const ACCENT = "#FFC83D";
const RED = "#ff3b2f";
const GAP = 0.22; // silence between two cuts

// each cut: narration line(s) n..m; vis = where the picture starts in the long video (default: the line itself)
type Cut = { n: number; m?: number; vis?: number };
const CUTS: Cut[] = [
  { n: 3, vis: L(3).start - 3.2 }, // over the СТАРТ board, then the satellites
  { n: 4 },
  { n: 38, m: 40 },
  { n: 47 },
  { n: 51 },
  { n: 53 },
  { n: 57 },
  { n: 63 },
];
export const REEL_CUTS = (() => {
  let at = 0.15;
  return CUTS.map((c) => {
    const a = L(c.n).start - 0.06, b = L(c.m ?? c.n).end + 0.18;
    const r = { ...c, a, b, at, vis: c.vis ?? a };
    at += b - a + GAP;
    return r;
  });
})();
const VOICE_END = REEL_CUTS[REEL_CUTS.length - 1].at + (REEL_CUTS[REEL_CUTS.length - 1].b - REEL_CUTS[REEL_CUTS.length - 1].a);
const CTA_AT = VOICE_END + 0.1;
export const REEL_END = CTA_AT + 4.6;

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const out3 = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clean = (s: string) => s.replace(/[‌]/g, "").replace(/[،؛؟!?.,:;«»"'()\-–—…]/g, "").trim();
const KW = KEYWORDS.map(clean);

/** reel time → the cut under the playhead and the long video's time to show */
const cutAt = (t: number) => {
  let k = REEL_CUTS.findIndex((c, i) => t < (REEL_CUTS[i + 1]?.at ?? Infinity));
  if (k < 0) k = REEL_CUTS.length - 1;
  const c = REEL_CUTS[k];
  return { k, c, src: c.vis + Math.max(0, Math.min(t - c.at, c.b - c.a + GAP)) };
};

/** caption cards in reel time: three words at a time */
type Card = { s: number; e: number; words: { w: string; s: number; kw: boolean }[] };
const CARDS: Card[] = (() => {
  const out: Card[] = [];
  for (const c of REEL_CUTS) {
    const ws = VO.words.filter((w) => w.line >= c.n && w.line <= (c.m ?? c.n)).map((w) => ({ w: w.w, s: w.s - c.a + c.at, e: w.e - c.a + c.at, kw: KW.includes(clean(w.w)) }));
    const n = Math.max(1, Math.ceil(ws.length / 3));
    let i = 0;
    for (let k = 0; k < n; k++) {
      const size = Math.ceil((ws.length - i) / (n - k));
      const part = ws.slice(i, i + size);
      i += size;
      if (part.length) out.push({ s: part[0].s, e: part[part.length - 1].e, words: part });
    }
  }
  out.forEach((c, k) => { const nx = out[k + 1]; c.e = nx ? Math.min(nx.s - 0.04, c.e + 0.5) : c.e + 0.4; });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CARDS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const k = out3((t - c.s + 0.04) / 0.12);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1330, direction: "rtl", textAlign: "center", font: `88px/1.25 "${FONT_NUM}"`, transform: `scale(${lerp(0.9, 1, k)})`, opacity: k }}>
      {c.words.map((x, i) => {
        const on = t >= x.s - 0.03;
        return (
          <span key={i} style={{ color: x.kw ? ACCENT : "#fff", opacity: on ? 1 : 0.35, textShadow: "0 6px 26px rgba(0,0,0,0.9)", WebkitTextStroke: "0" }}>
            {x.w}
            {i < c.words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

/** the hook title for the first seconds, then a quiet series line */
const Title: React.FC<{ t: number }> = ({ t }) => {
  const hookOut = REEL_CUTS[1].at + 0.2;
  if (t < hookOut) {
    const k = out3(t / 0.25);
    const shake = t < 0.5 ? Math.sin(t * 90) * 8 * (1 - t / 0.5) : 0;
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, direction: "rtl", textAlign: "center", transform: `translateX(${shake}px) scale(${lerp(1.25, 1, k)})`, opacity: k }}>
        <div style={{ display: "inline-block", font: `600 40px "${FONT_TEXT}"`, color: "#111", background: ACCENT, padding: "4px 22px 8px", borderRadius: 10 }}>۲۶ سپتامبر ۱۹۸۳ | کمی بعد از نیمه‌شب</div>
        <div style={{ font: `128px/1.12 "${FONT_NUM}"`, color: "#fff", marginTop: 18, textShadow: "0 8px 40px rgba(0,0,0,0.9)" }}>
          کمتر از <span style={{ color: RED }}>۳۰ دقیقه</span>
          <br />تا پایان دنیا
        </div>
      </div>
    );
  }
  const k = out3((t - hookOut) / 0.4);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 260, direction: "rtl", textAlign: "center", opacity: k }}>
      <div style={{ font: `76px/1.2 "${FONT_NUM}"`, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
        مردی که با یک <span style={{ color: ACCENT }}>«نه»</span>
        <br />دنیا را نجات داد
      </div>
    </div>
  );
};

/** the open loop and the asks */
const Cta: React.FC<{ t: number }> = ({ t }) => {
  if (t < CTA_AT) return null;
  const k = out3((t - CTA_AT) / 0.35);
  const k2 = out3((t - CTA_AT - 0.9) / 0.35);
  const k3 = out3((t - CTA_AT - 1.7) / 0.35);
  const pulse = 1 + 0.035 * Math.sin((t - CTA_AT) * 7);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.78 * k})` }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 430, direction: "rtl", textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
        <div style={{ font: `600 50px "${FONT_TEXT}"`, color: "#ddd" }}>به‌جای مدال…</div>
        <div style={{ font: `124px/1.15 "${FONT_NUM}"`, color: "#fff", marginTop: 10 }}>
          چه بلایی سر
          <br />
          <span style={{ color: ACCENT }}>پتروف</span> آمد؟
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 980, direction: "rtl", textAlign: "center", opacity: k2, transform: `scale(${lerp(0.85, 1, k2) * pulse})` }}>
        <div style={{ display: "inline-block", font: `76px/1.2 "${FONT_NUM}"`, color: "#111", background: ACCENT, padding: "18px 56px 28px", borderRadius: 26, boxShadow: "0 20px 60px rgba(255,200,61,0.35)" }}>ویدیوی کامل ▶ لینک در بایو</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1260, direction: "rtl", textAlign: "center", opacity: k3, transform: `translateY(${(1 - k3) * 30}px)` }}>
        <div style={{ font: `600 46px/1.6 "${FONT_TEXT}"`, color: "#fff" }}>
          <span style={{ color: RED }}>فالو</span> کن تا قصه‌ی بعدی را از دست ندهی
        </div>
      </div>
    </AbsoluteFill>
  );
};

const STAGE = { top: 590, w: 1180, h: 664 }; // the 16:9 window: a little wider than the screen, so it fills it

export const PetrovReel: React.FC<{ times?: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = times ? times[f] ?? 0 : f / fps;
  const { k, c, src } = cutAt(t);
  const since = t - c.at;
  const flash = k > 0 ? clamp(1 - since / 0.12) : 0;
  const punch = 1 + 0.05 * clamp(1 - since / 0.25);
  const sc = STAGE.w / 1920;
  return (
    <AbsoluteFill style={{ background: "#060606" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(255,40,24,${0.12 + 0.05 * Math.sin(t * 3)}) 0%, rgba(0,0,0,0) 60%)` }} />
      <div style={{ position: "absolute", left: (W - STAGE.w) / 2, top: STAGE.top, width: STAGE.w, height: STAGE.h, overflow: "hidden", transform: `scale(${punch})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${sc})`, transformOrigin: "0 0" }}>
          <FootageTime.Provider value={src}>
            <Frame t={src} preview captions={false} />
          </FootageTime.Provider>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,6,6,1) 0%, rgba(6,6,6,0) 12%, rgba(6,6,6,0) 82%, rgba(6,6,6,1) 100%)" }} />
      </div>
      <AbsoluteFill style={{ background: `rgba(255,255,255,${0.5 * flash})` }} />
      <Title t={t} />
      <Captions t={t} />
      {/* progress: how much of the story is left */}
      <div style={{ position: "absolute", left: 0, top: 0, width: `${clamp(t / REEL_END) * 100}%`, height: 10, background: RED }} />
      <Cta t={t} />
    </AbsoluteFill>
  );
};

export const REEL_LOOK = [0.3, 1.2, ...REEL_CUTS.map((c) => +(c.at + Math.min(1.6, (c.b - c.a) / 2)).toFixed(2)), +(CTA_AT + 0.6).toFixed(2), +(REEL_END - 0.2).toFixed(2)];

export const PetrovReelComps: React.FC = () => (
  <>
    <Composition id="V05-Reel" component={PetrovReel} durationInFrames={Math.round(REEL_END * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="V05-Reel-Look" component={PetrovReel} durationInFrames={REEL_LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: REEL_LOOK }} />
  </>
);
