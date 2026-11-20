// Starter · «فوتیج واقعی» (Footage Reel): a narrated video on real footage and photos — news, history, science,
// «how it works» — as an Instagram reel or a YouTube video. Every sentence gets its own clips, found, cut and credited
// by tools/footage.mjs (FOOTAGE.md has the whole workflow).
// Copy: cp -r src/footage-starter src/v07 → vo.json from doc-build-vo (or words.json from eleven-align), footage.json
// from `node tools/footage.mjs get 07 …` → rename ID below to "V07" → in Root.tsx: import { FootageReelComps as V07 }
// from "./v07/FootageReel"; <V07 />. Without any footage yet it still plays: each shot shows its name.
import React from "react";
import { AbsoluteFill, Audio, Composition, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { FootageBed, FootageTime, SourceTag, shotAt, useT, type Manifest, type Shot } from "../footage/footage";
import { Captions } from "../footage/captions";
import { autoShots, chunksFrom, narration } from "../footage/vo";
import man from "./footage.json";
import voRaw from "./vo.json";

// ───────────────────────── your video: edit this block ─────────────────────────
const ID = "Footage-Starter"; // → "V07"
const ORIENT = "vertical" as "vertical" | "horizontal"; // vertical = reels/shorts 1080×1920 · horizontal = YouTube 1920×1080
const LAYOUT = "full" as "full" | "window"; // full = footage fills the frame · window = a rounded window on a dark stage (vertical)
const ACCENT = "#FFC24A";
const VOICE = ""; // e.g. "v07/voice.mp3" (in public/) — empty: silent
const MUSIC = { file: "", volume: 0.12 }; // a music bed under the voice (AUDIO.md: about −31 LUFS)
const HOOK = { text: "موشک‌هایی که برمی‌گردن", key: "برمی‌گردن", until: 2.4 }; // big title over the first seconds ("" for none)
const KEYWORDS = ["منفجر", "برمی‌گردن"]; // caption words in the accent colour
const SOURCE_TAGS = true; // «1969 · NASA · PUBLIC DOMAIN» for two seconds at the start of each shot
// per-clip changes (name → any Shot field): where it starts inside the clip, what must stay in frame, slow motion…
const TWEAKS: Record<string, Partial<Shot>> = {
  // s02a: { from: 1.2, focus: [0.45, 0.4], rate: 0.8, grade: "film", label: "1958" },
};
// ────────────────────────────────────────────────────────────────────────────────

const FPS = 30;
const VO = narration(voRaw as never);
const END = VO.total + 0.8;
const MAN = man as unknown as Manifest; // footage.json, written by tools/footage.mjs
const SHOTS = autoShots(MAN, END, TWEAKS);
const CHUNKS = chunksFrom(VO, 4, KEYWORDS);
const VERT = ORIENT === "vertical";
const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080;
// where things sit: vertical keeps clear of Instagram's top bar and the caption/buttons at the bottom
const POS = VERT
  ? { tag: [48, 236], hook: 520, hookSize: 112, cap: 1290, capSize: 64, capMax: 940 }
  : { tag: [56, 52], hook: 380, hookSize: 120, cap: 842, capSize: 58, capMax: 1400 };

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const out = (x: number) => 1 - Math.pow(1 - x, 3);

/** how much of the hook shows at t: in over 0.35 s, out over 0.3 s */
const hookVis = (t: number) => (HOOK.text ? out(clamp(t / 0.35)) * clamp((HOOK.until + 0.3 - t) / 0.3) : 0);

const Hook: React.FC<{ y: number }> = ({ y }) => {
  const t = useT();
  if (!HOOK.text || t > HOOK.until + 0.3) return null;
  const k = out(clamp(t / 0.35)), x = clamp((HOOK.until + 0.3 - t) / 0.3);
  const parts = HOOK.key ? HOOK.text.split(HOOK.key) : [HOOK.text];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, direction: "rtl", textAlign: "center", font: `${POS.hookSize}px/1.12 "${FONT_NUM}"`, color: "#fff", opacity: k * x, transform: `translateY(${(1 - k) * 40}px) scale(${1 + (1 - k) * 0.06})`, textShadow: "0 6px 40px rgba(0,0,0,0.6)" }}>
      {parts[0]}
      {HOOK.key && parts.length > 1 && <span style={{ color: ACCENT }}>{HOOK.key}</span>}
      {parts.slice(1).join(HOOK.key)}
    </div>
  );
};

/** the clip's source and year for the first two seconds of each shot (or the shot's own label) */
const Tag: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const t = useT();
  const s = shotAt(SHOTS, t);
  if (!s || (!SOURCE_TAGS && !s.label)) return null;
  const clip = MAN.clips[s.name];
  const o = clamp((t - s.at) / 0.25) * clamp((s.at + 2.2 - t) / 0.4);
  if (s.label) return <div style={{ position: "absolute", left: x, top: y, opacity: o, font: `600 30px "${FONT_TEXT}"`, color: "#fff", padding: "6px 16px", background: "rgba(0,0,0,0.45)", borderRadius: 10 }}>{s.label}</div>;
  return <div style={{ opacity: o }}><SourceTag clip={clip} x={x} y={y} /></div>;
};

const Frame: React.FC<{ t: number; preview: boolean }> = ({ t, preview }) => (
  <FootageTime.Provider value={t}>
    <AbsoluteFill style={{ background: "#0b0b0f" }}>
      {LAYOUT === "window" && VERT ? (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${50 + 18 * Math.sin(t * 0.35)}% 30%, #23232c 0%, #0b0b0f 62%)` }} />
          <div style={{ position: "absolute", left: 48, top: 250, width: 984, height: 980, borderRadius: 36, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.08)" }}>
            <FootageBed man={MAN} shots={SHOTS} w={984} h={980} mix={0} />
            {/* the hook sits on the window's lower part: a shade under it while it shows */}
            <div style={{ position: "absolute", inset: 0, opacity: hookVis(t), background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 100%)" }} />
            <Tag x={28} y={26} />
          </div>
          <Hook y={1030} />
          <Captions chunks={CHUNKS} y={1320} font={FONT_TEXT} accent={ACCENT} plate={false} />
        </>
      ) : (
        <>
          <FootageBed man={MAN} shots={SHOTS} w={W} h={H} mix={0} />
          <AbsoluteFill style={{ background: VERT ? "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.62) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.6) 100%)" }} />
          <Hook y={POS.hook} />
          <Tag x={POS.tag[0]} y={POS.tag[1]} />
          <Captions chunks={CHUNKS} y={POS.cap} w={W} size={POS.capSize} max={POS.capMax} font={FONT_TEXT} accent={ACCENT} />
        </>
      )}
      {!preview && VOICE && <Audio src={staticFile(VOICE)} />}
      {!preview && MUSIC.file && <Audio src={staticFile(MUSIC.file)} volume={MUSIC.volume} />}
    </AbsoluteFill>
  </FootageTime.Provider>
);

/** the film, or with `times` one still per frame at those seconds (the -Look composition) */
export const FootageReel: React.FC<{ times?: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Frame t={times ? times[f] ?? 0 : f / fps} preview={!!times} />;
};

/** one still at the hook, one in the middle of every shot, one at the end — render it before the full video */
export const LOOK = [0.4, 1.6, ...SHOTS.map((s) => +(s.at + Math.min(1.2, (s.until - s.at) / 2)).toFixed(2)), +(END - 0.4).toFixed(2)];
export const FootageReelComps: React.FC = () => (
  <>
    <Composition id={ID} component={FootageReel} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />
    <Composition id={`${ID}-Look`} component={FootageReel} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
