// FogPoster · 9:16 reel / Shorts cover modelled on the misty movie-poster layout
// (lone figure from behind on a rock, a giant looming silhouette in the fog, tiny spaced kicker on top,
// big silver-white serif title in the middle, gold event line, channel badge). Text stays inside the reel safe area.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PF } from "../styles/photocopy-story";

export type FogPosterProps = { bg: string; bgPos?: string; kicker: string; title: string; titleSize?: number; gold: string; line: string; badge?: string; tint?: string; kickerTop?: number };

const SILVER = "linear-gradient(180deg, #ffffff 0%, #e9edf1 45%, #a9b3bd 75%, #f2f4f6 100%)";

export const FogPoster: React.FC<FogPosterProps> = ({ bg, bgPos = "50% 50%", kicker, title, titleSize = 230, gold, line, badge = "تاریخ جاوید", tint = "rgba(120,150,185,.22)", kickerTop = 262 }) => (
  <AbsoluteFill style={{ background: "#1b2229", overflow: "hidden" }}>
    <Img src={staticFile(bg)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover", objectPosition: bgPos, filter: "grayscale(.45) saturate(.9) contrast(1.1) brightness(1.03) hue-rotate(-6deg)" }} />
    <div style={{ position: "absolute", inset: 0, background: tint, mixBlendMode: "multiply" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(225,232,238,.55) 0%, rgba(225,232,238,0) 18%, rgba(0,0,0,0) 48%, rgba(10,14,18,.55) 62%, rgba(10,14,18,.25) 78%, rgba(10,14,18,.7) 100%)" }} />
    {/* tiny spaced kicker */}
    <div style={{ position: "absolute", top: kickerTop, left: 0, right: 0, textAlign: "center", direction: "rtl", fontFamily: PF.ui, fontWeight: 900, fontSize: 46, letterSpacing: 3, color: "#fff", textShadow: "0 2px 4px #000, 0 0 22px rgba(0,0,0,.9), 0 0 40px rgba(0,0,0,.6)" }}>{kicker}</div>
    {/* title block */}
    <div style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center", direction: "rtl" }}>
      <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: titleSize, lineHeight: 1.1, backgroundImage: SILVER, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.85))", whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginTop: 6 }}>
        <div style={{ width: 220, height: 3, background: "linear-gradient(90deg, rgba(255,255,255,0), #e9edf1)" }} />
        <div style={{ width: 16, height: 16, transform: "rotate(45deg)", background: "#e9c46a" }} />
        <div style={{ width: 220, height: 3, background: "linear-gradient(270deg, rgba(255,255,255,0), #e9edf1)" }} />
      </div>
      <div style={{ fontFamily: PF.ui, fontWeight: 900, fontSize: 50, color: "#f2c94c", marginTop: 22, textShadow: "0 3px 12px #000" }}>{gold}</div>
      <div style={{ fontFamily: PF.ui, fontWeight: 900, fontSize: 64, color: "#fff", marginTop: 4, textShadow: "0 4px 16px #000" }}>{line}</div>
    </div>
    {/* channel badge: logo + name */}
    <div style={{ position: "absolute", top: 1520, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, direction: "rtl" }}>
        <Img src={staticFile("covers/channel-logo.png")} style={{ width: 150, height: 150, borderRadius: 75, border: "4px solid #e9c46a", boxShadow: "0 0 26px rgba(233,196,106,.55), 0 6px 20px rgba(0,0,0,.9)" }} />
        <div style={{ fontFamily: PF.ui, fontWeight: 900, fontSize: 58, color: "#fff", textShadow: "0 3px 10px #000" }}>{badge}</div>
      </div>
    </div>
  </AbsoluteFill>
);
