// Cover template "صفحه‌ی موزه" (museum plate) — vertical 9:16, ref: Sasanian gallery plate.
// Aged tan paper with stains + inset double rule frame, rug medallion, Nastaliq headline, arch painting framed
// by a rug border band, flourish caption, big dates around a winged crown, signature. Palette: ./palette.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT_TEXT, FONT_NASTALIQ, FONT_NUM, FONT_BLACK } from "../fonts";
import { RUG_TAN, RUG_WINE, RUG_GREEN, RUG_GOLD, RUG_NAVY } from "./palette";
import { PaperTexture, WingedCrown, RugBand, Flourish } from "./ornaments";

export type MuseumPlateProps = {
  title: string;           // big Nastaliq word (dynasty or hero)
  subtitle?: string;       // small line under the title
  hero: string; heroPos?: string;
  caption: string[];       // 2-3 line blurb under the frame
  dateLeft: string; labelLeft: string;
  dateRight: string; labelRight: string;
  signature?: string;
  note?: string;           // tiny line under the signature
  logo?: string;           // round channel logo at the top (public path)
};

const W = 1080;
const ARCH_X = 100, ARCH_Y = 500, ARCH_W = W - ARCH_X * 2, ARCH_H = 720;
const BAND = 24;

const Corner: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <svg width={70} height={70} viewBox="0 0 70 70" style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)` }}>
    <path d="M6 64 V22 Q6 6 22 6 H64" stroke={RUG_WINE} strokeWidth="2.4" fill="none" />
    <path d="M16 64 V30 Q16 16 30 16 H64" stroke={RUG_GOLD} strokeWidth="1.4" fill="none" />
    <path d="M22 22 L30 14 L38 22 L30 30 Z" fill={RUG_WINE} />
  </svg>
);

export const MuseumPlate: React.FC<MuseumPlateProps> = ({ title, subtitle, hero, heroPos = "50% 30%", caption, dateLeft, labelLeft, dateRight, labelRight, signature = "تاریخ جاوید", note, logo = "covers/channel-logo.png" }) => (
  <AbsoluteFill style={{ background: RUG_TAN, overflow: "hidden", direction: "rtl" }}>
    {/* paper: lighter centre, burnt edges */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(255,240,220,.38) 0%, rgba(255,240,220,0) 60%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(70,30,10,.38) 100%)" }} />
    <PaperTexture id="mp" />

    {/* inset double rule frame with corner ornaments */}
    <div style={{ position: "absolute", inset: 34, border: `2.5px solid ${RUG_WINE}` }} />
    <div style={{ position: "absolute", inset: 46, border: `1.2px solid ${RUG_GOLD}` }} />
    <Corner x={40} y={40} r={0} />
    <Corner x={W - 110} y={40} r={90} />
    <Corner x={W - 110} y={1920 - 110} r={180} />
    <Corner x={40} y={1920 - 110} r={270} />

    {/* medallion + headline */}
    <div style={{ position: "absolute", top: 66, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 124, height: 124, borderRadius: "50%", padding: 4, background: RUG_WINE, boxShadow: `0 0 0 2px ${RUG_GOLD}, 0 10px 22px rgba(40,12,6,.45)` }}>
        <Img src={staticFile(logo)} style={{ width: "100%", height: "100%", borderRadius: "50%", display: "block" }} />
      </div>
    </div>
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, height: 230, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_NASTALIQ, fontSize: 118, color: RUG_WINE, textShadow: "0 2px 0 rgba(255,235,210,.5)" }}>{title}</div>
    {subtitle && (
      <div style={{ position: "absolute", top: 392, left: 0, right: 0, textAlign: "center", fontFamily: FONT_TEXT, fontWeight: 700, fontSize: 27, letterSpacing: 2, color: RUG_GREEN }}>{subtitle}</div>
    )}

    {/* arch: wine outer rule, rug band, gold hairline, painting */}
    <div style={{ position: "absolute", left: ARCH_X - BAND - 8, top: ARCH_Y - BAND - 8, width: ARCH_W + (BAND + 8) * 2, height: ARCH_H + (BAND + 8) * 2, borderRadius: `${(ARCH_W + (BAND + 8) * 2) / 2}px ${(ARCH_W + (BAND + 8) * 2) / 2}px 6px 6px`, background: RUG_WINE, boxShadow: "0 24px 50px rgba(50,15,5,.45)" }} />
    {/* rug band ring (clip a band strip into the arch outline) */}
    <div style={{ position: "absolute", left: ARCH_X - BAND, top: ARCH_Y - BAND, width: ARCH_W + BAND * 2, height: ARCH_H + BAND * 2, borderRadius: `${(ARCH_W + BAND * 2) / 2}px ${(ARCH_W + BAND * 2) / 2}px 4px 4px`, overflow: "hidden" }}>
      {Array.from({ length: Math.ceil((ARCH_H + BAND * 2) / BAND) }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: i * BAND }}><RugBand w={ARCH_W + BAND * 2} h={BAND} /></div>
      ))}
    </div>
    <div style={{ position: "absolute", left: ARCH_X - 3, top: ARCH_Y - 3, width: ARCH_W + 6, height: ARCH_H + 6, borderRadius: `${(ARCH_W + 6) / 2}px ${(ARCH_W + 6) / 2}px 3px 3px`, background: RUG_GOLD }} />
    <div style={{ position: "absolute", left: ARCH_X, top: ARCH_Y, width: ARCH_W, height: ARCH_H, borderRadius: `${ARCH_W / 2}px ${ARCH_W / 2}px 2px 2px`, overflow: "hidden", background: RUG_NAVY }}>
      <Img src={staticFile(hero)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: heroPos, filter: "sepia(.32) saturate(1.15) contrast(1.08) brightness(1.02)" }} />
      {/* painting varnish + canvas texture */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(205,169,143,.18) 0%, rgba(58,14,10,0) 40%, rgba(58,14,10,.35) 100%)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 120px rgba(40,12,6,.55)" }} />
      <PaperTexture id="mp-canvas" grain={0.16} stain={0.0} />
    </div>

    {/* caption with flourish */}
    <div style={{ position: "absolute", top: ARCH_Y + ARCH_H + BAND + 36, left: 120, right: 120, textAlign: "center" }}>
      <Flourish w={420} color={RUG_WINE} />
      <div style={{ marginTop: 10, fontFamily: FONT_TEXT, fontSize: 29, lineHeight: 1.7, color: RUG_GREEN }}>
        {caption.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>

    {/* date row */}
    <div style={{ position: "absolute", top: 1500, left: 110, right: 110, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ textAlign: "center", minWidth: 220 }}>
        <div style={{ fontFamily: FONT_NUM, fontSize: 104, lineHeight: 1, color: RUG_WINE }}>{dateRight}</div>
        <div style={{ fontFamily: FONT_BLACK, fontSize: 40, lineHeight: 1.2, color: RUG_WINE, letterSpacing: 3 }}>{labelRight}</div>
      </div>
      <WingedCrown w={230} />
      <div style={{ textAlign: "center", minWidth: 220 }}>
        <div style={{ fontFamily: FONT_NUM, fontSize: 104, lineHeight: 1, color: RUG_WINE }}>{dateLeft}</div>
        <div style={{ fontFamily: FONT_BLACK, fontSize: 40, lineHeight: 1.2, color: RUG_WINE, letterSpacing: 3 }}>{labelLeft}</div>
      </div>
    </div>
    <div style={{ position: "absolute", top: 1680, left: 110, right: 110, height: 3, background: RUG_WINE }} />
    <div style={{ position: "absolute", top: 1688, left: 110, right: 110, height: 1, background: RUG_GOLD }} />

    {/* signature */}
    <div style={{ position: "absolute", top: 1706, left: 0, right: 0, textAlign: "center", color: RUG_WINE }}>
      <div style={{ fontFamily: FONT_BLACK, fontSize: 46, lineHeight: 1.15, letterSpacing: 2 }}>{signature}</div>
      {note && <div style={{ fontFamily: FONT_TEXT, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: RUG_GREEN }}>{note}</div>}
    </div>
  </AbsoluteFill>
);
