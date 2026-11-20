// V05 | «مردی که با یک نه دنیا را نجات داد» (Stanislav Petrov, 26 Sept 1983) — horizontal YouTube documentary.
// Real footage and photos (tools/footage.mjs → footage.json) under the narration, plus code-made scenes where no
// camera was: the bunker's alarm board (a labelled reconstruction), the polar map of the flight paths, counters.
// Every time comes from the narration (vo.json): L(n) = line n, W(n, "word") = when that word is said.
import React from "react";
import { AbsoluteFill, Audio, Composition, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { FootageBed, FootageTime, SourceTag, shotAt, useT, type Manifest, type Shot } from "../footage/footage";
import { Captions } from "../footage/captions";
import { autoShots, chunksFrom, lineAt, narration, wordAt } from "../footage/vo";
import { arc, Flight, northUp, Pin, PLACES, PolarMap, proj, route, screenOf, type Cam, type LL } from "./map";
import man from "./footage.json";
import voRaw from "./vo.json";

// ───────────────────────── settings ─────────────────────────
const ID = "V05";
const VOICE = ""; // "v05/voice.mp3" once the narration is recorded
const MUSIC = { file: "", volume: 0.1 };
const ACCENT = "#FFC83D"; // caption keywords (the channel's yellow)
const RED = "#ff3b2f";
const GREEN = "#5dffb0";
const AMBER = "#ffb347";
const FONT_RU = "V05Oswald"; // Cyrillic for the board
export const KEYWORDS = ["«شلیک».", "شلیک", "نیم‌ساعت", "اعتماد", "نکند.", "۲۶۹", "شیطانی»", "«اوکو»،", "پتروف»،", "«START»", "دوم!", "پنجم!", "موشکی».", "پنج", "پنجاه‌پنجاه", "کاذب", "انتظار.", "توبیخ", "محرمانه", "۱۹۹۸", "«نه»."];
const US_ARCHIVE = "تصویر آرشیوی | مرکز فرماندهی آمریکا";
const US_RADAR = "تصویر آرشیوی | سیستم هشدار موشکی آمریکا";
const NASA_LAUNCH = "آرشیو ناسا | پرتاب موشک";
const TWEAKS: Record<string, Partial<Shot>> = {
  s02a: { focus: [0.5, 0.42], push: 0.12 },
  s05a: { label: US_ARCHIVE }, s09a: { label: US_ARCHIVE }, s31a: { label: US_ARCHIVE }, s34a: { label: US_ARCHIVE }, x2: { label: US_ARCHIVE }, x3: { label: US_ARCHIVE },
  s35a: { label: "آرشیو: آزمایش موشکی آمریکا" }, s35b: { label: "آرشیو: بمب‌افکن بی-۵۲ آمریکا" },
  s08a: { label: "آزمایش بمب هیدروژنی | ۱۹۵۲" }, s08b: { label: "آزمایش بمب هیدروژنی | ۱۹۵۲" }, s49b: { label: "آزمایش بمب هیدروژنی | ۱۹۵۲" }, s50b: { label: "آزمایش بمب هیدروژنی | ۱۹۵۲" },
  s50a: { label: "آزمایش اتمی نوادا | ۱۹۵۵", from: 3 },
  s23b: { label: US_RADAR }, s29a: { label: US_RADAR }, s37a: { label: US_RADAR }, s20a: { label: US_RADAR }, s21b: { label: US_RADAR }, s45b: { label: US_RADAR }, s41b: { label: US_RADAR }, s44b: { label: US_RADAR }, s19b: { label: US_RADAR },
  s16b: { label: "شبیه‌سازی گرافیکی", push: 0.08, rate: 0.6 },
  s03b: { label: NASA_LAUNCH }, s62a: { label: NASA_LAUNCH }, s07a: { label: NASA_LAUNCH }, s07b: { label: NASA_LAUNCH },
  s15a: { label: "رونالد ریگان | ۸ مارس ۱۹۸۳", push: 0.03 },
  s10a: { push: 0.1 }, s06a: { push: 0.08 }, s52a: { push: 0.1 },
};
// ──────────────────────────────────────────────────────────────

const fontHandle = delayRender("v05 font");
new FontFace(FONT_RU, `url('${staticFile("fonts/Oswald.ttf")}') format('truetype')`, { weight: "200 700" })
  .load()
  .then((f) => { document.fonts.add(f); continueRender(fontHandle); })
  .catch(() => continueRender(fontHandle));

const FPS = 30;
const W = 1920, H = 1080;
export const VO = narration(voRaw as never);
const END = VO.total + 1.2;
const MAN = man as unknown as Manifest;
const CHUNKS = chunksFrom(VO, 5, KEYWORDS);

export const L = (n: number) => lineAt(VO, n);
// shot sNN = narration line NN: the times always come from the narration in vo.json, never from the manifest
const LINES = [...new Set(VO.words.map((w) => w.line))];
// old film: the kit's "film" grade draws an SVG noise every frame (slow on a CPU render) — use "warm" and lay
// our own cheap grain (a noise tile, shifted every frame) over it instead
const OLD = new Set<string>();
// clips a little shorter than their shot: slow them down so they never freeze
const RATE: Record<string, number> = { s02a: 0.6, s18a: 0.85, s30a: 0.95, s52a: 0.95, s64a: 0.9, x2: 0.7, s67b: 0.85, s68a: 0.8, s70a: 0.7, s75a: 0.85 };
const SHOTS = autoShots({ clips: MAN.clips, shots: Object.fromEntries(LINES.map((n) => [`s${String(n).padStart(2, "0")}`, { t0: L(n).start, t1: L(n).end }])) } as never, END, TWEAKS).map((s) => {
  if (RATE[s.name]) s = { ...s, rate: RATE[s.name] };
  if (s.grade === "film" || s.grade === "mono") { OLD.add(s.name); return { ...s, grade: "warm" as const }; }
  return s;
});
const Wd = (n: number, w: string, occ = 1, frac = 0.5) => {
  try { return wordAt(VO, n, w, occ); } catch { const l = L(n); return l.start + (l.end - l.start) * frac; }
};
const next = (n: number) => (n < VO.words[VO.words.length - 1].line ? L(n + 1).start : END);

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const out3 = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const io = (x: number) => { const c = clamp(x); return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const vis = (t: number, a: number, b: number, fin = 0.3, fout = 0.3) => clamp((t - a) / fin) * clamp((b - t) / fout);
const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ───────────────────────── the alarm board (reconstruction) ─────────────────────────
type BoardState = { a: number; b: number; main: (t: number) => { ru: string; fa: string }; count: (t: number) => number; hot?: boolean; stampAt?: number; title?: string; offAt?: number; steady?: boolean };

const Scan: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.24) 0px, rgba(0,0,0,0.24) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.78) 100%)" }} />
  </>
);

const Recon: React.FC<{ text?: string }> = ({ text = "بازسازی گرافیکی" }) => (
  <div style={{ position: "absolute", left: 56, top: 994, direction: "rtl", font: `600 24px "${FONT_TEXT}"`, color: "#fff", opacity: 0.7, padding: "6px 14px", background: "rgba(0,0,0,0.42)", borderRadius: 8 }}>{text}</div>
);

const Board: React.FC<{ st: BoardState }> = ({ st }) => {
  const t = useT();
  const k = t - st.a;
  if (t < st.a || t >= st.b) return null;
  // the tubes strike: two stutters, then a slow alarm pulse
  const off = st.offAt != null ? 1 - clamp((t - st.offAt) / 0.9) : 1;
  const strike = (st.steady ? 1 : k < 0.07 ? 0 : k < 0.13 ? 0.7 : k < 0.2 ? 0.12 : k < 0.27 ? 0.85 : 1) * off;
  const pulse = 0.72 + 0.28 * Math.abs(Math.sin(k * Math.PI * 1.15));
  const glow = strike * pulse * (0.96 + 0.04 * Math.sin(t * 61));
  const m = st.main(t);
  const long = m.ru.length > 8;
  const n = st.count(t);
  const stamp = st.stampAt != null && t >= st.stampAt ? out3((t - st.stampAt) / 0.2) : 0;
  const dim = st.title ? 0.3 : 1 - stamp * 0.72;
  const push = 1 + 0.035 * io(k / Math.max(1, st.b - st.a));
  return (
    <AbsoluteFill style={{ background: "#050404" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, opacity: dim }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 34%, rgba(255,40,24,${0.26 * glow}) 0%, rgba(120,10,6,${0.12 * glow}) 38%, rgba(0,0,0,0) 70%)` }} />
        {/* header */}
        <div style={{ position: "absolute", left: 210, top: 78, width: 1500, display: "flex", justifyContent: "space-between", direction: "ltr", font: `500 26px "${FONT_RU}"`, letterSpacing: 5, color: AMBER, opacity: 0.62 }}>
          <span>ЦЕНТРАЛЬНЫЙ КОМАНДНЫЙ ПУНКТ | СЕРПУХОВ-15</span>
          <span>26.09.1983</span>
        </div>
        {/* the big lamp panel */}
        <div style={{ position: "absolute", left: 210, top: 140, width: 1500, height: 400, borderRadius: 18, background: "linear-gradient(180deg, #1c0504 0%, #0d0202 100%)", border: "5px solid #3b0d0a", boxShadow: `0 0 ${120 * glow}px rgba(255,40,24,${0.45 * glow}), inset 0 0 90px rgba(0,0,0,0.9)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ direction: "ltr", font: `700 ${long ? 122 : 310}px/1 "${FONT_RU}"`, letterSpacing: long ? 5 : 26, paddingLeft: long ? 5 : 26, color: `rgba(255,${Math.round(58 + 40 * glow)},${Math.round(40 + 20 * glow)},${0.14 + 0.86 * glow})`, textShadow: `0 0 26px rgba(255,60,40,${glow}), 0 0 90px rgba(255,30,20,${0.8 * glow})`, whiteSpace: "nowrap" }}>{m.ru}</div>
        </div>
        {/* Persian reading of the lamp */}
        <div style={{ position: "absolute", left: 0, top: 560, width: W, textAlign: "center", direction: "rtl", font: `66px/1.2 "${FONT_NUM}"`, color: "#fff", opacity: 0.94 * strike, textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>{m.fa}</div>
        {/* launch lamps 1–5 */}
        <div style={{ position: "absolute", left: 210, top: 676, direction: "ltr", font: `500 22px "${FONT_RU}"`, letterSpacing: 4, color: AMBER, opacity: 0.6 }}>ЗАПУСКИ</div>
        {[1, 2, 3, 4, 5].map((i) => {
          const on = i <= n;
          return (
            <div key={i} style={{ position: "absolute", left: 210 + (i - 1) * 152, top: 712, width: 132, height: 86, borderRadius: 10, border: `3px solid ${on ? "#ff5a48" : "#3b0d0a"}`, background: on ? `rgba(255,50,34,${0.55 + 0.4 * pulse})` : "#120303", boxShadow: on ? `0 0 ${46 * pulse}px rgba(255,50,34,0.75)` : "none", display: "flex", alignItems: "center", justifyContent: "center", font: `700 54px "${FONT_RU}"`, color: on ? "#fff" : "#4a1512" }}>{i}</div>
          );
        })}
        {/* confidence */}
        <div style={{ position: "absolute", left: 1130, top: 676, width: 580, direction: "ltr", textAlign: "right", font: `500 22px "${FONT_RU}"`, letterSpacing: 4, color: AMBER, opacity: 0.6 }}>ДОСТОВЕРНОСТЬ</div>
        <div style={{ position: "absolute", left: 1130, top: 712, width: 580, height: 86, borderRadius: 10, border: `3px solid ${st.hot ? AMBER : "#5a3a12"}`, background: st.hot ? `rgba(255,170,60,${0.2 + 0.25 * pulse})` : "rgba(255,170,60,0.07)", boxShadow: st.hot ? `0 0 ${60 * pulse}px rgba(255,170,60,0.6)` : "none", display: "flex", alignItems: "center", justifyContent: "center", direction: "ltr", font: `700 50px "${FONT_RU}"`, letterSpacing: 10, color: st.hot ? "#fff" : AMBER, opacity: st.hot ? 1 : 0.75 }}>ВЫСШАЯ</div>
        {st.hot && <div style={{ position: "absolute", left: 1130, top: 600, width: 580, textAlign: "center", direction: "rtl", font: `600 38px "${FONT_TEXT}"`, color: AMBER, opacity: out3(k / 0.4) }}>سطح اطمینان: بالاترین</div>}
      </AbsoluteFill>
      <Scan />
      {stamp > 0 && (
        <div style={{ position: "absolute", left: 0, top: 230, width: W, display: "flex", justifyContent: "center", opacity: clamp(stamp * 2) }}>
          <div style={{ transform: `rotate(-7deg) scale(${lerp(2.1, 1, stamp)})`, border: `10px solid ${GREEN}`, borderRadius: 22, padding: "18px 64px 26px", textAlign: "center", background: "rgba(2,14,9,0.86)", boxShadow: "0 0 80px rgba(93,255,176,0.35)" }}>
            <div style={{ direction: "rtl", font: `170px/1.15 "${FONT_NUM}"`, color: GREEN }}>هشدار کاذب</div>
            <div style={{ direction: "ltr", font: `600 44px "${FONT_RU}"`, letterSpacing: 12, color: GREEN, opacity: 0.8 }}>ЛОЖНАЯ ТРЕВОГА</div>
          </div>
        </div>
      )}
      {st.title && (
        <div style={{ position: "absolute", left: 0, top: 300, width: W, textAlign: "center", direction: "rtl", font: `210px/1.2 "${FONT_NUM}"`, color: "#fff", opacity: out3(k / 0.5), transform: `scale(${lerp(1.12, 1, out3(k / 0.6))})`, textShadow: "0 8px 60px rgba(0,0,0,0.9)" }}>
          {st.title.split("|")[0]}<span style={{ color: ACCENT }}>{st.title.split("|")[1]}</span>{st.title.split("|")[2]}
        </div>
      )}
      {st.offAt != null && t > st.offAt + 3.2 && (
        <div style={{ position: "absolute", left: 0, top: 290, width: W, textAlign: "center", opacity: out3((t - st.offAt - 3.2) / 0.8) }}>
          <div style={{ direction: "rtl", font: `150px/1.2 "${FONT_NUM}"`, color: GREEN, textShadow: "0 0 70px rgba(93,255,176,0.45)" }}>هیچ موشکی در کار نبود</div>
        </div>
      )}
      <Recon />
    </AbsoluteFill>
  );
};

const START = { ru: "СТАРТ", fa: "«شلیک»" };
const STRIKE = { ru: "РАКЕТНОЕ НАПАДЕНИЕ", fa: "«حمله‌ی موشکی»" };
const BOARDS: BoardState[] = [
  { a: Wd(2, "ناگهان", 1, 0.55), b: L(3).start - 0.05, main: () => START, count: () => 1 },
  { a: L(27).start, b: Wd(28, "مونتانا", 1, 0.45) + 0.5, main: () => START, count: () => 1 },
  { a: L(33).start, b: next(33), main: () => START, count: () => 1, hot: true },
  { a: L(38).start, b: next(40), main: (t) => (t >= Wd(40, "نوشته", 1, 0.6) ? STRIKE : START), count: (t) => (t < Wd(38, "دوم") ? 1 : t < Wd(39, "سوم") ? 2 : t < Wd(39, "چهارم") ? 3 : t < Wd(39, "پنجم") ? 4 : 5) },
  { a: L(43).start, b: next(43), main: () => STRIKE, count: () => 5, steady: true, title: "|سه| دلیل برای شک" },
  { a: L(53).start, b: next(53), main: () => STRIKE, count: () => 5, stampAt: Wd(53, "هشدار", 1, 0.6) },
  { a: L(60).start, b: next(60), main: () => STRIKE, steady: true, offAt: L(60).start + 1.1, count: (t) => Math.max(0, 5 - Math.floor(Math.max(0, t - L(60).start - 0.5) / 0.45)) },
];

// ───────────────────────── the polar map scenes ─────────────────────────
const P1 = arc(PLACES.malmstrom, PLACES.moscow);
// five launches from the Montana fields toward the western USSR
const FIVE = [0, 1, 2, 3, 4].map((i) => arc([-111.19 + (i - 2) * 1.1, 47.5 + (i % 2) * 0.7], [37.62 + (i - 2) * 5.5, 55.75 + ((i * 7) % 5) - 2]));
// what a real first strike would look like: hundreds of launches at once
const MANY = Array.from({ length: 120 }, (_, i) => {
  const sea = rnd(i * 3.1) > 0.72;
  const from: LL = sea ? [rnd(i) > 0.5 ? -40 - rnd(i + 5) * 25 : -150 - rnd(i + 5) * 20, 38 + rnd(i + 9) * 25] : [-91 - rnd(i + 1) * 22, 38 + rnd(i + 2) * 11];
  const to: LL = [26 + rnd(i + 3) * 108, 43 + rnd(i + 4) * 24];
  return { pts: arc(from, to, 40), d: rnd(i + 7) * 0.45 };
});

const camAt = (ll: LL, scale: number) => { const [x, y] = proj(ll); return { cx: x, cy: y, scale }; };
const mix3 = (a: { cx: number; cy: number; scale: number }, b: { cx: number; cy: number; scale: number }, k: number) => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), scale: lerp(a.scale, b.scale, k) });
const WIDE = { cx: -30, cy: 120, scale: 1.1 };
/** a plain region name on the map */
const Region: React.FC<{ at: LL; cam: Cam; text: string; o?: number }> = ({ at, cam, text, o = 1 }) => {
  const [sx, sy] = screenOf(at, cam);
  return <div style={{ position: "absolute", left: sx - 200, top: sy - 30, width: 400, textAlign: "center", direction: "rtl", font: `44px/1.2 "${FONT_NUM}"`, color: "#9fd8c2", opacity: 0.6 * o, letterSpacing: 0 }}>{text}</div>;
};
const Regions: React.FC<{ cam: Cam; o?: number }> = ({ cam, o = 1 }) => (
  <>
    <Region at={[-100, 39]} cam={cam} text="آمریکا" o={o} />
    <Region at={[78, 58]} cam={cam} text="اتحاد شوروی" o={o} />
  </>
);

/** a label pinned to a place of the map (HTML, so Persian shapes right) */
const Tag: React.FC<{ at: LL; cam: Cam; text: string; sub?: string; dx?: number; dy?: number; color?: string; o?: number }> = ({ at, cam, text, sub, dx = 26, dy = -58, color = "#fff", o = 1 }) => {
  const [sx, sy] = screenOf(at, cam);
  return (
    <div style={{ position: "absolute", left: sx + dx, top: sy + dy, opacity: o, direction: "rtl", whiteSpace: "nowrap", padding: "6px 18px 8px", background: "rgba(2,10,8,0.82)", border: `2px solid ${color}`, borderRadius: 12 }}>
      <div style={{ font: `40px/1.25 "${FONT_NUM}"`, color }}>{text}</div>
      {sub && <div style={{ font: `600 24px/1.3 "${FONT_TEXT}"`, color: "#cfe9df" }}>{sub}</div>}
    </div>
  );
};

// Korean Air Lines 007, 1 Sept 1983 (approximate): the planned airway, and the way it actually flew
const KAL_PLAN = route([[-149.9, 61.2], [-161.8, 60.8], [-171.8, 59.3], [178, 56.5], [165, 52], [159.3, 49.7], [152, 45.5], [146, 42.4], [139.5, 37.9], [127, 37.5]]);
const KAL_REAL = route([[-149.9, 61.2], [-161.8, 60.8], [-172, 60.5], [176, 59.5], [165, 56.5], [159, 53.5], [150, 50.2], [143.5, 47.3], [141.3, 46.4]]);
const KAL_END: LL = [141.3, 46.4];

const MapScenes: React.FC = () => {
  const t = useT();
  // s13–14 | the airliner that strayed
  const a13 = L(13).start, b14 = next(14);
  if (t >= a13 && t < b14) {
    const hit = Wd(13, "هدف", 1, 0.85);
    const k = clamp((t - a13 - 0.5) / Math.max(1, hit - a13 - 0.6));
    const c0 = proj([178, 54]), c1 = proj([152, 49]);
    const z = io((t - a13) / (b14 - a13));
    const cam: Cam = { cx: lerp(c0[0], c1[0], z), cy: lerp(c0[1], c1[1], z), scale: lerp(2.5, 3.5, z), rot: northUp(168) };
    const boom = t >= hit ? (t - hit) : -1;
    const [ex, ey] = proj(KAL_END);
    const plan = KAL_PLAN.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("");
    return (
      <AbsoluteFill>
        <PolarMap t={t} {...cam}>
          <path d={plan} fill="none" stroke={GREEN} strokeWidth={2.5 / cam.scale} strokeDasharray={`${9 / cam.scale} ${8 / cam.scale}`} opacity={0.75 * clamp((t - a13) / 0.5)} />
          <Flight pts={KAL_REAL} p={k} s={cam.scale} color="#ffd34d" width={3.5} head={boom < 0} />
          {boom >= 0 && (
            <>
              <circle cx={ex} cy={ey} r={(14 + boom * 60) / cam.scale} fill="none" stroke={RED} strokeWidth={4 / cam.scale} opacity={clamp(1 - boom / 1.2)} />
              <circle cx={ex} cy={ey} r={(11 + 3 * Math.sin(t * 9)) / cam.scale} fill={RED} />
            </>
          )}
        </PolarMap>
        <Region at={[112, 62]} cam={cam} text="اتحاد شوروی" />
        <Tag at={[-149.9, 61.2]} cam={cam} text="آنکوریج" dx={-60} dy={-86} color="#9fd8c2" />
        <Tag at={[127, 37.5]} cam={cam} text="سئول" dx={-150} dy={10} color="#9fd8c2" />
        <Tag at={[160, 56]} cam={cam} text="کامچاتکا" dx={-70} dy={-100} color="#9fd8c2" o={clamp((k - 0.45) / 0.1) * 0.9} />
        <Tag at={KAL_END} cam={cam} text="جزیره‌ی ساخالین" sub="هواپیما هدف قرار گرفت" dx={40} dy={-40} color={RED} o={boom >= 0 ? clamp(boom / 0.3) : 0} />
        <div style={{ position: "absolute", right: 70, top: 56, direction: "rtl", textAlign: "right", opacity: clamp((t - a13 - 0.2) / 0.4) }}>
          <div style={{ display: "inline-block", font: `600 30px "${FONT_TEXT}"`, color: "#111", background: ACCENT, padding: "2px 16px 4px", borderRadius: 6 }}>۱ سپتامبر ۱۹۸۳</div>
          <div style={{ font: `66px/1.3 "${FONT_NUM}"`, color: "#fff" }}>پرواز ۰۰۷ هواپیمایی کره</div>
          <div style={{ direction: "rtl", font: `600 28px/1.7 "${FONT_TEXT}"`, color: "#cfe9df" }}><span style={{ color: GREEN }}>- - -</span> مسیر برنامه‌ریزی‌شده &nbsp; <span style={{ color: "#ffd34d" }}>——</span> مسیر واقعی</div>
        </div>
        <Scan />
        <Recon text="مسیر تقریبی | بازسازی" />
      </AbsoluteFill>
    );
  }
  // s17 | Moscow and the secret base south of it
  const a17 = L(17).start, b17 = next(17);
  if (t >= a17 && t < b17) {
    const k = io((t - a17) / (b17 - a17));
    const cam = mix3({ ...camAt(PLACES.moscow, 2.2), cy: camAt(PLACES.moscow, 1).cy - 40 }, camAt([37.3, 55.4], 7.5), out3((t - a17) / 2.6));
    const o = clamp((t - Wd(17, "پایگاه", 1, 0.5)) / 0.3);
    return (
      <AbsoluteFill>
        <PolarMap t={t} {...cam}>
          <Pin at={PLACES.moscow} t={t} s={cam.scale} size={10} />
          <g opacity={o}><Pin at={PLACES.serpukhov15} t={t + 0.4} s={cam.scale} color={RED} size={10} /></g>
        </PolarMap>
        <Tag at={PLACES.moscow} cam={cam} text="مسکو" dx={30} dy={-78} color={GREEN} />
        <Tag at={PLACES.serpukhov15} cam={cam} text="سرپوخوف-۱۵" sub="مرکز هشدار ماهواره‌ای | محرمانه" dx={-430} dy={26 + (1 - k) * 6} color={RED} o={o} />
        <Scan />
      </AbsoluteFill>
    );
  }
  // s28 | one missile, Montana → USSR, over the pole
  const a28 = Wd(28, "مونتانا", 1, 0.45) + 0.5, b28 = next(28);
  if (t >= a28 && t < b28) {
    const p = io((t - a28) / (b28 - a28 + 1.5)) * 0.9;
    const cam = mix3(camAt(PLACES.malmstrom, 2.6), WIDE, out3((t - a28) / 1.6));
    return (
      <AbsoluteFill>
        <PolarMap t={t} {...cam}>
          <Flight pts={P1} p={p} s={cam.scale} width={4} />
          <Pin at={PLACES.malmstrom} t={t} s={cam.scale} color={RED} />
          <Pin at={PLACES.moscow} t={t + 0.3} s={cam.scale} />
        </PolarMap>
        <Regions cam={cam} o={clamp((t - a28 - 1) / 0.5)} />
        <Tag at={PLACES.malmstrom} cam={cam} text="پایگاه مالمستروم" sub="مونتانا | آمریکا" dx={-330} dy={30} color={RED} />
        <Tag at={PLACES.moscow} cam={cam} text="مسکو" dx={28} dy={20} color={GREEN} o={clamp((t - a28 - 1) / 0.4)} />
        <Tag at={PLACES.pole} cam={cam} text="قطب شمال" dx={-90} dy={-96} color="#8fb8aa" o={clamp((t - a28 - 1.6) / 0.4) * 0.8} />
        <Scan />
        <Recon text="مسیر تقریبی | بازسازی" />
      </AbsoluteFill>
    );
  }
  // s42 | five on their way, 24,000 km/h
  const a42 = L(42).start, b42 = next(42);
  if (t >= a42 && t < b42) {
    const k = (t - a42) / (b42 - a42);
    const cam = mix3(WIDE, { cx: 0, cy: 70, scale: 1.45 }, io(k));
    const kmh = Math.round(lerp(0, 24000, out3((t - Wd(42, "۲۴", 1, 0.3) + 0.5) / 1.1)) / 100) * 100;
    return (
      <AbsoluteFill>
        <PolarMap t={t} {...cam}>
          {FIVE.map((pts, i) => <Flight key={i} pts={pts} p={0.3 + k * 0.28 - i * 0.035} s={cam.scale} />)}
          <Pin at={PLACES.malmstrom} t={t} s={cam.scale} color={RED} />
          <Pin at={PLACES.moscow} t={t + 0.3} s={cam.scale} />
        </PolarMap>
        <Regions cam={cam} />
        <div style={{ position: "absolute", right: 110, top: 90, direction: "rtl", textAlign: "right" }}>
          <div style={{ font: `190px/1 "${FONT_NUM}"`, color: "#fff", textShadow: "0 0 50px rgba(255,59,47,0.55)" }}>{fa(kmh.toLocaleString("en-US").replace(/,/g, "٬"))}</div>
          <div style={{ font: `600 44px "${FONT_TEXT}"`, color: RED }}>کیلومتر در ساعت</div>
        </div>
        <Scan />
        <Recon text="مسیر تقریبی | بازسازی" />
      </AbsoluteFill>
    );
  }
  // s47–48 | «only five?» → what a real attack would look like
  const a47 = L(47).start, a48 = L(48).start, b48 = next(48);
  if (t >= a47 && t < b48) {
    const many = t >= a48;
    const km = many ? (t - a48) / (b48 - a48) : 0;
    const cam = mix3({ cx: -30, cy: -40, scale: 1.1 }, { cx: -20, cy: -60, scale: 1.22 }, io((t - a47) / (b48 - a47)));
    const five = t >= Wd(47, "پنج", 1, 0.7) - 0.15;
    return (
      <AbsoluteFill>
        <PolarMap t={t} {...cam}>
          {many && MANY.map((m, i) => <Flight key={i} pts={m.pts} p={(km * 1.9 - m.d) * 0.8} s={cam.scale} width={1.8} color="#ff7a45" dim={0.85} glow={false} />)}
          {FIVE.map((pts, i) => <Flight key={i} pts={pts} p={0.62} s={cam.scale} dim={many ? 0.35 : 1} />)}
        </PolarMap>
        <div style={{ position: "absolute", right: 110, top: 70, width: 900, direction: "rtl", textAlign: "right", opacity: vis(t, a47 + 0.1, b48, 0.4, 0.3) }}>
          {!many ? (
            <>
              <div style={{ font: `600 46px/1.6 "${FONT_TEXT}"`, color: "#e8f6f0" }}>جنگ جهانی سوم…</div>
              <div style={{ font: `250px/0.95 "${FONT_NUM}"`, color: five ? RED : "rgba(255,255,255,0.12)", transform: `scale(${five ? lerp(1.25, 1, out3((t - Wd(47, "پنج", 1, 0.7) + 0.15) / 0.3)) : 1})`, transformOrigin: "100% 50%" }}>۵</div>
              <div style={{ font: `600 46px/1.3 "${FONT_TEXT}"`, color: "#e8f6f0" }}>فقط با پنج موشک؟</div>
            </>
          ) : (
            <>
              <div style={{ font: `600 46px/1.6 "${FONT_TEXT}"`, color: "#e8f6f0" }}>حمله‌ی واقعی:</div>
              <div style={{ font: `210px/1 "${FONT_NUM}"`, color: "#ff7a45" }}>صدها</div>
              <div style={{ font: `600 46px/1.3 "${FONT_TEXT}"`, color: "#e8f6f0" }}>موشک، هم‌زمان</div>
            </>
          )}
        </div>
        <Scan />
        <Recon text="شبیه‌سازی گرافیکی" />
      </AbsoluteFill>
    );
  }
  // s57–58 | Moscow in the cross-hairs… and the time of impact passes
  const a57 = L(57).start, a58 = L(58).start, b58 = next(58);
  if (t >= a57 && t < b58) {
    const passed = t >= Wd(58, "گذشت", 1, 0.8);
    const k = clamp((t - a57) / (a58 - a57 + 1.2));
    const cam = mix3({ ...WIDE, scale: 1.9, cx: 150, cy: 120 }, camAt(PLACES.moscow, 4.6), io((t - a57) / 3.2));
    const gone = passed ? clamp((t - Wd(58, "گذشت", 1, 0.8)) / 0.5) : 0;
    const [mx, my] = proj(PLACES.moscow);
    const blink = 0.55 + 0.45 * Math.abs(Math.sin(t * 5));
    return (
      <AbsoluteFill>
        <PolarMap t={t} {...cam}>
          {FIVE.map((pts, i) => <Flight key={i} pts={pts} p={0.74 + k * 0.24 - i * 0.012} s={cam.scale} dim={1 - gone} />)}
          {!passed && [26, 44].map((r) => <circle key={r} cx={mx} cy={my} r={r / cam.scale * 3} fill="none" stroke={RED} strokeWidth={3 / cam.scale} opacity={blink} />)}
          <Pin at={PLACES.moscow} t={t} s={cam.scale} color={passed ? GREEN : RED} size={11} />
        </PolarMap>
        <Tag at={PLACES.moscow} cam={cam} text="مسکو" sub={passed ? "هیچ برخوردی ثبت نشد" : "هدف"} dx={70} dy={-150} color={passed ? GREEN : RED} />
        <Scan />
        <Recon text="بازسازی گرافیکی" />
      </AbsoluteFill>
    );
  }
  return null;
};

// ───────────────────────── text pieces over the footage ─────────────────────────
/** the opening stamp: where and when */
const Opening: React.FC = () => {
  const t = useT();
  const a = 0.25, b = Wd(2, "ناگهان", 1, 0.55) - 0.2;
  const o = vis(t, a, b, 0.25, 0.3);
  if (o <= 0) return null;
  const line2 = "پناهگاه سرپوخوف-۱۵ | نزدیک مسکو";
  const n = Math.round(clamp((t - a - 0.5) / 1.1) * line2.split(" ").length);
  return (
    <div style={{ position: "absolute", right: 96, top: 120, direction: "rtl", textAlign: "right", opacity: o }}>
      <div style={{ display: "inline-block", font: `600 30px "${FONT_TEXT}"`, color: "#111", background: ACCENT, padding: "2px 16px 4px", borderRadius: 6 }}>۲۶ سپتامبر ۱۹۸۳</div>
      <div style={{ font: `96px/1.25 "${FONT_NUM}"`, color: "#fff", textShadow: "0 4px 34px rgba(0,0,0,0.75)", transform: `translateX(${(1 - out3((t - a) / 0.4)) * 60}px)` }}>کمی بعد از نیمه‌شب</div>
      <div style={{ font: `600 36px "${FONT_TEXT}"`, color: "#e6e6e6", textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>{line2.split(" ").slice(0, n).join(" ")}</div>
    </div>
  );
};

/** s04 | the countdown to impact */
const Countdown: React.FC = () => {
  const t = useT();
  const a = L(4).start, b = next(4);
  const o = vis(t, a, b, 0.2, 0.25);
  if (o <= 0) return null;
  const left = 30 * 60 - 0.01 - (t - a);
  const mm = Math.floor(left / 60), ss = Math.floor(left % 60), cc = Math.floor((left * 100) % 100);
  const cell = (s: string, key: number, w = 150) => <span key={key} style={{ display: "inline-block", width: w, textAlign: "center" }}>{s}</span>;
  const str = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}:${String(cc).padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", left: 0, top: 250, width: W, textAlign: "center", opacity: o, transform: `scale(${lerp(1.12, 1, out3((t - a) / 0.35))})` }}>
      <div style={{ direction: "rtl", font: `600 46px "${FONT_TEXT}"`, color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.9)" }}>زمان تا برخورد</div>
      <div style={{ direction: "ltr", font: `270px/1.05 "${FONT_NUM}"`, color: RED, textShadow: "0 0 70px rgba(255,59,47,0.6), 0 6px 30px rgba(0,0,0,0.8)" }}>
        {str.split("").map((ch, i) => (ch === ":" ? cell(":", i, 70) : cell(fa(ch), i)))}
      </div>
    </div>
  );
};

/** a big number with its label, lower left */
const Stat: React.FC<{ a: number; b: number; num: string; label: string; color?: string }> = ({ a, b, num, label, color = "#fff" }) => {
  const t = useT();
  const o = vis(t, a, b, 0.2, 0.3);
  if (o <= 0) return null;
  const k = out3((t - a) / 0.35);
  return (
    <div style={{ position: "absolute", left: 110, top: 430, direction: "rtl", textAlign: "right", opacity: o, transform: `translateY(${(1 - k) * 40}px)` }}>
      <div style={{ font: `260px/1 "${FONT_NUM}"`, color, textShadow: "0 6px 50px rgba(0,0,0,0.85)" }}>{num}</div>
      <div style={{ display: "inline-block", font: `600 44px "${FONT_TEXT}"`, color: "#111", background: ACCENT, padding: "2px 22px 6px", borderRadius: 8 }}>{label}</div>
    </div>
  );
};

/** s11 | back to September 1983 */
const DateCard: React.FC = () => {
  const t = useT();
  const a = Wd(11, "سپتامبر", 1, 0.7) - 0.15, b = L(12).end + 0.3;
  const o = vis(t, a, b, 0.25, 0.3);
  if (o <= 0) return null;
  const k = out3((t - a) / 0.5);
  return (
    <div style={{ position: "absolute", left: 0, top: 300, width: W, textAlign: "center", opacity: o }}>
      <div style={{ direction: "rtl", font: `250px/1.1 "${FONT_NUM}"`, color: "#fff", letterSpacing: 0, textShadow: "0 8px 60px rgba(0,0,0,0.9)", transform: `scale(${lerp(1.18, 1, k)})` }}>سپتامبر <span style={{ color: ACCENT }}>۱۹۸۳</span></div>
      <div style={{ margin: "0 auto", width: 620 * k, height: 6, background: RED, borderRadius: 3 }} />
      <div style={{ direction: "rtl", font: `600 46px/1.9 "${FONT_TEXT}"`, color: "#fff", opacity: clamp((t - L(12).start) / 0.3), textShadow: "0 2px 18px rgba(0,0,0,0.9)" }}>سردترین روزهای جنگ سرد</div>
    </div>
  );
};

/** s19 | the man: name, rank, age */
const NameCard: React.FC = () => {
  const t = useT();
  const a = Wd(19, "«استانیسلاو", 1, 0.3), b = L(20).end + 0.2;
  const o = vis(t, a, b, 0.25, 0.3);
  if (o <= 0) return null;
  const k = out3((t - a) / 0.45);
  return (
    <div style={{ position: "absolute", right: 110, top: 470, direction: "rtl", textAlign: "right", opacity: o }}>
      <div style={{ width: 12, height: 190, background: RED, position: "absolute", right: -34, top: 14, transform: `scaleY(${k})`, transformOrigin: "50% 0%" }} />
      <div style={{ font: `150px/1.15 "${FONT_NUM}"`, color: "#fff", textShadow: "0 6px 40px rgba(0,0,0,0.9)", transform: `translateX(${(1 - k) * 70}px)` }}>استانیسلاو پتروف</div>
      <div style={{ font: `600 46px "${FONT_TEXT}"`, color: ACCENT, textShadow: "0 2px 16px rgba(0,0,0,0.9)", opacity: clamp((t - a - 0.35) / 0.3) }}>سرهنگ دوم | ۴۴ ساله | افسر کشیک آن شب</div>
    </div>
  );
};

/** s44–s48 | the three reasons, stacking up on the right */
const REASONS = [
  { n: 44, title: "دلیل اول", text: "سیستم تازه بود و پر از اشکال" },
  { n: 45, title: "دلیل دوم", text: "رادار زمینی: هیچ موشکی ندید" },
  { n: 46, title: "دلیل سوم", text: "فقط پنج موشک؟" },
];
const Reasons: React.FC = () => {
  const t = useT();
  const a = L(44).start, b = L(47).start + 0.3;
  if (t < a || t >= b) return null;
  const all = vis(t, a, b, 0.2, 0.35);
  return (
    <div style={{ position: "absolute", right: 90, top: 120, width: 640, opacity: all }}>
      {REASONS.map((r, i) => {
        const s = L(r.n).start + (i === 0 ? 0.1 : 0);
        if (t < s) return null;
        const k = out3((t - s) / 0.4);
        const active = t < (i < 2 ? L(REASONS[i + 1].n).start : b);
        return (
          <div key={i} style={{ direction: "rtl", marginBottom: 18, padding: "14px 26px 18px", borderRadius: 16, background: active ? "rgba(8,8,10,0.86)" : "rgba(8,8,10,0.62)", borderRight: `10px solid ${active ? ACCENT : "#6b6b6b"}`, transform: `translateX(${(1 - k) * 120}px)`, opacity: k * (active ? 1 : 0.72) }}>
            <div style={{ font: `600 30px "${FONT_TEXT}"`, color: active ? ACCENT : "#bdbdbd" }}>{r.title}</div>
            <div style={{ font: `54px/1.3 "${FONT_NUM}"`, color: "#fff" }}>{r.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** s55 | the wait: one minute… five… ten */
const Wait: React.FC = () => {
  const t = useT();
  const a = L(55).start, b = next(55);
  if (t < a || t >= b) return null;
  const t5 = Wd(55, "پنج", 1, 0.45), t10 = Wd(55, "ده", 1, 0.8);
  const n = t < t5 ? 1 : t < t10 ? 5 : 10;
  const since = t - (n === 1 ? a : n === 5 ? t5 : t10);
  const k = out3(since / 0.3);
  const fill = lerp(n === 1 ? 0 : n === 5 ? 1 / 28 : 5 / 28, n / 28, out3(since / 0.8));
  return (
    <AbsoluteFill style={{ background: "#040404" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(255,40,24,${0.1 + 0.05 * Math.sin(t * 6.3)}) 0%, rgba(0,0,0,0) 62%)` }} />
      <div style={{ position: "absolute", left: 0, top: 150, width: W, textAlign: "center", direction: "rtl" }}>
        <div style={{ font: `430px/1 "${FONT_NUM}"`, color: "#fff", transform: `scale(${lerp(1.3, 1, k)})`, opacity: 0.25 + 0.75 * k }}>{fa(n)}</div>
        <div style={{ font: `600 60px "${FONT_TEXT}"`, color: RED, marginTop: -10 }}>دقیقه گذشت</div>
      </div>
      <div style={{ position: "absolute", left: 360, top: 740, width: 1200, height: 10, borderRadius: 5, background: "#2a1211" }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 5, background: RED, boxShadow: "0 0 24px rgba(255,59,47,0.8)" }} />
      </div>
      <div style={{ position: "absolute", left: 360, top: 762, width: 1200, display: "flex", justifyContent: "space-between", direction: "ltr", font: `600 26px "${FONT_TEXT}"`, color: "#8a8a8a" }}>
        <span>هشدار</span>
        <span>زمان برخورد</span>
      </div>
      <Scan />
    </AbsoluteFill>
  );
};

/** s26 | the red beacons start turning */
const Beacon: React.FC = () => {
  const t = useT();
  const a = L(26).start, b = next(26);
  if (t < a || t >= b) return null;
  const ang = (t - a) * 300;
  const beam = (x: number, off: number) => `conic-gradient(from ${ang + off}deg at ${x}% 16%, rgba(255,50,30,0.62) 0deg, rgba(255,50,30,0) 34deg, rgba(255,50,30,0) 180deg, rgba(255,50,30,0.62) 180deg, rgba(255,50,30,0) 214deg, rgba(255,50,30,0) 360deg)`;
  const pulse = 0.5 + 0.5 * Math.sin((t - a) * 10.5);
  return (
    <AbsoluteFill style={{ background: "#070303" }}>
      <AbsoluteFill style={{ background: beam(22, 0) }} />
      <AbsoluteFill style={{ background: beam(78, 140) }} />
      <AbsoluteFill style={{ background: `rgba(255,30,18,${0.05 + 0.07 * pulse})` }} />
      {[22, 78].map((x) => (
        <div key={x} style={{ position: "absolute", left: `${x}%`, top: "16%", width: 90, height: 90, marginLeft: -45, marginTop: -45, borderRadius: 45, background: "radial-gradient(circle, #fff 0%, #ff5a3c 34%, rgba(255,40,20,0) 72%)", boxShadow: "0 0 120px 40px rgba(255,50,30,0.55)" }} />
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)" }} />
      <Scan />
      <Recon />
    </AbsoluteFill>
  );
};

/** s32 | the system check: nothing wrong */
const Check: React.FC = () => {
  const t = useT();
  const a = L(32).start, b = next(32);
  if (t < a || t >= b) return null;
  const k = clamp((t - a) / Math.min(1.3, (b - a) * 0.55));
  const done = k >= 1;
  const since = t - a - Math.min(1.3, (b - a) * 0.55);
  return (
    <AbsoluteFill style={{ background: "#040806" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(93,255,176,${done ? 0.14 : 0.05}) 0%, rgba(0,0,0,0) 65%)` }} />
      <div style={{ position: "absolute", left: 0, top: 210, width: W, textAlign: "center", direction: "rtl", font: `600 50px "${FONT_TEXT}"`, color: "#cfe9df" }}>بررسی سیستم</div>
      <div style={{ position: "absolute", left: 360, top: 330, width: 1200, height: 26, borderRadius: 13, background: "#0d2019", overflow: "hidden", direction: "ltr" }}>
        <div style={{ width: `${k * 100}%`, height: "100%", background: GREEN, boxShadow: "0 0 30px rgba(93,255,176,0.8)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 380, width: W, textAlign: "center", direction: "ltr", font: `600 40px "${FONT_RU}"`, letterSpacing: 8, color: GREEN, opacity: 0.7 }}>{fa(Math.round(k * 100))} ٪</div>
      {done && (
        <div style={{ position: "absolute", left: 0, top: 470, width: W, textAlign: "center", direction: "rtl", font: `190px/1.15 "${FONT_NUM}"`, color: "#fff", transform: `scale(${lerp(1.25, 1, out3(since / 0.25))})`, opacity: clamp(since / 0.1) }}>
          خطای فنی: <span style={{ color: GREEN }}>هیچ</span>
        </div>
      )}
      <Scan />
      <Recon />
    </AbsoluteFill>
  );
};

/** s51 | fifty-fifty */
const Fifty: React.FC = () => {
  const t = useT();
  const a = L(51).start, b = next(51);
  if (t < a || t >= b) return null;
  const k = out3((t - a) / 0.6);
  const sway = Math.sin((t - a) * 2.6) * 34 * (1 - clamp((t - a) / 6) * 0.5);
  return (
    <AbsoluteFill style={{ background: "#060606", direction: "ltr" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W / 2, height: H, background: "linear-gradient(90deg, rgba(255,59,47,0.36), rgba(255,59,47,0.1))", transform: `translateX(${-(1 - k) * 960}px)` }} />
      <div style={{ position: "absolute", left: W / 2, top: 0, width: W / 2, height: H, background: "linear-gradient(270deg, rgba(93,255,176,0.3), rgba(93,255,176,0.08))", transform: `translateX(${(1 - k) * 960}px)` }} />
      {[{ x: 0, c: RED, label: "اشتباه" }, { x: W / 2, c: GREEN, label: "درست" }].map((q) => (
        <div key={q.label} style={{ position: "absolute", left: q.x, top: 210, width: W / 2, textAlign: "center", direction: "rtl", opacity: k }}>
          <div style={{ font: `330px/1 "${FONT_NUM}"`, color: "#fff", textShadow: "0 8px 50px rgba(0,0,0,0.7)" }}>۵۰<span style={{ fontSize: 150 }}>٪</span></div>
          <div style={{ font: `90px/1.2 "${FONT_NUM}"`, color: q.c }}>{q.label}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: W / 2 - 4 + sway * k, top: 110, width: 8, height: 640, background: "#fff", borderRadius: 4, boxShadow: "0 0 40px rgba(255,255,255,0.8)" }} />
      <Scan />
    </AbsoluteFill>
  );
};

/** s66 | the file is closed: classified */
const Secret: React.FC = () => {
  const t = useT();
  const a = L(66).start, b = next(66);
  if (t < a || t >= b) return null;
  const k = out3((t - a - 0.15) / 0.2);
  return (
    <AbsoluteFill style={{ background: "#0d0b09" }}>
      <div style={{ position: "absolute", left: 460, top: 70, width: 1000, height: 1200, background: "#d9d0bb", transform: `rotate(-2deg) scale(${1 + 0.03 * clamp((t - a) / (b - a))})`, boxShadow: "0 40px 120px rgba(0,0,0,0.8)", padding: "90px 80px" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ height: 22, marginBottom: 32, width: `${62 + rnd(i) * 38}%`, marginLeft: "auto", background: rnd(i + 20) > 0.45 ? "#15120e" : "#8f8674", opacity: rnd(i + 20) > 0.45 ? 1 : 0.55 }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 300, width: W, display: "flex", justifyContent: "center", opacity: clamp(k * 3) }}>
        <div style={{ transform: `rotate(-9deg) scale(${lerp(2.4, 1, k)})`, border: `12px solid ${RED}`, borderRadius: 20, padding: "8px 70px 22px", textAlign: "center", background: "rgba(217,208,187,0.5)" }}>
          <div style={{ direction: "rtl", font: `220px/1.15 "${FONT_NUM}"`, color: RED }}>محرمانه</div>
          <div style={{ direction: "ltr", font: `700 48px "${FONT_RU}"`, letterSpacing: 14, color: RED }}>СЕКРЕТНО</div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.8) 100%)" }} />
    </AbsoluteFill>
  );
};

/** a quotation, centred on a dimmed frame */
const Quote: React.FC<{ a: number; b: number; text: string; by?: string }> = ({ a, b, text, by }) => {
  const t = useT();
  const o = vis(t, a, b, 0.35, 0.35);
  if (o <= 0) return null;
  const k = out3((t - a) / 0.6);
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * o})` }} />
      <div style={{ position: "absolute", left: 210, top: 250, width: 1500, textAlign: "center", direction: "rtl", opacity: o, transform: `translateY(${(1 - k) * 30}px)` }}>
        <div style={{ font: `200px/0.6 "${FONT_NUM}"`, color: ACCENT, height: 90 }}>”</div>
        <div style={{ font: `124px/1.3 "${FONT_NUM}"`, color: "#fff", textShadow: "0 6px 40px rgba(0,0,0,0.9)" }}>{text}</div>
        {by && <div style={{ font: `600 40px/2 "${FONT_TEXT}"`, color: ACCENT }}>{by}</div>}
      </div>
    </>
  );
};

/** s68–s72 | the years on a rail along the top */
const YEARS = [
  { y: 1983, at: -1, label: "آن شب" },
  { y: 1998, at: Wd(68, "۱۹۹۸", 1, 0.7), label: "ماجرا فاش شد" },
  { y: 2004, at: Wd(70, "۲۰۰۴", 1, 0.1), label: "جایزه‌ی شهروند جهان" },
  { y: 2006, at: Wd(70, "۲۰۰۶", 1, 0.55), label: "تجلیل در سازمان ملل" },
  { y: 2013, at: Wd(71, "۲۰۱۳", 1, 0.2), label: "جایزه‌ی صلح درسدن" },
  { y: 2017, at: Wd(72, "۲۰۱۷،", 1, 0.5), label: "درگذشت در ۷۷ سالگی" },
];
const Years: React.FC = () => {
  const t = useT();
  const a = L(68).start + 0.2, b = next(72);
  const o = vis(t, a, b, 0.4, 0.4);
  if (o <= 0) return null;
  const x = (y: number) => 1920 - 150 - (YEARS.findIndex((q) => q.y === y) / (YEARS.length - 1)) * 1620; // right to left, evenly spaced
  const cur = [...YEARS].reverse().find((q) => t >= q.at) ?? YEARS[0];
  const k = out3((t - Math.max(a, cur.at)) / 0.4);
  const head = lerp(x(YEARS[Math.max(0, YEARS.indexOf(cur) - 1)].y), x(cur.y), k);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%)" }} />
      <div style={{ position: "absolute", left: 150, top: 150, width: 1620, height: 4, background: "rgba(255,255,255,0.28)" }} />
      <div style={{ position: "absolute", left: head, top: 150, width: 1920 - 150 - head, height: 4, background: ACCENT }} />
      {YEARS.map((q) => {
        const on = t >= q.at;
        const me = q === cur;
        return (
          <div key={q.y} style={{ position: "absolute", left: x(q.y) - 100, top: 82, width: 200, textAlign: "center" }}>
            <div style={{ font: `${me ? 56 : 36}px/1.15 "${FONT_NUM}"`, color: on ? (me ? ACCENT : "#fff") : "rgba(255,255,255,0.4)", height: 62, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>{fa(q.y)}</div>
            <div style={{ margin: "0 auto", width: me ? 22 : 14, height: me ? 22 : 14, borderRadius: 11, background: on ? ACCENT : "#777", marginTop: me ? -1 : 3 }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: clamp(x(cur.y) - 260, 60, 1340), top: 190, width: 520, textAlign: "center", direction: "rtl", font: `600 40px "${FONT_TEXT}"`, color: "#fff", opacity: k, textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}>{cur.label}</div>
    </div>
  );
};

/** chapter chips, top right for four seconds */
const CHAPTERS = [
  { n: 11, text: "جهان روی لبه‌ی تیغ" },
  { n: 25, text: "شمارش معکوس" },
  { n: 43, text: "قمار روی جان میلیاردها انسان" },
  { n: 61, text: "مجازات به‌جای مدال" },
];
const Chapter: React.FC = () => {
  const t = useT();
  const c = CHAPTERS.find((q) => t >= L(q.n).start + 0.1 && t < L(q.n).start + 4.2);
  if (!c) return null;
  const a = L(c.n).start + 0.1;
  const o = vis(t, a, a + 4.1, 0.3, 0.4);
  const k = out3((t - a) / 0.5);
  const i = CHAPTERS.indexOf(c) + 1;
  return (
    <div style={{ position: "absolute", right: 60, top: 48, direction: "rtl", display: "flex", alignItems: "center", gap: 14, opacity: o, transform: `translateX(${(1 - k) * 50}px)` }}>
      <div style={{ font: `40px/1 "${FONT_NUM}"`, color: "#111", background: ACCENT, width: 58, height: 58, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{fa(i)}</div>
      <div style={{ font: `600 34px "${FONT_TEXT}"`, color: "#fff", padding: "8px 20px 10px", background: "rgba(0,0,0,0.5)", borderRadius: 12 }}>{c.text}</div>
    </div>
  );
};

/** the last word */
const Final: React.FC = () => {
  const t = useT();
  const a = Wd(75, "نه", 2, 0.96) - 0.1;
  if (t < a) return null;
  const k = out3((t - a) / 0.5);
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.72 * k})` }} />
      <div style={{ position: "absolute", left: 0, top: 200, width: W, textAlign: "center", direction: "rtl", font: `520px/1 "${FONT_NUM}"`, color: "#fff", opacity: k, transform: `scale(${lerp(1.5, 1, k)})`, textShadow: `0 0 120px rgba(255,200,61,${0.5 * k})` }}><span style={{ color: ACCENT }}>نه</span></div>
    </>
  );
};

/** film grain + vignette over old footage (cheap: one noise tile, moved every frame) */
const OldFilm: React.FC = () => {
  const t = useT();
  const s = shotAt(SHOTS, t);
  if (!s || !OLD.has(s.name)) return null;
  const f = Math.floor(t * 24);
  return (
    <>
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("v05/grain.png")})`, backgroundPosition: `${Math.floor(rnd(f) * 512)}px ${Math.floor(rnd(f + 9) * 512)}px`, opacity: 0.13, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)" }} />
    </>
  );
};

/** source and year of the clip for two seconds (or the shot's own label) */
const Credit: React.FC = () => {
  const t = useT();
  const s = shotAt(SHOTS, t);
  if (!s) return null;
  const clip = MAN.clips[s.name];
  if (!clip) return null;
  const o = clamp((t - s.at) / 0.25) * clamp((s.at + 2.4 - t) / 0.4);
  if (o <= 0) return null;
  if (s.label) return <div style={{ position: "absolute", left: 56, top: 52, opacity: o, direction: "rtl", font: `600 24px "${FONT_TEXT}"`, color: "#fff", padding: "6px 14px", background: "rgba(0,0,0,0.45)", borderRadius: 8 }}>{s.label}</div>;
  return <div style={{ opacity: o }}><SourceTag clip={clip} x={56} y={52} size={20} /></div>;
};

const codeScene = (t: number) =>
  BOARDS.some((b) => t >= b.a && t < b.b) ||
  (t >= L(17).start && t < next(17)) || (t >= Wd(28, "مونتانا", 1, 0.45) + 0.5 && t < next(28)) || (t >= L(42).start && t < next(42)) ||
  (t >= L(47).start && t < next(48)) || (t >= L(55).start && t < next(55)) || (t >= L(57).start && t < next(58)) ||
  [13, 14, 26, 32, 51, 66].some((n) => t >= L(n).start && t < next(n));

export const Frame: React.FC<{ t: number; preview: boolean; captions?: boolean }> = ({ t, preview, captions = true }) => {
  const code = codeScene(t);
  return (
    <FootageTime.Provider value={t}>
      <AbsoluteFill style={{ background: "#050505" }}>
        {!code && (
          <>
            <FootageBed man={MAN} shots={SHOTS} w={W} h={H} mix={0} />
            <OldFilm />
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.46) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.66) 100%)" }} />
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.42) 100%)" }} />
            <Credit />
          </>
        )}
        {BOARDS.map((b, i) => <Board key={i} st={b} />)}
        <MapScenes />
        <Wait />
        <Beacon />
        <Check />
        <Fifty />
        <Secret />
        <Quote a={Wd(30, "مثل", 1, 0.45) - 0.2} b={L(30).end + 0.4} text="مثل نشستن روی ماهیتابه‌ی داغ" by="پتروف، سال‌ها بعد" />
        <Opening />
        <Countdown />
        <Stat a={Wd(14, "۲۶۹", 1, 0.1) - 0.1} b={L(14).end + 0.2} num="۲۶۹" label="کشته | هیچ‌کس زنده نماند" color={RED} />
        <DateCard />
        <NameCard />
        <Reasons />
        <Quote a={Wd(73, "«من", 1, 0.5) - 0.2} b={L(73).end + 0.6} text="من فقط کارم را انجام می‌دادم." by="استانیسلاو پتروف" />
        <Years />
        <Chapter />
        <Final />
        {captions && <Captions chunks={CHUNKS} y={860} w={W} size={56} max={1500} font={FONT_TEXT} accent={ACCENT} />}
        {!preview && VOICE && <Audio src={staticFile(VOICE)} />}
        {!preview && MUSIC.file && <Audio src={staticFile(MUSIC.file)} volume={MUSIC.volume} />}
      </AbsoluteFill>
    </FootageTime.Provider>
  );
};

export const Petrov: React.FC<{ times?: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Frame t={times ? times[f] ?? 0 : f / fps} preview={!!times} />;
};

// one still a little into every narration line (the -Look composition)
export const LOOK = [0.6, ...LINES.map((n) => +(L(n).start + Math.min(2.6, (next(n) - L(n).start) * 0.7)).toFixed(2)), +(END - 0.3).toFixed(2)];

export const PetrovComps: React.FC = () => (
  <>
    <Composition id={ID} component={Petrov} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />
    <Composition id={`${ID}-Silent`} component={Petrov} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />
    <Composition id={`${ID}-Look`} component={Petrov} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
