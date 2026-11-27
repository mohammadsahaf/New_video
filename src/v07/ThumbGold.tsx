// V07 thumbnail D · style taken from the user's "EGO" poster: huge cracked-gold-stone title, hero on a bright golden sky.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT_BLACK, FONT_TEXT } from "../fonts";

const GOLD = "linear-gradient(180deg, #fff6d8 0%, #f4d98f 28%, #c99a43 56%, #8a6224 80%, #e8c779 100%)";

export const V07ThumbGold: React.FC = () => (
  <AbsoluteFill style={{ background: "#120c06", overflow: "hidden" }}>
    <Img src={staticFile("v07/img/011.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.12) saturate(1.2) brightness(1.04)" }} />
    {/* darken the left so the gold word pops, warm glow behind the hero */}
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,5,2,.82) 0%, rgba(8,5,2,.55) 38%, rgba(8,5,2,0) 62%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 68% 24%, rgba(255,200,110,.38) 0%, transparent 42%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(8,5,2,.7) 0%, transparent 30%)" }} />
    {/* thin gold frame like the reference */}
    <div style={{ position: "absolute", inset: 22, border: "2px solid rgba(240,212,142,.7)", boxShadow: "inset 0 0 0 6px rgba(8,5,2,.35)" }} />
    {/* kicker */}
    <div style={{ position: "absolute", left: 80, top: 70, width: 900, textAlign: "center", direction: "rtl", font: `46px ${FONT_TEXT}`, color: "#f0d48e", letterSpacing: 6, textShadow: "0 4px 18px #000" }}>
      شوش • نمک • نام
    </div>
    {/* the word */}
    <div style={{ position: "absolute", left: 80, top: 150, width: 900, textAlign: "center", direction: "rtl", font: `460px/1 ${FONT_BLACK}`,
      backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 6px 0 #4a3010) drop-shadow(0 18px 40px rgba(0,0,0,.9))" }}>ایلام</div>
    {/* subtitle */}
    <div style={{ position: "absolute", left: 80, top: 640, width: 900, textAlign: "center", direction: "rtl", font: `88px/1.15 ${FONT_BLACK}`, color: "#fff4d6", textShadow: "0 0 4px #000, 6px 6px 0 #000, 0 14px 40px #000" }}>
      نامی که پاک نشد
    </div>
    <div style={{ position: "absolute", left: 80, top: 790, width: 900, textAlign: "center", direction: "rtl", font: `46px/1.5 ${FONT_TEXT}`, color: "#f0d48e", textShadow: "0 3px 14px #000" }}>
      آشوربانیپال خواست نامش را پاک کند
    </div>
    <div style={{ position: "absolute", left: 80, top: 850, width: 900, height: 3, background: "linear-gradient(90deg, transparent, #f0d48e, transparent)" }} />
  </AbsoluteFill>
);
