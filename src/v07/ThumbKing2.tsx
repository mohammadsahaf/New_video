// V07 thumbnails (CTR rules of .claude/skills/video-covers): ≤3 words, big face, blue/orange complement,
// thick black outline, bottom-right corner empty. A = face close-up, B = wide with the army.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT_BLACK } from "../fonts";

const SIG = "0 0 3px #000, 8px 8px 0 #000, -5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000, 0 18px 50px rgba(0,0,0,.95)";
const Word: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "#FFD23F", style }) => (
  <div style={{ position: "absolute", direction: "rtl", textAlign: "center", font: `${size}px/1.02 ${FONT_BLACK}`, color, textShadow: SIG, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Pill: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({ children, size, style }) => (
  <div style={{ position: "absolute", direction: "rtl", textAlign: "center", font: `${size}px/1.1 ${FONT_BLACK}`, color: "#fff", background: "#d90f1f", padding: "6px 40px 20px", borderRadius: 14,
    boxShadow: "0 10px 36px rgba(0,0,0,.75), inset 0 -6px 0 rgba(0,0,0,.25)", border: "5px solid #000", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Frame = () => <div style={{ position: "absolute", inset: 18, border: "2px solid rgba(255,225,150,.55)" }} />;

// A · face close-up, text on the right over a deep-blue shaded sky
export const V07ThumbKingA: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a0a12", overflow: "hidden" }}>
    <Img src={staticFile("v07/thumb/hero-ext.jpg")} style={{ position: "absolute", left: -1170, top: -10, width: 3650, height: 1540, maxWidth: "none", filter: "contrast(1.18) saturate(1.28) brightness(1.04)" }} />
    {/* cold blue shade on the right half = orange face vs blue text field */}
    <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(4,22,52,.93) 0%, rgba(6,30,66,.82) 34%, rgba(8,40,86,.35) 58%, rgba(0,0,0,0) 74%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 42% 34%, rgba(255,190,100,.28) 0%, transparent 34%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,.5) 0%, transparent 28%)" }} />
    <Frame />
    <Word size={430} style={{ left: 930, top: 70, width: 940 }}>ایلام</Word>
    <Pill size={150} style={{ left: 1000, top: 560 }}>پاکش کردند؟</Pill>
  </AbsoluteFill>
);

// B · wide: king + army + ziggurat, blue-shaded sky for the text
export const V07ThumbKingB: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a0a12", overflow: "hidden" }}>
    <Img src={staticFile("v07/thumb/hero-ext.jpg")} style={{ position: "absolute", left: -400, top: 0, width: 2562, height: 1080, maxWidth: "none", filter: "contrast(1.18) saturate(1.25)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(4,22,52,.9) 0%, rgba(6,30,66,.75) 26%, rgba(8,40,86,.25) 46%, rgba(0,0,0,0) 60%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,.5) 0%, transparent 26%)" }} />
    <Frame />
    <Word size={330} style={{ left: 1250, top: 50, width: 620 }}>پاک</Word>
    <Word size={330} style={{ left: 1250, top: 330, width: 620 }}>نشد!</Word>
    <Pill size={140} style={{ left: 1400, top: 650 }}>ایلام</Pill>
  </AbsoluteFill>
);
