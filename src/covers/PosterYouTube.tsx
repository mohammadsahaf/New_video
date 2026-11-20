// Channel cover style "documentary poster" — YouTube 16:9 (ref: uploads/ref/cover-ref-taj.jpg).
// Dark left side (faint relief + optional map), spaced kicker, small + huge gold serif title with ornaments,
// tagline, black badge top-right, golden hero image on the right. Bottom-right corner stays empty (timestamp).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PF } from "../styles/photocopy-story"; // registers Naskh / Vazir faces

export type PosterYouTubeProps = {
  hero: string; heroPos?: string;            // public path of the hero image (right side) + objectPosition
  relief?: string; reliefPos?: string;       // faint carved/old image behind the title (left)
  map?: React.ReactNode;                     // optional faint SVG map (1100×1080 canvas, drawn in gold)
  kicker?: string[];                         // e.g. ["صحرا","راز","تاریخ"]
  badge?: string;                            // e.g. "مستند"
  small: string; big: string;                // small line above + huge title word
  bigSize?: number;
  tagline?: string[];                        // 1–2 lines
};

const GOLD = "linear-gradient(180deg, #fff3cf 0%, #f2d48a 30%, #c99a43 58%, #8a6224 80%, #e8c779 100%)";

const Ornament: React.FC<{ w?: number; flip?: boolean }> = ({ w = 520, flip }) => (
  <svg width={w} height={40} viewBox="0 0 520 40" style={{ transform: flip ? "scaleY(-1)" : undefined }}>
    <defs><linearGradient id="og" x1="0" x2="1"><stop offset="0" stopColor="#c99a43" stopOpacity="0" /><stop offset=".5" stopColor="#f0d48e" /><stop offset="1" stopColor="#c99a43" stopOpacity="0" /></linearGradient></defs>
    <path d="M10 20 H215 M305 20 H510" stroke="url(#og)" strokeWidth="2.5" />
    <path d="M260 6 C 248 14, 236 14, 226 20 C 236 26, 248 26, 260 34 C 272 26, 284 26, 294 20 C 284 14, 272 14, 260 6 Z" fill="none" stroke="#f0d48e" strokeWidth="2.5" />
    <circle cx="260" cy="20" r="4" fill="#f0d48e" /><circle cx="218" cy="20" r="3" fill="#f0d48e" /><circle cx="302" cy="20" r="3" fill="#f0d48e" />
  </svg>
);


export const PosterYouTube: React.FC<PosterYouTubeProps> = ({ hero, heroPos = "50% 40%", relief, reliefPos = "50% 50%", map, kicker = [], badge = "مستند", small, big, bigSize = 290, tagline = [] }) => (
  <AbsoluteFill style={{ background: "#0b0805", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 640, top: 0, width: 1280, height: 1080, WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 34%)" }}>
      <Img src={staticFile(hero)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: heroPos, filter: "contrast(1.12) saturate(1.15) brightness(1.05)" }} />
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 74% 26%, rgba(255,190,90,.35) 0%, rgba(255,150,40,.12) 22%, transparent 45%)", mixBlendMode: "screen" }} />
    {relief && (
      <div style={{ position: "absolute", left: -60, top: 60, width: 900, height: 700, opacity: 0.16, WebkitMaskImage: "radial-gradient(ellipse at 45% 45%, #000 30%, transparent 70%)" }}>
        <Img src={staticFile(relief)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: reliefPos, filter: "grayscale(1) sepia(.6) contrast(1.4)" }} />
      </div>
    )}
    {map && <svg width={1100} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: 0.3 }}>{map}</svg>}
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(8,6,4,.85) 0%, rgba(8,6,4,0) 30%), linear-gradient(180deg, rgba(8,6,4,.55) 0%, rgba(8,6,4,0) 18%)" }} />
    {kicker.length > 0 && (
      <div style={{ position: "absolute", top: 34, left: 0, right: 0, textAlign: "center", direction: "rtl", fontFamily: PF.ui, fontWeight: 600, fontSize: 34, color: "#e9dcc0" }}>
        {kicker.map((k, i) => <React.Fragment key={i}>{i > 0 && <span style={{ margin: "0 28px", color: "#c9a65e" }}>•</span>}{k}</React.Fragment>)}
      </div>
    )}
    {badge && <div style={{ position: "absolute", top: 90, right: 0, background: "#0a0a0a", padding: "10px 46px 16px 40px", fontFamily: PF.ui, fontWeight: 900, fontSize: 46, color: "#fff", borderTopLeftRadius: 10, borderBottomLeftRadius: 10, boxShadow: "0 6px 20px rgba(0,0,0,.6)" }}>{badge}</div>}
    <div style={{ position: "absolute", left: 30, top: 200, width: 1000, direction: "rtl", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Ornament w={300} />
      <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: 104, lineHeight: 1.25, backgroundImage: GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.9))" }}>{small}</div>
      <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: bigSize, lineHeight: 1.1, marginTop: -30, backgroundImage: GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 10px 22px rgba(0,0,0,.95))", whiteSpace: "nowrap" }}>{big}</div>
      <div style={{ marginTop: 6 }}><Ornament w={420} flip /></div>
      {tagline.length > 0 && <div style={{ fontFamily: PF.ui, fontWeight: 700, fontSize: 44, lineHeight: 1.55, color: "#efe4cc", marginTop: 26, textShadow: "0 3px 10px #000" }}>{tagline.map((t, i) => <div key={i}>{t}</div>)}</div>}
    </div>
  </AbsoluteFill>
);
