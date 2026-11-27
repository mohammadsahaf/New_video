// V07 thumbnail E · the user's AI hero image (Elamite king, army, ziggurat) + giant gold title in the sky on the right.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT_BLACK, FONT_TEXT } from "../fonts";

const GOLD = "linear-gradient(180deg, #fff6d8 0%, #f4d98f 26%, #d4a24a 52%, #8a6224 78%, #f0cf82 100%)";

export const V07ThumbKing: React.FC = () => (
  <AbsoluteFill style={{ background: "#120c06", overflow: "hidden" }}>
    <Img src={staticFile("v07/thumb/hero-ext.jpg")} style={{ position: "absolute", left: -400, top: 0, width: 2562, height: 1080, maxWidth: "none", filter: "contrast(1.08) saturate(1.1)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(60,35,10,.0) 0%, rgba(60,35,10,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 82% 30%, rgba(255,215,140,.4) 0%, transparent 40%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(8,5,2,.55) 0%, transparent 26%)" }} />
    {/* thin gold frame */}
    <div style={{ position: "absolute", inset: 22, border: "2px solid rgba(240,212,142,.75)", boxShadow: "inset 0 0 0 6px rgba(8,5,2,.25)" }} />
    {/* title in the right sky */}
    <div style={{ position: "absolute", left: 1290, top: 40, width: 600, textAlign: "center", direction: "rtl", font: `330px/1 ${FONT_BLACK}`,
      backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 5px 0 #4a3010) drop-shadow(0 16px 34px rgba(30,15,0,.85))" }}>ایلام</div>
    <div style={{ position: "absolute", left: 1290, top: 380, width: 600, textAlign: "center", direction: "rtl", font: `74px/1.2 ${FONT_BLACK}`, color: "#fff7e0", textShadow: "0 0 4px #000, 5px 5px 0 #2a1704, 0 12px 34px rgba(0,0,0,.9)" }}>
      نامی که پاک نشد
    </div>
    <div style={{ position: "absolute", left: 1390, top: 482, width: 400, height: 3, background: "linear-gradient(90deg, transparent, #f0d48e, transparent)" }} />
    <div style={{ position: "absolute", left: 1290, top: 505, width: 600, textAlign: "center", direction: "rtl", font: `40px/1.4 ${FONT_TEXT}`, color: "#fff0cc", textShadow: "0 2px 14px #000, 0 0 4px #000" }}>
      شوش • نمک • نام
    </div>
  </AbsoluteFill>
);
