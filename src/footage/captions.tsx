// Word-by-word Persian captions for footage videos: the card under the playhead, each word lighting up as it is
// said, keywords in the accent colour, on a soft dark plate so it reads over any footage.
import React from "react";
import { useT } from "./footage";
import type { Chunk } from "./vo";

export const Captions: React.FC<{
  chunks: Chunk[];
  y: number;
  w?: number;
  size?: number;
  font: string;
  color?: string;
  accent?: string;
  plate?: boolean;
  /** widest a caption line may get (default: the frame minus 140 px) */
  max?: number;
}> = ({ chunks, y, w = 1080, size = 64, font, color = "#ffffff", accent = "#FFC24A", plate = true, max }) => {
  const t = useT();
  const c = chunks.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const k = Math.min(1, (t - c.s + 0.04) / 0.14);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: w, display: "flex", justifyContent: "center", transform: `translateY(${(1 - k) * 14}px)`, opacity: k }}>
      <div style={{ direction: "rtl", maxWidth: max ?? w - 140, textAlign: "center", font: `${size}px/${1.45} "${font}"`, color, padding: plate ? "10px 26px 14px" : 0, borderRadius: 22, background: plate ? "rgba(0,0,0,0.38)" : "none", textShadow: "0 3px 18px rgba(0,0,0,0.65)" }}>
        {c.words.map((x, i) => {
          const on = t >= x.s - 0.03;
          return (
            <span key={i} style={{ color: x.kw ? accent : color, opacity: on ? 1 : 0.42 }}>
              {x.w}
              {i < c.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
