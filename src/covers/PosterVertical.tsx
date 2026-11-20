// Channel cover style "documentary poster" — vertical 9:16 for reels / shorts (ref: Babylon travel poster).
// Bright golden hero with a dark serif title + short poem, carved profile on the right, stone tablet on the left,
// navy panel (icon, kicker, date), lower collage (framed relic + strip image), gold medallion, navy ornament band.
// Title sits below the top 14% (feed UI); everything important stays inside the centre 3:4 crop (y 240–1680).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PF } from "../styles/photocopy-story";

export type PosterVerticalProps = {
  hero: string; heroPos?: string;      // bright landscape with sky at the top
  title: string; subtitle: string; poem?: string[];
  profile: string; profilePos?: string; // carved / statue profile (right)
  tablet: string; tabletPos?: string;   // stone fragment (left)
  panelKicker: string; panelTitle: string; panelIcon?: React.ReactNode;
  frameLeft: string; frameLeftPos?: string; // framed relic (bottom-left)
  strip: string; stripPos?: string;         // scene strip (bottom-centre)
  medallion?: boolean;
};

const NAVY = "#14213f";
const GOLD = "#d9b25f";
const BROWN = "#4a2c10";
const GOLDTXT = "linear-gradient(180deg, #fff1c9 0%, #e8c477 45%, #a87a32 100%)";

const Rosette: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x},70) scale(${s})`}>
    {Array.from({ length: 12 }).map((_, i) => <ellipse key={i} cx={0} cy={-24} rx={8} ry={20} fill={GOLD} transform={`rotate(${i * 30})`} opacity={0.95} />)}
    <circle r={12} fill="#f3d98f" stroke={NAVY} strokeWidth={3} />
  </g>
);
const Lotus: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x},70)`} fill={GOLD}>
    <path d="M0 34 C -6 10, -6 -10, 0 -36 C 6 -10, 6 10, 0 34 Z" />
    <path d="M0 34 C -18 18, -30 -4, -34 -24 C -16 -14, -6 6, 0 34 Z" />
    <path d="M0 34 C 18 18, 30 -4, 34 -24 C 16 -14, 6 6, 0 34 Z" />
  </g>
);
const WingedDisc: React.FC<{ w?: number }> = ({ w = 260 }) => (
  <svg width={w} height={w * 0.42} viewBox="0 0 260 110">
    <g fill={GOLD}>
      <circle cx="130" cy="48" r="16" fill="none" stroke={GOLD} strokeWidth="5" />
      {[0, 1, 2, 3].map((i) => <path key={"l" + i} d={`M112 ${40 + i * 7} Q ${70 - i * 6} ${30 + i * 9}, ${14 + i * 16} ${26 + i * 12} Q ${70} ${48 + i * 6}, 112 ${46 + i * 7} Z`} />)}
      {[0, 1, 2, 3].map((i) => <path key={"r" + i} d={`M148 ${40 + i * 7} Q ${190 + i * 6} ${30 + i * 9}, ${246 - i * 16} ${26 + i * 12} Q ${190} ${48 + i * 6}, 148 ${46 + i * 7} Z`} />)}
      <path d="M118 66 L130 104 L142 66 Z" />
    </g>
  </svg>
);
const Medallion: React.FC<{ s: number }> = ({ s }) => {
  const nums = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۱۰", "۱۱", "۱۲"];
  return (
    <svg width={s} height={s} viewBox="0 0 400 400">
      <defs><radialGradient id="md" cx=".5" cy=".45"><stop offset="0" stopColor="#24356a" /><stop offset="1" stopColor="#0c1530" /></radialGradient></defs>
      <circle cx="200" cy="200" r="196" fill="#8a6224" />
      <circle cx="200" cy="200" r="186" fill="url(#md)" stroke="#e8c477" strokeWidth="8" />
      <circle cx="200" cy="200" r="140" fill="none" stroke="#c9a14f" strokeWidth="3" />
      {nums.map((n, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6; return <text key={n} x={200 + Math.cos(a) * 162} y={200 + Math.sin(a) * 162 + 12} fill="#e8c477" fontSize={34} fontFamily={PF.naskh} textAnchor="middle">{n}</text>; })}
      {Array.from({ length: 16 }).map((_, i) => <path key={i} d="M200 200 L192 120 L200 70 L208 120 Z" fill="#e8c477" opacity={i % 2 ? 0.55 : 1} transform={`rotate(${i * 22.5} 200 200) scale(1)`} />)}
      <circle cx="200" cy="200" r="34" fill="#f3d98f" stroke="#8a6224" strokeWidth="5" />
      <path d="M200 200 L300 120" stroke="#e8c477" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
};

export const PosterVertical: React.FC<PosterVerticalProps> = ({ hero, heroPos = "50% 30%", title, subtitle, poem = [], profile, profilePos = "70% 40%", tablet, tabletPos = "50% 50%", panelKicker, panelTitle, panelIcon, frameLeft, frameLeftPos = "50% 50%", strip, stripPos = "50% 50%", medallion = true }) => (
  <AbsoluteFill style={{ background: "#1a120a", overflow: "hidden" }}>
    {/* hero: army leaving Thebes under a golden sky */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1250, WebkitMaskImage: "linear-gradient(180deg,#000 80%,transparent)" }}>
      <Img src={staticFile(hero)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: heroPos, filter: "brightness(1.1) saturate(1.1)" }} />
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,238,200,.8) 0%, rgba(255,232,185,.62) 22%, rgba(255,226,170,.25) 36%, rgba(255,220,160,0) 46%)" }} />
    {/* title on the bright sky */}
    <div style={{ position: "absolute", top: 285, left: 0, right: 0, textAlign: "center", direction: "rtl" }}>
      <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: 168, lineHeight: 1.1, color: BROWN, textShadow: "0 2px 0 rgba(255,240,200,.6)" }}>{title}</div>
      <div style={{ fontFamily: PF.ui, fontWeight: 700, fontSize: 40, color: BROWN, marginTop: 4 }}>{subtitle}</div>
      <svg width="560" height="40" viewBox="0 0 560 40" style={{ marginTop: 10 }}>
        <path d="M20 20 H245 M315 20 H540" stroke={BROWN} strokeWidth="2.5" />
        <path d="M280 4 L292 20 L280 36 L268 20 Z" fill={BROWN} />
      </svg>
      <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: 40, lineHeight: 1.55, color: "#2e1a08", marginTop: 6, textShadow: "0 0 18px rgba(255,236,200,.9)" }}>
        {poem.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
    {/* stone profile (relief) on the right */}
    <div style={{ position: "absolute", right: -120, top: 760, width: 640, height: 760, WebkitMaskImage: "radial-gradient(ellipse at 55% 45%, #000 52%, transparent 72%)" }}>
      <Img src={staticFile(profile)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: profilePos, filter: "contrast(1.2) sepia(.35) brightness(1.05)" }} />
    </div>
    {/* stone tablet on the left */}
    <div style={{ position: "absolute", left: -10, top: 1070, width: 360, height: 330, clipPath: "polygon(6% 4%, 70% 0%, 96% 12%, 100% 70%, 88% 100%, 12% 96%, 0% 60%)", boxShadow: "0 20px 40px rgba(0,0,0,.6)" }}>
      <Img src={staticFile(tablet)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: tabletPos, filter: "contrast(1.15) sepia(.3)" }} />
    </div>
    {/* navy panel */}
    <div style={{ position: "absolute", left: 300, top: 1150, width: 480, height: 300, background: `linear-gradient(180deg, #1b2b55, ${NAVY})`, border: `3px solid ${GOLD}`, boxShadow: "0 18px 40px rgba(0,0,0,.6)", direction: "rtl", textAlign: "center", paddingTop: 22 }}>
      {panelIcon ?? <WingedDisc w={230} />}
      <div style={{ fontFamily: PF.ui, fontWeight: 600, fontSize: 30, color: GOLD, marginTop: 8 }}>{panelKicker}</div>
      <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: 64, lineHeight: 1.2, backgroundImage: GOLDTXT, WebkitBackgroundClip: "text", color: "transparent" }}>{panelTitle}</div>
    </div>
    {/* lower collage: Apis stele left, oasis city centre */}
    <div style={{ position: "absolute", left: 0, top: 1420, width: 400, height: 330, border: `4px solid ${GOLD}`, overflow: "hidden" }}>
      <Img src={staticFile(frameLeft)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: frameLeftPos, filter: "contrast(1.1) sepia(.25)" }} />
    </div>
    <div style={{ position: "absolute", left: 400, top: 1450, width: 680, height: 300, overflow: "hidden" }}>
      <Img src={staticFile(strip)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: stripPos, filter: "brightness(1.05)" }} />
    </div>
    {medallion && <div style={{ position: "absolute", right: -40, top: 1330, width: 420, height: 420, filter: "drop-shadow(0 16px 30px rgba(0,0,0,.7))" }}><Medallion s={420} /></div>}
    {/* ornament band */}
    <svg width={1080} height={170} style={{ position: "absolute", left: 0, top: 1750 }}>
      <rect width="1080" height="170" fill={NAVY} />
      <rect y="0" width="1080" height="10" fill={GOLD} /><rect y="160" width="1080" height="10" fill={GOLD} />
      <rect y="18" width="1080" height="3" fill={GOLD} opacity=".7" /><rect y="149" width="1080" height="3" fill={GOLD} opacity=".7" />
      {[70, 330, 750, 1010].map((x) => <Lotus key={x} x={x} />)}
      {[200, 880].map((x) => <Rosette key={x} x={x} s={1.1} />)}
      <circle cx="540" cy="85" r="60" fill="none" stroke={GOLD} strokeWidth="5" /><g transform="translate(0,15)"><Rosette x={540} s={1.25} /></g>
    </svg>
  </AbsoluteFill>
);
