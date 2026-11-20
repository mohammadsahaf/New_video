// Cover template "پوستر پررنگ" (bold magazine poster) — vertical 9:16, ref: Persepolis poster.
// Grunge tan paper, layered palette blocks, giant headline BEHIND a cut-out subject (depth), duotone photo,
// micro-labels with rules, issue tag, vertical edge text. Palette: ./palette.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT_TEXT, FONT_BLACK, FONT_NUM } from "../fonts";
import { RUG_TAN, RUG_WINE, RUG_NAVY, RUG_TEAL } from "./palette";
import { GrungeTexture } from "./ornaments";

export type BoldPosterProps = {
  cornerLeft: [string, string];   // top-right label (sits on the wine block)
  cornerCenter: [string, string];
  cornerRight: [string, string];  // top-left label
  title: string;
  hero: string; heroPos?: string;   // pre-toned duotone image (tools: out/duotone.py)
  cutout?: string;                // same image with transparent background (subject only), drawn over the title
  tint?: string;                  // duotone dark colour
  sideTop: [string, string];
  sideBottom: [string, string];
  issue?: string;                 // e.g. "۰۴"
  year?: string;                  // e.g. "۱۵۱۹"
  titleSize?: number;
  photoTop?: number;               // where the (clipped) background photo starts
  img?: { left: number; top: number; width: number; height: number }; // photo placement in poster coords (zoom/pan)
};

const Label: React.FC<{ lines: [string, string]; align: "right" | "center" | "left"; light?: boolean; size?: number }> = ({ lines, align, light, size = 26 }) => {
  const c = light ? RUG_TAN : RUG_WINE;
  return (
    <div style={{ textAlign: align, direction: "rtl", textShadow: light ? "0 2px 12px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.6)" : undefined }}>
      <div style={{ fontFamily: FONT_BLACK, fontSize: size, color: c, lineHeight: 1.2 }}>{lines[0]}</div>
      <div style={{ fontFamily: FONT_BLACK, fontSize: size, color: c, lineHeight: 1.2 }}>{lines[1]}</div>
      <div style={{ width: 40, height: 5, background: c, marginTop: 8, marginLeft: align === "left" ? 0 : "auto", marginRight: align === "right" ? 0 : "auto" }} />
    </div>
  );
};

export const BoldPoster: React.FC<BoldPosterProps> = ({ cornerLeft, cornerCenter, cornerRight, title, hero, heroPos = "50% 35%", cutout, tint = RUG_NAVY, sideTop, sideBottom, issue = "۰۱", year, titleSize = 300, photoTop = 470, img }) => {
  const box = img ?? { left: 0, top: photoTop, width: 1080, height: 1920 - photoTop };
  const photoStyle: React.CSSProperties = { position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, objectFit: "cover", objectPosition: heroPos, maxWidth: "none", maxHeight: "none" };
  return (
    <AbsoluteFill style={{ background: RUG_TAN, overflow: "hidden", direction: "rtl" }}>

      {/* layered colour blocks behind everything */}
      <div style={{ position: "absolute", right: 0, top: 0, width: 420, height: 760, background: RUG_WINE }} />
      <div style={{ position: "absolute", left: 0, top: 380, width: 300, height: 420, background: RUG_TEAL }} />

      {/* duotone photo */}
      <div style={{ position: "absolute", left: 0, top: photoTop, width: 1080, height: 1920 - photoTop, overflow: "hidden" }}>
        <Img src={staticFile(hero)} style={{ ...photoStyle, top: box.top - photoTop, filter: "none" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: photoTop, width: 1080, height: 360, background: `linear-gradient(180deg, ${RUG_TAN} 0%, rgba(205,169,143,0) 100%)`, opacity: 0.55 }} />
      {/* wine glow in the sky, like the red clouds of the reference */}
      <div style={{ position: "absolute", left: 0, top: photoTop, width: 1080, height: 700, background: `radial-gradient(ellipse 70% 60% at 30% 40%, ${RUG_WINE}cc 0%, ${RUG_WINE}00 70%)`, mixBlendMode: "multiply" }} />

      <div style={{ position: "absolute", left: 0, top: 1300, width: 1080, height: 620, background: `linear-gradient(180deg, rgba(6,24,46,0) 0%, ${tint}e6 100%)` }} />
      {/* foreground colour blocks (in front of the photo, behind the subject) */}
      <div style={{ position: "absolute", left: 0, top: 1560, width: 230, height: 360, background: RUG_WINE, opacity: 0.95 }} />
      <div style={{ position: "absolute", left: 230, top: 1760, width: 160, height: 160, background: RUG_NAVY, opacity: 0.95 }} />

      {/* giant headline: wine on the paper, tan where it crosses the wine block (split-colour print) */}
      {[
        { color: RUG_WINE, clip: "inset(0 440px 0 0)" },
        { color: RUG_TAN, clip: "inset(0 0 0 680px)" },
      ].map((l, i) => (
        <div key={i} style={{ position: "absolute", top: 150, left: -20, width: 1120, textAlign: "center", fontFamily: FONT_BLACK, fontSize: titleSize, lineHeight: 1, color: l.color, letterSpacing: -4, whiteSpace: "nowrap", clipPath: l.clip }}>
          {title}
        </div>
      ))}

      {/* cut-out subject over the title for depth */}
      {cutout && <Img src={staticFile(cutout)} style={{ ...photoStyle, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.45))" }} />}

      {/* top micro-labels */}
      <div style={{ position: "absolute", top: 48, right: 52 }}><Label lines={cornerLeft} align="right" light /></div>
      <div style={{ position: "absolute", top: 48, left: 0, right: 0, display: "flex", justifyContent: "center" }}><Label lines={cornerCenter} align="center" /></div>
      <div style={{ position: "absolute", top: 48, left: 52 }}><Label lines={cornerRight} align="left" /></div>

      {/* side labels on the photo */}
      <div style={{ position: "absolute", top: 1560, right: 52 }}><Label lines={sideTop} align="right" light size={30} /></div>
      <div style={{ position: "absolute", top: 1590, left: 40 }}><Label lines={sideBottom} align="left" light size={30} /></div>

      {/* issue tag + year */}
      <div style={{ position: "absolute", top: photoTop + 360, left: 52, direction: "rtl", textAlign: "left", color: RUG_TAN, textShadow: "0 2px 12px rgba(0,0,0,.85)" }}>
        <div style={{ fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 22, letterSpacing: 3 }}>شماره</div>
        <div style={{ fontFamily: FONT_NUM, fontSize: 92, lineHeight: 0.95 }}>{issue}</div>
        {year && <div style={{ fontFamily: FONT_BLACK, fontSize: 30, marginTop: 4 }}>{year}</div>}
      </div>

      {/* vertical edge text */}
      <div style={{ position: "absolute", right: 14, top: 1250, transform: "rotate(90deg)", transformOrigin: "right top", fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 20, letterSpacing: 6, color: RUG_TAN, whiteSpace: "nowrap", opacity: 0.85 }}>
        تاریخ جاوید · پرونده‌های تاریخ
      </div>

      <GrungeTexture id="bp" />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 160px rgba(10,4,4,.45)" }} />
    </AbsoluteFill>
  );
};
