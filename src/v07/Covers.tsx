// V07 YouTube thumbnails (1920×1080): A = the channel's documentary poster, B and C = high-CTR face / object variants
// in the channel signature (huge yellow Vazirmatn Black, black outline, bottom-right kept empty).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PosterYouTube } from "../covers";
import { FONT_BLACK, FONT_TEXT } from "../fonts";

export const V07PosterA: React.FC = () => (
  <PosterYouTube hero="v07/img/102.jpg" heroPos="45% 40%" relief="v07/art/archers.jpg" reliefPos="50% 50%" kicker={["شوش", "نمک", "نام"]} badge="مستند"
    small="تمدنی به نامِ" big="ایلام" bigSize={290} tagline={["آشوربانیپال خواست نامش را پاک کند،", "و تقریباً موفق شد."]} />
);

const SIG = "0 0 3px #000, 7px 7px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 0 16px 50px rgba(0,0,0,.95)";
const T: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "#FFD23F", style }) => (
  <div style={{ position: "absolute", direction: "rtl", font: `${size}px/1.02 ${FONT_BLACK}`, color, textShadow: SIG, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; bg?: string }> = ({ children, style, bg = "#c1121f" }) => (
  <div style={{ position: "absolute", direction: "rtl", font: `54px ${FONT_TEXT}`, color: "#fff", background: bg, padding: "4px 28px 12px", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.7)", ...style }}>{children}</div>
);

// B · the order: Ashurbanipal's face on the right, Susa burning on the left (blue / orange)
export const V07ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1060, height: 1080, overflow: "hidden" }}>
      <Img src={staticFile("v07/img/008.jpg")} style={{ position: "absolute", left: -560, top: -40, width: 2100, height: 1173, objectFit: "cover", maxWidth: "none", filter: "contrast(1.2) saturate(1.3) brightness(1.15)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,0) 55%)" }} />
    </div>
    <div style={{ position: "absolute", right: 0, top: 0, width: 900, height: 1080, overflow: "hidden", clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)" }}>
      <Img src={staticFile("v07/img/093.jpg")} style={{ position: "absolute", left: -820, top: -170, width: 2550, height: 1424, objectFit: "cover", maxWidth: "none", filter: "contrast(1.2) saturate(1.2) brightness(1.1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(10,20,60,0) 55%, rgba(10,20,60,.6))" }} />
    </div>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><line x1={1182} y1={0} x2={1020} y2={1080} stroke="#e9c46a" strokeWidth={10} /></svg>
    <T size={200} style={{ left: 70, top: 70 }}>پاکش کن!</T>
    <T size={130} color="#fff" style={{ left: 80, top: 330 }}>اسمِ ایلام</T>
    <Pill style={{ left: 86, top: 540 }}>۶۴۶ پیش از میلاد</Pill>
  </AbsoluteFill>
);

// C · the salt: a hand pouring salt over the burned city (gold / dark)
export const V07ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <Img src={staticFile("v07/img/009.jpg")} style={{ position: "absolute", left: -380, top: -120, width: 2700, height: 1508, objectFit: "cover", maxWidth: "none", filter: "contrast(1.2) saturate(1.25) brightness(1.25)" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6,4,2,.88) 0%, rgba(6,4,2,.5) 38%, rgba(0,0,0,0) 60%)" }} />
    <div style={{ position: "absolute", left: 1180, top: 150, width: 520, height: 520, background: "radial-gradient(circle, rgba(255,200,90,.32), rgba(0,0,0,0) 65%)" }} />
    <T size={210} style={{ left: 70, top: 90 }}>نمک</T>
    <T size={130} color="#fff" style={{ left: 80, top: 330 }}>روی شوش</T>
    <Pill style={{ left: 86, top: 540 }} bg="#7a1414">چرا؟</Pill>
  </AbsoluteFill>
);
