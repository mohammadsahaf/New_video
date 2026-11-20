// Real footage and photos in any video: the clips tools/footage.mjs downloaded (listed in src/vNN/footage.json)
// laid on the timeline shot by shot. Every piece reads the time from useT(), so it renders right both in the full
// render and in a -Look composition that jumps to any second (wrap it in <FootageTime.Provider value={t}>).
import React, { createContext, useContext } from "react";
import { Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type FootageClip = {
  file: string; // path inside public/, e.g. "v07/footage/s03a.mp4"
  kind: "video" | "image";
  w: number;
  h: number;
  dur?: number;
  title?: string;
  author?: string;
  source?: string;
  year?: number | null;
  licence?: { name: string; verdict: string };
  credit?: string;
  /** where the subject sits (0–1): x for a vertical crop, y for a horizontal one — found by footage.mjs */
  focus?: [number, number];
};
export type Manifest = { clips: Record<string, FootageClip> };

/** one shot of the footage track */
export type Shot = {
  /** key in footage.json (s03a …) */
  name: string;
  /** start and end in the video, seconds (take them from the narration: wordAt / lineAt) */
  at: number;
  until: number;
  /** second inside the clip to start from */
  from?: number;
  /** playback speed: 0.6 = gentle slow motion */
  rate?: number;
  /** cover = fill the frame, cropped around focus · contain = the whole picture on a blurred copy of itself */
  fit?: "cover" | "contain";
  /** the point that must stay in frame, 0–1 of the picture (cover); default the centre */
  focus?: [number, number];
  /** drift of that point over the shot, in the same 0–1 units: [0.1, 0] slides right */
  pan?: [number, number];
  /** start zoom, and how much it grows over the shot (0.06 = slow push in, −0.05 = pull back) */
  zoom?: number;
  push?: number;
  /** colour treatment */
  grade?: Grade;
  /** a small top label, e.g. "1958" or "NASA" */
  label?: string;
};
export type Grade = "clean" | "vivid" | "film" | "mono" | "warm" | "cool";

export const FootageTime = createContext<number | null>(null);
export const useT = () => {
  const t = useContext(FootageTime);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return t ?? f / fps;
};

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

const FILTER: Record<Grade, string> = {
  clean: "contrast(1.04) saturate(1.04)",
  vivid: "contrast(1.08) saturate(1.18)",
  film: "contrast(1.1) saturate(0.82) sepia(0.12) brightness(0.97)",
  mono: "grayscale(1) contrast(1.14) brightness(0.98)",
  warm: "contrast(1.05) saturate(1.06) sepia(0.1)",
  cool: "contrast(1.05) saturate(0.95) hue-rotate(-8deg)",
};

/** placeholder while a shot has no footage yet (the starter renders before anything is downloaded) */
const Slate: React.FC<{ w: number; h: number; name: string }> = ({ w, h, name }) => (
  <div style={{ position: "absolute", width: w, height: h, background: "repeating-linear-gradient(135deg,#17171b 0 26px,#1d1d22 26px 52px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ font: "600 34px monospace", color: "#7d7d88", letterSpacing: 2 }}>{name} · no footage yet</div>
  </div>
);

/** One clip or photo filling a w×h box from time t0 for len seconds. */
export const Media: React.FC<{
  clip?: FootageClip;
  name?: string;
  t0: number;
  len: number;
  w: number;
  h: number;
  from?: number;
  rate?: number;
  fit?: "cover" | "contain";
  focus?: [number, number];
  pan?: [number, number];
  zoom?: number;
  push?: number;
  grade?: Grade;
}> = ({ clip, name = "", t0, len, w, h, from = 0, rate = 1, fit = "cover", focus = [0.5, 0.5], pan = [0, 0], zoom = 1, push, grade = "clean" }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!clip) return <Slate w={w} h={h} name={name} />;
  const still = clip.kind === "image";
  const p = ease(clamp((t - t0) / Math.max(0.1, len)));
  const z = zoom * (1 + (push ?? (still ? 0.08 : 0.05)) * p);
  const fx = clamp(focus[0] + pan[0] * p), fy = clamp(focus[1] + pan[1] * p);
  const place = (mode: "cover" | "contain", extra = 1) => {
    const s = (mode === "cover" ? Math.max(w / clip.w, h / clip.h) : Math.min(w / clip.w, h / clip.h)) * (mode === "cover" ? z : 1 + (z - 1) * 0.5) * extra;
    const vw = clip.w * s, vh = clip.h * s;
    const left = mode === "cover" ? Math.min(0, Math.max(w - vw, w / 2 - fx * vw)) : (w - vw) / 2;
    const top = mode === "cover" ? Math.min(0, Math.max(h - vh, h / 2 - fy * vh)) : (h - vh) / 2;
    return { position: "absolute" as const, left, top, width: vw, height: vh, maxWidth: "none" };
  };
  const filter = FILTER[grade];
  // a video starts at t0: the Sequence offset comes from the current frame, so it is right at any time
  const seqFrom = frame - Math.round((t - t0) * fps);
  const layer = (style: React.CSSProperties) =>
    still ? (
      <Img src={staticFile(clip.file)} style={style} />
    ) : (
      <Sequence from={seqFrom} durationInFrames={Math.max(1, Math.round(len * fps) + 2)} layout="none">
        <OffthreadVideo src={staticFile(clip.file)} muted trimBefore={Math.round(from * fps)} playbackRate={rate} style={style} />
      </Sequence>
    );
  return (
    <div style={{ position: "absolute", width: w, height: h, overflow: "hidden", background: "#000" }}>
      {fit === "contain" && layer({ ...place("cover", 1.12), filter: `${filter} blur(30px) brightness(0.5)` })}
      {layer({ ...place(fit), filter })}
      {(grade === "film" || grade === "mono") && <Grain w={w} h={h} />}
      {(grade === "film" || grade === "mono") && <Vignette />}
    </div>
  );
};

/** the footage track: the shot under the playhead (and the one before it while a dissolve runs) */
export const FootageBed: React.FC<{ man: Manifest; shots: Shot[]; w: number; h: number; mix?: number }> = ({ man, shots, w, h, mix = 0 }) => {
  const t = useT();
  const list = [...shots].sort((a, b) => a.at - b.at);
  let i = list.findIndex((s, k) => t >= s.at && (k === list.length - 1 || t < list[k + 1].at));
  if (i < 0) i = 0;
  const show = [i];
  if (mix > 0 && i > 0 && t < list[i].at + mix) show.unshift(i - 1);
  return (
    <div style={{ position: "absolute", width: w, height: h, overflow: "hidden", background: "#000" }}>
      {show.map((k) => {
        const s = list[k];
        const fade = k === i && show.length > 1 ? clamp((t - s.at) / mix) : 1;
        return (
          <div key={s.name + k} style={{ position: "absolute", inset: 0, opacity: fade }}>
            <Media clip={man.clips[s.name]} name={s.name} t0={s.at} len={s.until - s.at + mix} w={w} h={h} from={s.from} rate={s.rate} fit={s.fit} focus={s.focus} pan={s.pan} zoom={s.zoom} push={s.push} grade={s.grade} />
          </div>
        );
      })}
    </div>
  );
};

/** the shot (and its clip) under the playhead — for labels and credits on top of the bed */
export const shotAt = (shots: Shot[], t: number) => {
  const list = [...shots].sort((a, b) => a.at - b.at);
  return [...list].reverse().find((s) => t >= s.at) ?? list[0];
};

/** fine film grain that changes every frame (for the film and mono grades) */
export const Grain: React.FC<{ w: number; h: number; amount?: number }> = ({ w, h, amount = 0.16 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: amount, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <filter id={`g${f}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#g${f})`} />
    </svg>
  );
};
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)` }} />
);

/** small source line for a clip: "NASA · Public domain" (the full credits go in the caption) */
export const SourceTag: React.FC<{ clip?: FootageClip; x: number; y: number; font?: string; size?: number; opacity?: number }> = ({ clip, x, y, font = "monospace", size = 22, opacity = 0.85 }) => {
  if (!clip) return null;
  const src = { archive: "INTERNET ARCHIVE", commons: "WIKIMEDIA COMMONS", nasa: "NASA", coverr: "COVERR", mixkit: "MIXKIT", cleveland: "CLEVELAND MUSEUM OF ART", wellcome: "WELLCOME COLLECTION", europeana: "EUROPEANA", pexels: "PEXELS", pixabay: "PIXABAY", unsplash: "UNSPLASH" }[clip.source || ""] || (clip.source || "").toUpperCase();
  const lic = clip.licence?.name || "";
  return (
    <div style={{ position: "absolute", left: x, top: y, direction: "ltr", font: `600 ${size}px ${font}`, letterSpacing: 1.5, color: "#fff", opacity, padding: "6px 12px", background: "rgba(0,0,0,0.42)", borderRadius: 8 }}>
      {clip.year ? `${clip.year} · ` : ""}{src}{lic && !/coverr|mixkit|pexels|pixabay|unsplash/i.test(lic) ? ` · ${lic.toUpperCase()}` : ""}
    </div>
  );
};
