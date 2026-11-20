// V06 YouTube thumbnails (1920×1080): A = the channel's documentary poster, B and C = high-CTR face + object variants.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PosterYouTube } from "../covers";
import { FONT_BLACK, FONT_TEXT } from "../fonts";

export const V06PosterA: React.FC = () => (
  <PosterYouTube hero="v06/img/N20.jpg" heroPos="30% 35%" relief="v06/img/04.jpg" reliefPos="40% 55%" kicker={["ایران", "روم", "صلیب"]} badge="مستند"
    small="آخرین جنگِ" big="ایران و روم" bigSize={210} tagline={["بیست‌وشش سال جنگ، دو امپراتوری،", "و برنده‌ای که هیچ‌کس انتظارش را نداشت."]} />
);

const Big: React.FC<{ children: React.ReactNode; size: number; color?: string; top: number; right?: number; left?: number }> = ({ children, size, color = "#FFD23F", top, right, left }) => (
  <div style={{ position: "absolute", top, right, left, direction: "rtl", font: `${size}px/1.05 ${FONT_BLACK}`, color, WebkitTextStroke: "0px", textShadow: "0 0 2px #000, 6px 6px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 14px 40px rgba(0,0,0,.9)", whiteSpace: "nowrap" }}>{children}</div>
);

// B · the cross in Persia: Khosrow's angry face on the left, the jewelled cross glowing on the right
export const V06ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a0605", overflow: "hidden" }}>
    <Img src={staticFile("v06/img/N42.jpg")} style={{ position: "absolute", right: -300, top: -200, width: 2330, height: 1300, objectFit: "cover", maxWidth: "none", objectPosition: "50% 40%", filter: "contrast(1.15) saturate(1.25) brightness(1.15)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 72% 45%, rgba(255,190,80,.25), rgba(0,0,0,0) 45%)" }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1000, height: 1080, overflow: "hidden", clipPath: "polygon(0 0, 100% 0, 78% 100%, 0 100%)" }}>
      <Img src={staticFile("v06/img/N64.jpg")} style={{ position: "absolute", left: -1250, top: -380, width: 3000, height: 1675, objectFit: "cover", maxWidth: "none", filter: "contrast(1.18) saturate(1.2)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.55))" }} />
    </div>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><line x1={1000} y1={0} x2={780} y2={1080} stroke="#e9c46a" strokeWidth={10} /></svg>
    <Big size={150} top={40} right={60}>صلیبِ مسیح</Big>
    <Big size={150} top={210} right={60} color="#ffffff">در ایران!</Big>
    <div style={{ position: "absolute", right: 70, top: 420, direction: "rtl", font: `56px ${FONT_TEXT}`, color: "#fff", background: "#c1121f", padding: "6px 30px 14px", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.6)" }}>۶۱۴ میلادی</div>
  </AbsoluteFill>
);

// C · face-off: Khosrow (red) vs Heraclius (purple), "26 years, no winner"
export const V06ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <div style={{ position: "absolute", right: 0, top: 0, width: 980, height: 1080, overflow: "hidden" }}>
      <Img src={staticFile("v06/img/N64.jpg")} style={{ position: "absolute", left: -860, top: -30, width: 2700, height: 1508, objectFit: "cover", maxWidth: "none", filter: "contrast(1.15) saturate(1.2)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(160,20,20,.0) 50%, rgba(120,10,10,.55))" }} />
    </div>
    <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
      <Img src={staticFile("v06/img/N67.jpg")} style={{ position: "absolute", left: -420, top: -40, width: 2500, height: 1396, objectFit: "cover", maxWidth: "none", filter: "contrast(1.15) saturate(1.15)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(70,20,110,0) 50%, rgba(70,20,110,.6))" }} />
    </div>
    <div style={{ position: "absolute", left: 950, top: 0, width: 20, height: 1080, background: "#e9c46a", boxShadow: "0 0 40px #e9c46a" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", direction: "rtl" }}><span style={{ font: `120px ${FONT_BLACK}`, color: "#fff", textShadow: "6px 6px 0 #000, 0 10px 40px #000" }}>۲۶ سال جنگ</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 120, textAlign: "center", direction: "rtl" }}><span style={{ font: `150px ${FONT_BLACK}`, color: "#FFD23F", textShadow: "7px 7px 0 #000, 0 10px 40px #000" }}>بی‌برنده!</span></div>
  </AbsoluteFill>
);

// ── v2 thumbnails in the channel signature (Darius cover): huge yellow Vazir Black with black outline, one face, bottom-right kept empty ──
const SIG = "0 0 3px #000, 7px 7px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 0 16px 50px rgba(0,0,0,.95)";
const T: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "#FFD23F", style }) => (
  <div style={{ position: "absolute", direction: "rtl", font: `${size}px/1.02 ${FONT_BLACK}`, color, textShadow: SIG, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; bg?: string }> = ({ children, style, bg = "#c1121f" }) => (
  <div style={{ position: "absolute", direction: "rtl", font: `54px ${FONT_TEXT}`, color: "#fff", background: bg, padding: "4px 28px 12px", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.7)", ...style }}>{children}</div>
);

// D · betrayal: the general reads the letter that orders his death (pattern 2/7, blue-orange)
export const V06ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <Img src={staticFile("v06/img/12.jpg")} style={{ position: "absolute", left: -900, top: -80, width: 3300, height: 1843, objectFit: "cover", maxWidth: "none", filter: "contrast(1.25) saturate(1.3) brightness(1.45)" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(0,0,0,0) 45%, rgba(4,14,34,.92) 72%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 66% 45%, rgba(255,150,40,.32), rgba(0,0,0,0) 45%)" }} />
    <T size={210} style={{ left: 70, top: 150 }}>نامه‌ی مرگ</T>
    <T size={120} color="#fff" style={{ left: 80, top: 420 }}>کی نوشت؟</T>
  </AbsoluteFill>
);

// E · the end of an age: empty Sasanian throne under the hanging crown (pattern 4, gold/dark purple)
export const V06ThumbE: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <Img src={staticFile("v06/img/N80.jpg")} style={{ position: "absolute", left: -560, top: -120, width: 3000, height: 1675, objectFit: "cover", maxWidth: "none", filter: "contrast(1.18) saturate(1.2) brightness(1.1)" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(30,8,40,.85), rgba(30,8,40,0) 45%), linear-gradient(90deg, rgba(20,6,30,.75), rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(20,6,30,.75))" }} />
    <div style={{ position: "absolute", left: 760, top: 120, width: 420, height: 420, background: "radial-gradient(circle, rgba(255,210,80,.35), rgba(0,0,0,0) 65%)" }} />
    <T size={190} style={{ right: 60, top: 60 }}>همه</T>
    <T size={190} style={{ right: 60, top: 260 }}>باختند!</T>
    <T size={110} color="#fff" style={{ left: 70, top: 80 }}>برنده‌ی واقعی؟</T>
  </AbsoluteFill>
);

// F · duel of empires: Khosrow (left, gold) vs Heraclius (right, purple) on the snow (pattern 3, purple/yellow)
export const V06ThumbF: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <Img src={staticFile("v06/img/13.jpg")} style={{ position: "absolute", left: -160, top: -60, width: 2240, height: 1251, objectFit: "cover", maxWidth: "none", filter: "contrast(1.15) saturate(1.3)" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(160,110,0,.28), rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(90,24,154,.4))" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,.8), rgba(0,0,0,0) 40%)" }} />
    <div style={{ position: "absolute", left: 900, top: 380, width: 170, height: 170, borderRadius: 100, background: "#c1121f", border: "8px solid #FFD23F", boxShadow: "0 0 50px rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", font: `80px ${FONT_BLACK}`, color: "#fff", paddingBottom: 14 }}>VS</div>
    <T size={170} style={{ left: 0, right: 0, bottom: 70, textAlign: "center" }}>فقط یکی ماند</T>
    <T size={70} color="#FFD23F" style={{ left: 60, top: 40 }}>خسرو</T>
    <T size={70} color="#e0c3ff" style={{ right: 60, top: 40 }}>هراکلیوس</T>
  </AbsoluteFill>
);

// G · map pattern (Kings & Generals / Invicta style): Persia at its 619 peak, three red arrows out of Ctesiphon
export const V06ThumbG: React.FC = () => {
  const C = [1117, 613];
  const arrows: [number, number, number][] = [[775, 670, -60], [600, 720, 90], [580, 300, -120]];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile("v06/map/thumb-map.jpg")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 45% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,.6))" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs><marker id="ah" markerWidth="5" markerHeight="5" refX="2.6" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#ff2a2a" stroke="#000" strokeWidth={0.4} /></marker></defs>
        {arrows.map(([x, y, bend], i) => {
          const mx = (C[0] + x) / 2, my = (C[1] + y) / 2 + bend;
          const d = `M${C[0]},${C[1]} Q${mx},${my} ${x},${y}`;
          return <g key={i}><path d={d} fill="none" stroke="#000" strokeWidth={34} strokeLinecap="round" opacity={0.55} /><path d={d} fill="none" stroke="#ff2a2a" strokeWidth={22} strokeLinecap="round" markerEnd="url(#ah)" /></g>;
        })}
        <circle cx={C[0]} cy={C[1]} r={26} fill="#FFD23F" stroke="#000" strokeWidth={6} />
      </svg>
      {[["تیسفون", C[0] + 40, C[1] + 20], ["اورشلیم", 640, 610], ["مصر", 470, 800], ["قسطنطنیه", 370, 220]].map(([t, x, y]) => (
        <div key={t as string} style={{ position: "absolute", left: x as number, top: y as number, direction: "rtl", font: `52px ${FONT_BLACK}`, color: "#fff", textShadow: "4px 4px 0 #000, -2px -2px 0 #000, 0 0 16px #000" }}>{t}</div>
      ))}
      <T size={180} style={{ right: 60, top: 40 }}>ایران تا مصر!</T>
      <Pill style={{ right: 70, top: 270 }}>و بعد...؟</Pill>
    </AbsoluteFill>
  );
};
